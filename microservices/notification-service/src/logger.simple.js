const winston = require('winston');

// Configuración simplificada de logger para Railway
// Sin dependencias de winston-logstash ni integraciones ELK

const SERVICE_NAME = process.env.SERVICE_NAME || 'notification-service';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV || 'production',
  },
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

module.exports = logger;
