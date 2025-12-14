const winston = require('winston');

// Configuración simplificada de logger para Railway
// Sin dependencias de winston-logstash ni integraciones ELK

const SERVICE_NAME = process.env.SERVICE_NAME || 'review-service';
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
          // Manejar cuando message es un objeto (pino-style logging)
          let msgStr;
          if (typeof message === 'object' && message !== null) {
            // Extraer mensaje del objeto si existe
            msgStr = message.message || message.msg || JSON.stringify(message);
          } else {
            msgStr = message || '';
          }
          
          let msg = `${timestamp} [${level}] [${SERVICE_NAME}]: ${msgStr}`;
          
          // Filtrar metadata del servicio para evitar duplicación
          const { service, environment, host, ...rest } = metadata;
          
          // Incluir error si existe
          if (rest.error) {
            const errMsg = rest.error.message || rest.error;
            msg += ` - Error: ${errMsg}`;
            delete rest.error;
          }
          if (rest.err) {
            const errMsg = rest.err.message || rest.err;
            msg += ` - Error: ${errMsg}`;
            delete rest.err;
          }
          
          // Añadir resto de metadata si existe
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
