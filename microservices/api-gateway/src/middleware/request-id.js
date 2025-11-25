const { randomUUID } = require('crypto');
const {
  logger: { createLogger },
} = require('@flores-victoria/shared');

// Logger centralizado para API Gateway
const logger = createLogger('api-gateway');

/**
 * Middleware para agregar Request ID a todas las peticiones
 * Permite rastrear una petición a través de múltiples microservicios
 */
const requestIdMiddleware = (req, res, next) => {
  // Usar Request ID del header si existe, sino generar uno nuevo
  const requestId = req.get('X-Request-ID') || randomUUID();

  // Agregar Request ID al objeto request
  req.id = requestId;

  // Asegurar que el ID también viaje en los headers de salida y en proxys
  // Esto permite que utilidades que copian req.headers hacia downstream lo propaguen automáticamente
  try {
    req.headers['x-request-id'] = requestId;
  } catch (_) {
    // no-op si headers es de solo lectura en algún entorno raro
  }

  // Agregar Request ID a los headers de respuesta
  res.setHeader('X-Request-ID', requestId);

  // Logging con requestId
  const reqLogger = logger.withRequestId(requestId);
  reqLogger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  next();
};

/**
 * Middleware para logging de requests HTTP
 * Captura el tiempo de respuesta y logs estructurados
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capturar cuando la respuesta termine
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const reqLogger = logger.withRequestId(req.id);
    reqLogger.info('Request completed', {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};

/**
 * Middleware para agregar Request ID a proxies
 * Pasa el Request ID a servicios downstream
 */
const propagateRequestId = (proxyReq, req) => {
  if (req.id) {
    proxyReq.setHeader('X-Request-ID', req.id);
  }
};

module.exports = {
  requestIdMiddleware,
  requestLogger,
  propagateRequestId,
};
