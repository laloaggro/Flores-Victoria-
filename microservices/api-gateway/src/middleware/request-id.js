const { v4: uuidv4 } = require('uuid');

const { createLogger } = require('../../shared/utils/logger');

const logger = createLogger('api-gateway');

/**
 * Middleware para agregar Request ID a todas las peticiones
 * Permite rastrear una petición a través de múltiples microservicios
 */
const requestIdMiddleware = (req, res, next) => {
  // Usar Request ID del header si existe, sino generar uno nuevo
  const requestId = req.get('X-Request-ID') || uuidv4();

  // Agregar Request ID al objeto request
  req.id = requestId;

  // Agregar Request ID a los headers de respuesta
  res.setHeader('X-Request-ID', requestId);

  // Logging
  logger.info('Request received', {
    requestId,
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
    logger.logRequest(req, res, duration);
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
