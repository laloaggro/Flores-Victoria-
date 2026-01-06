/**
 * @fileoverview Scheduled Tasks Manager
 * @description Sistema de tareas programadas interno
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  timezone: 'America/Lima',
  maxConcurrentJobs: 5,
  defaultRetries: 3,
  retryDelay: 5000, // ms
  lockTimeout: 300000, // 5 minutos
  logExecutions: true,
};

/**
 * Parser de expresiones cron simplificado
 * Soporta: * /5 (cada 5), 0-23, lista (1,2,3)
 */
class CronParser {
  /**
   * Parsea expresión cron
   * @param {string} expression - Expresión cron (min hour day month weekday)
   */
  static parse(expression) {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error(`Invalid cron expression: ${expression}`);
    }

    return {
      minute: this._parseField(parts[0], 0, 59),
      hour: this._parseField(parts[1], 0, 23),
      dayOfMonth: this._parseField(parts[2], 1, 31),
      month: this._parseField(parts[3], 1, 12),
      dayOfWeek: this._parseField(parts[4], 0, 6),
    };
  }

  /**
   * Parsea un campo individual
   * @private
   */
  static _parseField(field, min, max) {
    // Wildcard
    if (field === '*') {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }

    // Paso (*/5 o 0-23/2)
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      const stepNum = Number.parseInt(step, 10);
      const rangeValues =
        range === '*'
          ? Array.from({ length: max - min + 1 }, (_, i) => min + i)
          : this._parseField(range, min, max);
      return rangeValues.filter((v) => (v - min) % stepNum === 0);
    }

    // Rango (1-5)
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    // Lista (1,2,3)
    if (field.includes(',')) {
      return field.split(',').map(Number);
    }

    // Valor único
    return [Number.parseInt(field, 10)];
  }

  /**
   * Verifica si una fecha coincide con la expresión cron
   * @param {Object} parsed - Expresión parseada
   * @param {Date} date - Fecha a verificar
   */
  static matches(parsed, date) {
    return (
      parsed.minute.includes(date.getMinutes()) &&
      parsed.hour.includes(date.getHours()) &&
      parsed.dayOfMonth.includes(date.getDate()) &&
      parsed.month.includes(date.getMonth() + 1) &&
      parsed.dayOfWeek.includes(date.getDay())
    );
  }

  /**
   * Calcula próxima ejecución
   * @param {Object} parsed - Expresión parseada
   * @param {Date} from - Fecha desde
   * @returns {Date}
   */
  static nextRun(parsed, from = new Date()) {
    const next = new Date(from);
    next.setSeconds(0);
    next.setMilliseconds(0);
    next.setMinutes(next.getMinutes() + 1);

    // Buscar en los próximos 366 días
    for (let i = 0; i < 366 * 24 * 60; i++) {
      if (this.matches(parsed, next)) {
        return next;
      }
      next.setMinutes(next.getMinutes() + 1);
    }

    throw new Error('Could not calculate next run time');
  }
}

/**
 * Scheduled Job
 */
class ScheduledJob {
  constructor(name, config) {
    this.name = name;
    this.schedule = config.schedule;
    this.handler = config.handler;
    this.enabled = config.enabled !== false;
    this.retries = config.retries ?? DEFAULT_CONFIG.defaultRetries;
    this.timeout = config.timeout || DEFAULT_CONFIG.lockTimeout;
    this.exclusive = config.exclusive !== false; // Solo una instancia a la vez
    this.metadata = config.metadata || {};

    this.parsedSchedule = CronParser.parse(this.schedule);
    this.lastRun = null;
    this.nextRun = null;
    this.isRunning = false;
    this.stats = {
      runs: 0,
      successes: 0,
      failures: 0,
      totalDuration: 0,
    };

    this._calculateNextRun();
  }

  /**
   * Calcula próxima ejecución
   * @private
   */
  _calculateNextRun() {
    this.nextRun = CronParser.nextRun(this.parsedSchedule);
  }

