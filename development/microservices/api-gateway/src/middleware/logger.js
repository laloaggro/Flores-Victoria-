const winston = require('winston');

// Crear logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Middleware para registrar solicitudes
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con el siguiente middleware
 */
const logRequest = (req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  
  // Registrar la respuesta
  const originalSend = res.send;
  res.send = function(data) {
    logger.info({
      statusCode: res.statusCode,
      response: data
    });
    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  logRequest,
  logger
};