/**
 * @fileoverview Servicio de monitoreo centralizado
 * Recolecta métricas de todos los servicios y gestiona health checks
 */

const os = require('os');
const AlertService = require('./alertService');

/**
 * Estado de un servicio monitoreado
 */
const ServiceStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  UNKNOWN: 'unknown',
};

/**
 * Servicio de monitoreo
 */
class MonitoringService {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'monitoring';
    this.services = new Map();
    this.metrics = new Map();
    this.checkInterval = options.checkIntervalMs || 30000; // 30 seg
    this.alertService = new AlertService({ serviceName: this.serviceName });
    this.intervalId = null;
    this.startTime = Date.now();

    // Métricas del sistema
    this.systemMetrics = {
      cpu: [],
      memory: [],
      eventLoop: [],
    };
  }

  /**
   * Registrar un servicio para monitoreo
   */
  registerService(serviceConfig) {
    const service = {
      name: serviceConfig.name,
      url: serviceConfig.url,
      healthEndpoint: serviceConfig.healthEndpoint || '/health',
      timeout: serviceConfig.timeout || 5000,
      status: ServiceStatus.UNKNOWN,
      lastCheck: null,
      lastError: null,
      consecutiveFailures: 0,
      metrics: {
        responseTime: [],
        uptime: 0,
        totalChecks: 0,
        successfulChecks: 0,
      },
    };

    this.services.set(service.name, service);
    return this;
  }

  /**
   * Iniciar monitoreo periódico
   */
  start() {
    if (this.intervalId) {
      console.warn('Monitoring already started');
      return;
    }

    console.log(`🔍 Starting monitoring service (interval: ${this.checkInterval}ms)`);

    // Ejecutar inmediatamente
    this.runHealthChecks();

    // Configurar intervalo
    this.intervalId = setInterval(() => {
      this.runHealthChecks();
      this.collectSystemMetrics();
    }, this.checkInterval);

    return this;
  }

  /**
   * Detener monitoreo
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Monitoring service stopped');
    }
    return this;
  }

  /**
   * Ejecutar health checks de todos los servicios
   */
  async runHealthChecks() {
    const checks = [];

    for (const [name, service] of this.services) {
      checks.push(this._checkService(name, service));
    }

    const results = await Promise.allSettled(checks);

    // Evaluar alertas después de los checks
    await this._evaluateAlerts();

    return results;
  }

  /**
   * Verificar estado de un servicio
   */
  async _checkService(name, service) {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), service.timeout);

      const response = await fetch(`${service.url}${service.healthEndpoint}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'FloresVictoria-Monitoring/1.0',
        },
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        this._updateServiceStatus(service, ServiceStatus.HEALTHY, responseTime, data);
        service.consecutiveFailures = 0;
        this.alertService.resetHealthCheckFailures(name);
      } else {
        this._updateServiceStatus(service, ServiceStatus.DEGRADED, responseTime, {
          statusCode: response.status,
        });
        service.consecutiveFailures++;
        this.alertService.trackHealthCheckFailure(name);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this._updateServiceStatus(service, ServiceStatus.UNHEALTHY, responseTime, null, error);
      service.consecutiveFailures++;
      this.alertService.trackHealthCheckFailure(name);
      this.alertService.trackError(error);
    }

    return service;
  }

  /**
   * Actualizar estado de un servicio
   */
  _updateServiceStatus(service, status, responseTime, data = null, error = null) {
    service.status = status;
    service.lastCheck = new Date().toISOString();
    service.lastData = data;
    service.lastError = error?.message || null;
    service.metrics.totalChecks++;

    if (status === ServiceStatus.HEALTHY) {
      service.metrics.successfulChecks++;
    }

    // Guardar tiempo de respuesta (últimos 100)
    service.metrics.responseTime.push(responseTime);
    if (service.metrics.responseTime.length > 100) {
      service.metrics.responseTime.shift();
    }

    // Calcular uptime
    service.metrics.uptime =
      (service.metrics.successfulChecks / service.metrics.totalChecks) * 100;
  }

  /**
   * Evaluar alertas basadas en el estado actual
   */
  async _evaluateAlerts() {
    for (const [name, service] of this.services) {
      const context = {
        serviceName: name,
        consecutiveFailures: service.consecutiveFailures,
        status: service.status,
        responseTime: service.metrics.responseTime.slice(-1)[0] || 0,
        uptime: service.metrics.uptime,
      };

      await this.alertService.evaluate(context);
    }
  }

  /**
   * Recolectar métricas del sistema
   */
  collectSystemMetrics() {
    const cpuUsage = os.loadavg()[0]; // 1 min average
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercent = (usedMem / totalMem) * 100;

    const metrics = {
      timestamp: Date.now(),
      cpu: {
        loadAvg1m: cpuUsage,
        loadAvg5m: os.loadavg()[1],
        loadAvg15m: os.loadavg()[2],
        cores: os.cpus().length,
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percent: memoryPercent,
      },
      process: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        pid: process.pid,
      },
    };

    // Guardar histórico (últimos 100)
    this.systemMetrics.cpu.push({ timestamp: metrics.timestamp, value: cpuUsage });
    this.systemMetrics.memory.push({ timestamp: metrics.timestamp, value: memoryPercent });

    if (this.systemMetrics.cpu.length > 100) this.systemMetrics.cpu.shift();
    if (this.systemMetrics.memory.length > 100) this.systemMetrics.memory.shift();

    // Evaluar alertas de sistema
    this.alertService.evaluate({
      cpuUsagePercent: cpuUsage * 100 / os.cpus().length, // Normalizado
      memoryUsagePercent: memoryPercent,
    });

    return metrics;
  }

  /**
   * Obtener resumen del estado de todos los servicios
   */
  getServicesStatus() {
    const services = [];

    for (const [name, service] of this.services) {
      services.push({
        name,
        status: service.status,
        lastCheck: service.lastCheck,
        consecutiveFailures: service.consecutiveFailures,
        uptime: service.metrics.uptime.toFixed(2) + '%',
        avgResponseTime: this._calculateAvg(service.metrics.responseTime).toFixed(0) + 'ms',
        lastError: service.lastError,
      });
    }

    return {
      timestamp: new Date().toISOString(),
      healthy: services.filter((s) => s.status === ServiceStatus.HEALTHY).length,
      degraded: services.filter((s) => s.status === ServiceStatus.DEGRADED).length,
      unhealthy: services.filter((s) => s.status === ServiceStatus.UNHEALTHY).length,
      unknown: services.filter((s) => s.status === ServiceStatus.UNKNOWN).length,
      services,
    };
  }

  /**
   * Obtener métricas del sistema
   */
  getSystemMetrics() {
    const latest = this.collectSystemMetrics();

    return {
      current: latest,
      history: {
        cpu: this.systemMetrics.cpu,
        memory: this.systemMetrics.memory,
      },
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Obtener alertas activas
   */
  getActiveAlerts() {
    return this.alertService.getActiveAlerts();
  }

  /**
   * Obtener historial de alertas
   */
  getAlertHistory(limit) {
    return this.alertService.getAlertHistory(limit);
  }

  /**
   * Configurar canal de alertas
   */
  configureAlertChannel(channel, config) {
    this.alertService.configureChannel(channel, config);
    return this;
  }

  /**
   * Calcular promedio de un array
   */
  _calculateAvg(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Obtener resumen completo del dashboard
   */
  getDashboardSummary() {
    const servicesStatus = this.getServicesStatus();
    const systemMetrics = this.getSystemMetrics();
    const alerts = this.getActiveAlerts();

    return {
      timestamp: new Date().toISOString(),
      overview: {
        totalServices: this.services.size,
        healthyServices: servicesStatus.healthy,
        degradedServices: servicesStatus.degraded,
        unhealthyServices: servicesStatus.unhealthy,
        activeAlerts: alerts.length,
        systemUptime: systemMetrics.uptime,
      },
      services: servicesStatus.services,
      system: systemMetrics.current,
      alerts: alerts.slice(0, 10),
    };
  }

  /**
   * Crear middleware de métricas para Express
   */
  createMetricsMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.alertService.trackLatency(duration);

        // Track errors
        if (res.statusCode >= 500) {
          this.alertService.trackError(new Error(`HTTP ${res.statusCode}`));
        }
      });

      next();
    };
  }

  /**
   * Crear router de Express para endpoints de monitoreo
   */
  createRouter() {
    const express = require('express');
    const router = express.Router();

    // Dashboard summary
    router.get('/dashboard', (req, res) => {
      res.json(this.getDashboardSummary());
    });

    // Services status
    router.get('/services', (req, res) => {
      res.json(this.getServicesStatus());
    });

    // System metrics
    router.get('/system', (req, res) => {
      res.json(this.getSystemMetrics());
    });

    // Active alerts
    router.get('/alerts', (req, res) => {
      res.json({
        active: this.getActiveAlerts(),
        history: this.getAlertHistory(parseInt(req.query.limit) || 50),
      });
    });

    // Force health check
    router.post('/health-check', async (req, res) => {
      await this.runHealthChecks();
      res.json(this.getServicesStatus());
    });

    // Prometheus metrics format
    router.get('/metrics', (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(this._generatePrometheusMetrics());
    });

    return router;
  }

  /**
   * Generar métricas en formato Prometheus
   */
  _generatePrometheusMetrics() {
    const systemMetrics = this.collectSystemMetrics();
    const servicesStatus = this.getServicesStatus();

    let output = `# HELP monitoring_uptime_seconds Monitoring service uptime
# TYPE monitoring_uptime_seconds gauge
monitoring_uptime_seconds ${(Date.now() - this.startTime) / 1000}

# HELP system_cpu_load_avg System CPU load average (1m)
# TYPE system_cpu_load_avg gauge
system_cpu_load_avg ${systemMetrics.cpu.loadAvg1m}

# HELP system_memory_used_bytes System memory used
# TYPE system_memory_used_bytes gauge
system_memory_used_bytes ${systemMetrics.memory.used}

# HELP system_memory_percent System memory usage percentage
# TYPE system_memory_percent gauge
system_memory_percent ${systemMetrics.memory.percent.toFixed(2)}

# HELP service_status Service health status (1=healthy, 0.5=degraded, 0=unhealthy)
# TYPE service_status gauge
`;

    for (const service of servicesStatus.services) {
      const statusValue = service.status === 'healthy' ? 1 : service.status === 'degraded' ? 0.5 : 0;
      output += `service_status{service="${service.name}"} ${statusValue}\n`;
    }

    output += `
# HELP service_uptime_percent Service uptime percentage
# TYPE service_uptime_percent gauge
`;

    for (const service of servicesStatus.services) {
      output += `service_uptime_percent{service="${service.name}"} ${parseFloat(service.uptime)}\n`;
    }

    output += `
# HELP service_response_time_ms Service average response time
# TYPE service_response_time_ms gauge
`;

    for (const service of servicesStatus.services) {
      output += `service_response_time_ms{service="${service.name}"} ${parseFloat(service.avgResponseTime)}\n`;
    }

    output += `
# HELP active_alerts_total Total active alerts
# TYPE active_alerts_total gauge
active_alerts_total ${this.getActiveAlerts().length}
`;

    return output;
  }
}

// Exportar
module.exports = MonitoringService;
module.exports.ServiceStatus = ServiceStatus;
