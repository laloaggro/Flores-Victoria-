/**
 * @fileoverview Status Aggregator
 * @description Agregación de healthchecks de todos los microservicios
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  checkInterval: 30000, // 30 segundos
  timeout: 5000, // 5 segundos por servicio
  retries: 2,
  degradedThreshold: 200, // ms para considerar degradado
  incidentRetentionDays: 30,
};

/**
 * Estados de servicio
 */
const ServiceStatus = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  PARTIAL_OUTAGE: 'partial_outage',
  MAJOR_OUTAGE: 'major_outage',
  MAINTENANCE: 'maintenance',
  UNKNOWN: 'unknown',
};

/**
 * Status Aggregator
 */
class StatusAggregator {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.services = new Map();
    this.incidents = [];
    this.uptimeData = new Map();
    this.lastCheck = null;
    this.checkTimer = null;
  }

  /**
   * Registra un servicio para monitorear
   * @param {string} name - Nombre del servicio
   * @param {Object} config - Configuración del servicio
   */
  registerService(name, config) {
    this.services.set(name, {
      name,
      displayName: config.displayName || name,
      description: config.description || '',
      healthUrl: config.healthUrl,
      critical: config.critical !== false,
      group: config.group || 'core',
      status: ServiceStatus.UNKNOWN,
      responseTime: null,
      lastCheck: null,
      lastError: null,
      consecutiveFailures: 0,
    });

    // Inicializar datos de uptime
    this.uptimeData.set(name, {
      checks: 0,
      successes: 0,
      totalResponseTime: 0,
    });

    console.info(`[StatusAggregator] Registered service: ${name}`);
  }

  /**
   * Inicia el monitoreo
   */
  start() {
    console.info('[StatusAggregator] Starting status monitoring...');
    this.checkTimer = setInterval(() => this.checkAll(), this.config.checkInterval);
    this.checkAll(); // Verificar inmediatamente
  }

  /**
   * Detiene el monitoreo
   */
  stop() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    console.info('[StatusAggregator] Status monitoring stopped');
  }

  /**
   * Verifica todos los servicios
   */
  async checkAll() {
    const promises = [...this.services.keys()].map((name) => this.checkService(name));
    await Promise.allSettled(promises);
    this.lastCheck = new Date().toISOString();
  }

  /**
   * Verifica un servicio individual
   * @param {string} name - Nombre del servicio
   */
  async checkService(name) {
    const service = this.services.get(name);
    if (!service) return;

    const startTime = Date.now();
    let attempts = 0;
    let lastError = null;

    while (attempts <= this.config.retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(service.healthUrl, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;
        const data = await response.json().catch(() => ({}));

        // Actualizar estado
        const previousStatus = service.status;

        if (response.ok) {
          service.status =
            responseTime > this.config.degradedThreshold
              ? ServiceStatus.DEGRADED
              : ServiceStatus.OPERATIONAL;
          service.consecutiveFailures = 0;
        } else {
          service.status = ServiceStatus.PARTIAL_OUTAGE;
          service.consecutiveFailures++;
        }

        service.responseTime = responseTime;
        service.lastCheck = new Date().toISOString();
        service.lastError = null;
        service.healthData = data;

        // Actualizar uptime
        this._updateUptime(name, true, responseTime);

        // Crear incidente si cambió estado
        if (previousStatus !== service.status && previousStatus !== ServiceStatus.UNKNOWN) {
          this._recordStatusChange(service, previousStatus);
        }

        return;
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts <= this.config.retries) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    // Falló después de todos los reintentos
    const previousStatus = service.status;
    service.status = ServiceStatus.MAJOR_OUTAGE;
    service.consecutiveFailures++;
    service.lastCheck = new Date().toISOString();
    service.lastError = lastError?.message || 'Unknown error';
    service.responseTime = null;

    this._updateUptime(name, false);

    if (previousStatus !== service.status && previousStatus !== ServiceStatus.UNKNOWN) {
      this._recordStatusChange(service, previousStatus);
    }
  }

  /**
   * Actualiza datos de uptime
   * @private
   */
  _updateUptime(name, success, responseTime = 0) {
    const data = this.uptimeData.get(name);
    if (data) {
      data.checks++;
      if (success) {
        data.successes++;
        data.totalResponseTime += responseTime;
      }
    }
  }

  /**
   * Registra cambio de estado
   * @private
   */
  _recordStatusChange(service, previousStatus) {
    const incident = {
      id: `inc-${Date.now()}`,
      serviceName: service.name,
      serviceDisplayName: service.displayName,
      previousStatus,
      newStatus: service.status,
      timestamp: new Date().toISOString(),
      message: this._getStatusMessage(service.status, service.name),
      resolved: service.status === ServiceStatus.OPERATIONAL,
    };

    this.incidents.unshift(incident);

    // Limpiar incidentes antiguos
    const cutoff = Date.now() - this.config.incidentRetentionDays * 24 * 60 * 60 * 1000;
    this.incidents = this.incidents.filter((i) => new Date(i.timestamp).getTime() > cutoff);

    console.info(
      `[StatusAggregator] Status change: ${service.name} ${previousStatus} -> ${service.status}`
    );
  }

  /**
   * Genera mensaje de estado
   * @private
   */
  _getStatusMessage(status, serviceName) {
    const messages = {
      [ServiceStatus.OPERATIONAL]: `${serviceName} is now operational`,
      [ServiceStatus.DEGRADED]: `${serviceName} is experiencing degraded performance`,
      [ServiceStatus.PARTIAL_OUTAGE]: `${serviceName} is experiencing a partial outage`,
      [ServiceStatus.MAJOR_OUTAGE]: `${serviceName} is experiencing a major outage`,
      [ServiceStatus.MAINTENANCE]: `${serviceName} is under maintenance`,
    };
    return messages[status] || `${serviceName} status changed`;
  }

  /**
   * Establece mantenimiento para un servicio
   * @param {string} name - Nombre del servicio
   * @param {boolean} active - Si está en mantenimiento
   */
  setMaintenance(name, active) {
    const service = this.services.get(name);
    if (service) {
      const previousStatus = service.status;
      service.status = active ? ServiceStatus.MAINTENANCE : ServiceStatus.UNKNOWN;
      if (previousStatus !== service.status) {
        this._recordStatusChange(service, previousStatus);
      }
    }
  }

  /**
   * Obtiene estado global del sistema
   * @returns {Object}
   */
  getOverallStatus() {
    const statuses = [...this.services.values()].map((s) => s.status);

    if (statuses.some((s) => s === ServiceStatus.MAJOR_OUTAGE)) {
      return ServiceStatus.MAJOR_OUTAGE;
    }
    if (statuses.some((s) => s === ServiceStatus.PARTIAL_OUTAGE)) {
      return ServiceStatus.PARTIAL_OUTAGE;
    }
    if (statuses.some((s) => s === ServiceStatus.DEGRADED)) {
      return ServiceStatus.DEGRADED;
    }
    if (statuses.some((s) => s === ServiceStatus.MAINTENANCE)) {
      return ServiceStatus.MAINTENANCE;
    }
    if (statuses.every((s) => s === ServiceStatus.OPERATIONAL)) {
      return ServiceStatus.OPERATIONAL;
    }
    return ServiceStatus.UNKNOWN;
  }

  /**
   * Calcula uptime de un servicio
   * @param {string} name - Nombre del servicio
   * @returns {number} Porcentaje de uptime
   */
  getUptime(name) {
    const data = this.uptimeData.get(name);
    if (!data || data.checks === 0) return 100;
    return ((data.successes / data.checks) * 100).toFixed(2);
  }

  /**
   * Obtiene tiempo de respuesta promedio
   * @param {string} name - Nombre del servicio
   * @returns {number}
   */
  getAverageResponseTime(name) {
    const data = this.uptimeData.get(name);
    if (!data || data.successes === 0) return 0;
    return Math.round(data.totalResponseTime / data.successes);
  }

  /**
   * Obtiene resumen completo de estado
   * @returns {Object}
   */
  getStatusSummary() {
    const services = [...this.services.values()].map((service) => ({
      name: service.name,
      displayName: service.displayName,
      description: service.description,
      group: service.group,
      status: service.status,
      responseTime: service.responseTime,
      lastCheck: service.lastCheck,
      uptime: this.getUptime(service.name),
      avgResponseTime: this.getAverageResponseTime(service.name),
      critical: service.critical,
    }));

    // Agrupar por categoría
    const grouped = services.reduce((acc, service) => {
      if (!acc[service.group]) acc[service.group] = [];
      acc[service.group].push(service);
      return acc;
    }, {});

    return {
      overallStatus: this.getOverallStatus(),
      lastCheck: this.lastCheck,
      services: grouped,
      serviceCount: {
        total: services.length,
        operational: services.filter((s) => s.status === ServiceStatus.OPERATIONAL).length,
        degraded: services.filter((s) => s.status === ServiceStatus.DEGRADED).length,
        outage: services.filter(
          (s) =>
            s.status === ServiceStatus.MAJOR_OUTAGE || s.status === ServiceStatus.PARTIAL_OUTAGE
        ).length,
      },
      recentIncidents: this.incidents.slice(0, 10),
      uptimeOverall: this._calculateOverallUptime(),
    };
  }

  /**
   * Calcula uptime global
   * @private
   */
  _calculateOverallUptime() {
    const uptimes = [...this.services.keys()].map((name) => parseFloat(this.getUptime(name)));
    if (uptimes.length === 0) return '100.00';
    return (uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(2);
  }
}

/**
 * Crea middleware Express para endpoint de status
 */
const statusMiddleware = (aggregator) => {
  return (req, res) => {
    const summary = aggregator.getStatusSummary();

    // Headers de cache corto
    res.setHeader('Cache-Control', 'public, max-age=30');

    // Status code basado en estado global
    const statusCode =
      summary.overallStatus === ServiceStatus.OPERATIONAL
        ? 200
        : summary.overallStatus === ServiceStatus.DEGRADED
          ? 200
          : 503;

    res.status(statusCode).json(summary);
  };
};

module.exports = {
  StatusAggregator,
  statusMiddleware,
  ServiceStatus,
  DEFAULT_CONFIG,
};
