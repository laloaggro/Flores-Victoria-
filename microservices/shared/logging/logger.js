const path = require('path');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * Crea un logger para un servicio específico con log rotation y múltiples transports
 * @param {string} serviceName - Nombre del servicio
 * @param {object} options - Opciones adicionales
 * @param {string} options.logDir - Directorio de logs (default: logs/)
 * @param {string} options.level - Nivel de log (default: info)
 * @param {boolean} options.enableRotation - Habilitar log rotation (default: true)
 * @returns {object} Logger configurado
 */
const createLogger = (serviceName, options = {}) => {
  const {
    logDir = process.env.LOG_DIR || 'logs',
    level = process.env.LOG_LEVEL || 'info',
    enableRotation = process.env.ENABLE_LOG_ROTATION !== 'false',
  } = options;

  const transports = [
    // Console transport con formato colorizado para desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level: lvl, message, service, requestId, ...meta }) => {
          let log = `${timestamp} [${lvl}] [${service}]`;
          if (requestId) log += ` [${requestId}]`;
          log += `: ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          return log;
        })
      ),
    }),
  ];

  // Agregar file transports con rotation si está habilitado
  if (enableRotation) {
    // Log de errores
    transports.push(
      new DailyRotateFile({
        dirname: path.join(logDir, serviceName),
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      })
    );

    // Log combinado
    transports.push(
      new DailyRotateFile({
        dirname: path.join(logDir, serviceName),
        filename: 'combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '7d',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      })
    );
  }

  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: {
      service: serviceName,
      environment: process.env.NODE_ENV || 'development',
      host: require('os').hostname(),
    },
    transports,
  });

  // Método helper para agregar request ID
  logger.withRequestId = function (requestId) {
    return logger.child({ requestId });
  };

  return logger;
};

module.exports = { createLogger };