  /**
   * Ejecuta el job
   * @returns {Promise<Object>}
   */
  async execute() {
    if (!this.enabled) {
      return { skipped: true, reason: 'disabled' };
    }

    if (this.exclusive && this.isRunning) {
      return { skipped: true, reason: 'already_running' };
    }

    this.isRunning = true;
    this.lastRun = new Date();
    const startTime = Date.now();
    let attempt = 0;
    let lastError = null;

    try {
      while (attempt <= this.retries) {
        try {
          const result = await this._executeWithTimeout(this.handler);
          const duration = Date.now() - startTime;

          this.stats.runs++;
          this.stats.successes++;
          this.stats.totalDuration += duration;

          return {
            success: true,
            result,
            duration,
            attempt: attempt + 1,
          };
        } catch (error) {
          lastError = error;
          attempt++;

          if (attempt <= this.retries) {
            console.warn(
              `[Scheduler] Job ${this.name} failed (attempt ${attempt}/${this.retries + 1}), retrying...`
            );
            await this._sleep(DEFAULT_CONFIG.retryDelay * attempt);
          }
        }
      }

      // Todos los reintentos fallaron
      this.stats.runs++;
      this.stats.failures++;

      return {
        success: false,
        error: lastError?.message,
        duration: Date.now() - startTime,
        attempts: attempt,
      };
    } finally {
      this.isRunning = false;
      this._calculateNextRun();
    }
  }

  /**
   * Ejecuta con timeout
   * @private
   */
  async _executeWithTimeout(handler) {
    return Promise.race([
      handler(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Job execution timeout')), this.timeout)
      ),
    ]);
  }

  /**
   * Sleep helper
   * @private
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Verifica si debe ejecutarse ahora
   */
  shouldRunNow() {
    if (!this.enabled || this.isRunning) return false;
    return this.nextRun && new Date() >= this.nextRun;
  }

  /**
   * Obtiene estadísticas
   */
  getStats() {
    return {
      name: this.name,
      enabled: this.enabled,
      schedule: this.schedule,
      isRunning: this.isRunning,
      lastRun: this.lastRun?.toISOString(),
      nextRun: this.nextRun?.toISOString(),
      stats: {
        ...this.stats,
        avgDuration:
          this.stats.runs > 0 ? Math.round(this.stats.totalDuration / this.stats.runs) : 0,
        successRate:
          this.stats.runs > 0 ? ((this.stats.successes / this.stats.runs) * 100).toFixed(1) : 0,
      },
    };
  }
}

/**
 * Task Scheduler
 */
