const winston = require('winston');

/**
 * Crea un logger para un servicio específico
 * @param {string} serviceName - Nombre del servicio
 * @returns {object} Logger configurado
 */
const createLogger = (serviceName) => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]
  });

  return logger;
};

module.exports = { createLogger };