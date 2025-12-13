/**
 * Logger simplificado para Promotion Service
 * Versión: 1.0.0
 *
 * Configuración mínima de Winston para consola únicamente.
 * Elimina winston-logstash para reducir dependencias y evitar errores de conexión.
 */

const winston = require('winston');

const SERVICE_NAME = 'promotion-service';

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
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          // Serializar mensaje si es un objeto
          const msgStr = typeof message === 'object' ? JSON.stringify(message) : message;
          let msg = `${timestamp} [${level}] [${SERVICE_NAME}]: ${msgStr}`;
          // Filtrar metadata del servicio para evitar duplicación
          const { service, environment, host, ...rest } = metadata;
          if (Object.keys(rest).length > 0) {
            msg += ` ${JSON.stringify(rest)}`;
          }
          return msg;
        })
      ),
    }),
  ],
});

// Log inicial
logger.info('Logger simplificado inicializado para Promotion Service');

module.exports = logger;