class TaskScheduler {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.jobs = new Map();
    this.isRunning = false;
    this.checkInterval = null;
    this.executionHistory = [];
    this.maxHistoryLength = 100;
  }

  /**
   * Registra un nuevo job
   * @param {string} name - Nombre único del job
   * @param {Object} config - Configuración del job
   */
  register(name, config) {
    if (this.jobs.has(name)) {
      throw new Error(`Job '${name}' already registered`);
    }

    const job = new ScheduledJob(name, config);
    this.jobs.set(name, job);

    console.info(`[Scheduler] Registered job: ${name} (${config.schedule})`);
    return job;
  }

  /**
   * Elimina un job
   * @param {string} name - Nombre del job
   */
  unregister(name) {
    this.jobs.delete(name);
    console.info(`[Scheduler] Unregistered job: ${name}`);
  }

  /**
   * Inicia el scheduler
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.info('[Scheduler] Starting scheduler...');

    // Verificar jobs cada minuto
    this.checkInterval = setInterval(() => {
      this._checkAndRunJobs();
    }, 60000);

    // También verificar inmediatamente
    this._checkAndRunJobs();
  }

  /**
   * Detiene el scheduler
   */
  stop() {
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.info('[Scheduler] Scheduler stopped');
  }

  /**
   * Verifica y ejecuta jobs pendientes
   * @private
   */
  async _checkAndRunJobs() {
    const runningJobs = [...this.jobs.values()].filter((job) => job.isRunning).length;

    if (runningJobs >= this.config.maxConcurrentJobs) {
      return;
    }

    const pendingJobs = [...this.jobs.values()].filter((job) => job.shouldRunNow());

    for (const job of pendingJobs) {
      if (
        [...this.jobs.values()].filter((j) => j.isRunning).length >= this.config.maxConcurrentJobs
      ) {
        break;
      }

      this._runJob(job);
    }
  }

  /**
   * Ejecuta un job
   * @private
   */
  async _runJob(job) {
    if (this.config.logExecutions) {
      console.info(`[Scheduler] Running job: ${job.name}`);
    }

    const result = await job.execute();

    // Guardar en historial
    this._addToHistory({
      jobName: job.name,
      timestamp: new Date().toISOString(),
      ...result,
    });

    if (this.config.logExecutions) {
      if (result.success) {
        console.info(`[Scheduler] Job ${job.name} completed in ${result.duration}ms`);
      } else if (result.skipped) {
        console.debug(`[Scheduler] Job ${job.name} skipped: ${result.reason}`);
      } else {
        console.error(`[Scheduler] Job ${job.name} failed: ${result.error}`);
      }
    }

    return result;
  }

  /**
   * Añade entrada al historial
   * @private
   */
  _addToHistory(entry) {
    this.executionHistory.push(entry);
    if (this.executionHistory.length > this.maxHistoryLength) {
      this.executionHistory.shift();
    }
  }

  /**
   * Ejecuta un job manualmente
   * @param {string} name - Nombre del job
   */
  async runNow(name) {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job '${name}' not found`);
    }

    console.info(`[Scheduler] Manual execution of job: ${name}`);
    return this._runJob(job);
  }

  /**
   * Habilita un job
   * @param {string} name - Nombre del job
   */
  enable(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.enabled = true;
      console.info(`[Scheduler] Enabled job: ${name}`);
    }
  }

  /**
   * Deshabilita un job
   * @param {string} name - Nombre del job
   */
  disable(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.enabled = false;
      console.info(`[Scheduler] Disabled job: ${name}`);
    }
  }

  /**
   * Obtiene estado de todos los jobs
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobCount: this.jobs.size,
      jobs: [...this.jobs.values()].map((job) => job.getStats()),
      recentExecutions: this.executionHistory.slice(-10),
    };
  }

  /**
   * Obtiene estado de un job específico
   * @param {string} name - Nombre del job
   */
  getJobStatus(name) {
    const job = this.jobs.get(name);
    return job ? job.getStats() : null;
  }
}

/**
 * Jobs predefinidos para e-commerce
 */
const commonJobs = {
  // Limpiar sesiones expiradas
  cleanupExpiredSessions: {
    schedule: '0 3 * * *', // Diario a las 3am
    handler: async () => {
      console.info('[Job] Cleaning expired sessions...');
      // Implementar lógica de limpieza
    },
  },

  // Generar reporte diario
  generateDailyReport: {
    schedule: '0 6 * * *', // Diario a las 6am
    handler: async () => {
      console.info('[Job] Generating daily report...');
      // Implementar generación de reporte
    },
  },

  // Verificar stock bajo
  checkLowStock: {
    schedule: '0 */4 * * *', // Cada 4 horas
    handler: async () => {
      console.info('[Job] Checking low stock products...');
      // Implementar verificación de stock
    },
  },

  // Limpiar carritos abandonados
  cleanupAbandonedCarts: {
    schedule: '30 2 * * *', // Diario a las 2:30am
    handler: async () => {
      console.info('[Job] Cleaning abandoned carts...');
      // Implementar limpieza de carritos
    },
  },

  // Actualizar cache de productos populares
  refreshPopularProductsCache: {
    schedule: '*/30 * * * *', // Cada 30 minutos
    handler: async () => {
      console.info('[Job] Refreshing popular products cache...');
      // Implementar actualización de cache
    },
  },

  // Health check de servicios externos
  externalServicesHealthCheck: {
    schedule: '*/5 * * * *', // Cada 5 minutos
    handler: async () => {
      console.info('[Job] Checking external services health...');
      // Implementar health checks
    },
  },
};

// Instancia singleton
let defaultScheduler = null;

const getScheduler = (options) => {
  if (!defaultScheduler) {
    defaultScheduler = new TaskScheduler(options);
  }
  return defaultScheduler;
};

module.exports = {
  TaskScheduler,
  ScheduledJob,
  CronParser,
  getScheduler,
  commonJobs,
  DEFAULT_CONFIG,
};
