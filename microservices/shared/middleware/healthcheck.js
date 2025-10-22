/**
 * Middleware de healthcheck común para todos los servicios
 * Proporciona endpoints /health, /ready y /metrics
 */

const os = require('os');

/**
 * Health check simple - Liveness probe
 * Verifica que el servicio está vivo
 */
const healthCheck = (serviceName) => {
  return (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
      node_version: process.version
    });
  };
};

/**
 * Readiness check - Readiness probe
 * Verifica que el servicio está listo para recibir tráfico
 */
const readinessCheck = (serviceName, checks = {}) => {
  return async (req, res) => {
    try {
      const results = {};
      let allHealthy = true;

      // Ejecutar checks personalizados
      for (const [name, checkFn] of Object.entries(checks)) {
        try {
          results[name] = await checkFn();
        } catch (error) {
          results[name] = { status: 'unhealthy', error: error.message };
          allHealthy = false;
        }
      }

      const response = {
        status: allHealthy ? 'ready' : 'not-ready',
        service: serviceName,
        timestamp: new Date().toISOString(),
        checks: results,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          unit: 'MB'
        }
      };

      res.status(allHealthy ? 200 : 503).json(response);
    } catch (error) {
      res.status(503).json({
        status: 'error',
        service: serviceName,
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  };
};

/**
 * Metrics endpoint
 * Proporciona métricas del servicio
 */
const metricsCheck = (serviceName, version = '1.0.0') => {
  const startTime = Date.now();
  let requestCount = 0;
  let errorCount = 0;

  return (req, res) => {
    requestCount++;

    const metrics = {
      service: serviceName,
      version: version,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(process.uptime()),
        readable: formatUptime(process.uptime())
      },
      process: {
        pid: process.pid,
        title: process.title,
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      memory: {
        heap_used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heap_total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        unit: 'MB'
      },
      cpu: {
        user: Math.round(process.cpuUsage().user / 1000),
        system: Math.round(process.cpuUsage().system / 1000),
        unit: 'ms'
      },
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        release: os.release(),
        total_memory: Math.round(os.totalmem() / 1024 / 1024),
        free_memory: Math.round(os.freemem() / 1024 / 1024),
        unit: 'MB',
        cpus: os.cpus().length,
        load_average: os.loadavg()
      },
      requests: {
        total: requestCount,
        errors: errorCount
      }
    };

    res.status(200).json(metrics);
  };
};

/**
 * Formatea el uptime en formato legible
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

module.exports = {
  healthCheck,
  readinessCheck,
  metricsCheck
};
