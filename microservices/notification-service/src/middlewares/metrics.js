// Middleware de Métricas para el Notification Service
const client = require('prom-client');

// Crear un Registry de métricas
const register = new client.Registry();

// Recoger métricas por defecto
client.collectDefaultMetrics({ register });

// Crear métricas personalizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Número total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code']
});

const emailSentTotal = new client.Counter({
  name: 'email_sent_total',
  help: 'Número total de emails enviados',
  labelNames: ['status']
});

// Registrar métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(emailSentTotal);

// Middleware para medir la duración de las solicitudes
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode;
    const method = req.method;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestTotal.inc({ method, route, status_code: statusCode });
  });
  
  next();
};

// Middleware para exponer las métricas
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  register,
  emailSentTotal
};