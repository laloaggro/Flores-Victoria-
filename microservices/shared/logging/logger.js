const path = require('path');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * Campos sensibles que deben ser redactados en los logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'apiKey',
  'api_key',
  'secret',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
];

/**
 * Redacta campos sensibles de un objeto (recursivo)
 * @param {object} obj - Objeto a sanitizar
 * @param {number} depth - Profundidad máxima de recursión
 * @returns {object} Objeto sanitizado
 */
const sanitizeLogData = (obj, depth = 5) => {
  if (depth <= 0 || obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogData(item, depth - 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value, depth - 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

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
            // Sanitizar meta antes de loguearlo
            log += ` ${JSON.stringify(sanitizeLogData(meta))}`;
          }
          return log;
        })
      ),
    }),
  ];

  // Formato sanitizado para archivos de log
  const sanitizedJsonFormat = winston.format((info) => {
    return sanitizeLogData(info);
  });

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
        format: winston.format.combine(
          sanitizedJsonFormat(),
          winston.format.timestamp(),
          winston.format.json()
        ),
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
        format: winston.format.combine(
          sanitizedJsonFormat(),
          winston.format.timestamp(),
          winston.format.json()
        ),
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

module.exports = { createLogger, sanitizeLogData, SENSITIVE_FIELDS };
