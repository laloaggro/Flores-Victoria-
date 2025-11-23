// const path = require('path');

const winston = require('winston');

// Configurar logger
const logger = require('../../shared/logging/logger');

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const auditLogger = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  };

  logger.info('Audit Log', logData);
  next();
};

module.exports = auditLogger;
