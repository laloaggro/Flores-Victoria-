const client = require('prom-client');

// Crear registro de métricas
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Crear métricas personalizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpResponseSize = new client.Histogram({
  name: 'http_response_size_bytes',
  help: 'Tamaño de las respuestas HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware para medir duración de solicitudes
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function (data) {
    const duration = Date.now() - start;
    const size = Buffer.byteLength(data);
    
    httpRequestDuration.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).observe(duration / 1000);
    httpRequestTotal.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).inc();
    httpResponseSize.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).observe(size);
    
    originalSend.call(this, data);
  };
  
  next();
};

// Endpoint para exponer métricas
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  register
};