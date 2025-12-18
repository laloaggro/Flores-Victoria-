/**
 * Metrics Simple - Stub para producción
 * Proporciona middleware y endpoint de métricas básicos
 */

// Middleware de métricas (noop para simplicidad)
const metricsMiddleware = (serviceName) => {
  return (req, res, next) => {
    // Simplemente pasar al siguiente middleware
    next();
  };
};

// Endpoint de métricas básico
const metricsEndpoint = (serviceName) => {
  return (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`# HELP up Service is up
# TYPE up gauge
up{service="${serviceName}"} 1
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{service="${serviceName}"} 0
`);
  };
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
};
