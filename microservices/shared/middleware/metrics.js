/**
 * Metrics Middleware using Prometheus
 */

const promClient = require('prom-client');

// Registry
const register = new promClient.Registry();

// Default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Initialize metrics for a service
 */
const initMetrics = (serviceName) => {
  register.setDefaultLabels({ service: serviceName });
  return { registry: register };
};

/**
 * Middleware to collect metrics
 */
const metricsMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route ? req.route.path : req.path;
      const labels = {
        method: req.method,
        route,
        status_code: res.statusCode,
      };

      httpRequestDuration.observe(labels, duration);
      httpRequestTotal.inc(labels);
    });

    next();
  };
};

/**
 * Endpoint to expose metrics
 */
const metricsEndpoint = () => {
  return async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  };
};

module.exports = {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
  register,
};
