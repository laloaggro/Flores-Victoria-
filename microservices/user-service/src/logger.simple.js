// logger.simple.js - Winston logger sin Logstash para Railway
const winston = require('winston');

const SERVICE_NAME = process.env.SERVICE_NAME || 'user-service';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: {
    service: SERVICE_NAME,
    environment: NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          const msgStr = typeof message === 'object' ? JSON.stringify(message) : message;
          let msg = `${timestamp} [${level}] [${SERVICE_NAME}]: ${msgStr}`;
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

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
});

module.exports = logger;
