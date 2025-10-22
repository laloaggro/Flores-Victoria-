const client = require('prom-client');

// Configurar colección por defecto de métricas de Node.js
client.collectDefaultMetrics({ timeout: 5000 });

// Crear métricas personalizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

const activeRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Número de solicitudes HTTP activas',
  labelNames: ['method', 'route'],
});

/**
 * Middleware para métricas de Prometheus
 */
const prometheusMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const route = req.route ? req.route.path : req.path;

  // Incrementar contador de solicitudes activas
  activeRequests.inc({ method: req.method, route });

  // Registrar cuando la respuesta se complete
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // Convertir a segundos

    // Decrementar contador de solicitudes activas
    activeRequests.dec({ method: req.method, route });

    // Registrar duración y contador de solicitudes
    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });

  next();
};

/**
 * Obtener métricas en formato Prometheus
 */
const getMetrics = async () => await client.register.metrics();

/**
 * Obtener tipo de contenido para métricas de Prometheus
 */
const getMetricsContentType = () => client.register.contentType;

module.exports = {
  prometheusMiddleware,
  getMetrics,
  getMetricsContentType,
};
