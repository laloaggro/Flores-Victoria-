const client = require('prom-client');

// Crear un registro para las métricas
const register = new client.Registry();

// Recopilar métricas por defecto
client.collectDefaultMetrics({ register });

// Crear métricas personalizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

const activeRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Número de solicitudes HTTP activas',
});

// Registrar todas las métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeRequests);

// Middleware para rastrear métricas
const metricsMiddleware = (req, res, next) => {
  // Incrementar el contador de solicitudes activas
  activeRequests.inc();

  // Marcar el tiempo de inicio
  const startTime = Date.now();

  // Registrar cuando la respuesta termina
  res.on('finish', () => {
    // Disminuir el contador de solicitudes activas
    activeRequests.dec();

    // Calcular la duración
    const duration = (Date.now() - startTime) / 1000;

    // Registrar las métricas
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route ? req.route.path : req.path,
        status_code: res.statusCode,
      },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    });
  });

  next();
};

// Función para obtener las métricas en formato Prometheus
const getMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  register,
};
