const client = require('prom-client');

// Crear un registro para las métricas
const register = new client.Registry();

// Configurar métricas por defecto
client.collectDefaultMetrics({ register });

// Crear métricas personalizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware de métricas
function metricsMiddleware(serviceName) {
  // Agregar el nombre del servicio como etiqueta
  register.setDefaultLabels({
    service: serviceName
  });

  return (req, res, next) => {
    const startTime = Date.now();

    // Registrar la solicitud al finalizar
    res.on('finish', () => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // Convertir a segundos
      
      const method = req.method;
      const route = req.route ? req.route.path : req.path || 'unknown';
      const statusCode = res.statusCode;

      // Actualizar métricas
      httpRequestDuration.labels(method, route, statusCode).observe(duration);
      httpRequestTotal.labels(method, route, statusCode).inc();
    });

    next();
  };
}

module.exports = metricsMiddleware;
module.exports.register = register;