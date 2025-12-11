/**
 * Logger simplificado para Promotion Service
 * Versión: 1.0.0
 * 
 * Configuración mínima de Winston para consola únicamente.
 * Elimina winston-logstash para reducir dependencias y evitar errores de conexión.
 */

const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Log inicial
logger.info('Logger simplificado inicializado para Promotion Service');

module.exports = logger;
