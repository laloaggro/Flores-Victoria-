// logger.simple.js - Winston sin dependencias de shared
const winston = require('winston');

const SERVICE_NAME = 'auth-service';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
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

module.exports = logger;
