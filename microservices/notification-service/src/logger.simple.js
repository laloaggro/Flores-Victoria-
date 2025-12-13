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
          let msg = `${timestamp} [${level}] [${SERVICE_NAME}]: ${message}`;
          if (Object.keys(metadata).length > 0 && metadata.service !== SERVICE_NAME) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      ),
    }),
  ],
});

module.exports = logger;
