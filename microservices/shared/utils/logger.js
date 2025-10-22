const fs = require('fs');
const path = require('path');

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'label'],
  }),
  winston.format.json()
);

// Formato para consola (desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, service, requestId, ...meta }) => {
    let log = `${timestamp} [${level}]`;

    if (service) log += ` [${service}]`;
    if (requestId) log += ` [${requestId}]`;

    log += `: ${message}`;

    // Agregar metadata si existe
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return log + metaStr;
  })
);

// Transporte para errores
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  format: customFormat,
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

// Transporte para logs combinados
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: customFormat,
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

// Transporte para consola
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: process.env.LOG_LEVEL || 'info',
});

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'api-gateway',
    environment: process.env.NODE_ENV || 'development',
    hostname: require('os').hostname(),
    pid: process.pid,
  },
  transports: [errorFileTransport, combinedFileTransport, consoleTransport],
  exitOnError: false,
});

// Función helper para logging estructurado
const createLogger = (serviceName) => ({
  info: (message, meta = {}) => {
    logger.info(message, { ...meta, service: serviceName });
  },
  error: (message, meta = {}) => {
    logger.error(message, { ...meta, service: serviceName });
  },
  warn: (message, meta = {}) => {
    logger.warn(message, { ...meta, service: serviceName });
  },
  debug: (message, meta = {}) => {
    logger.debug(message, { ...meta, service: serviceName });
  },
  // Log de request HTTP
  logRequest: (req, res, duration) => {
    const meta = {
      service: serviceName,
      requestId: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP Request Error', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request Warning', meta);
    } else {
      logger.info('HTTP Request', meta);
    }
  },
  // Log de errores de base de datos
  logDbError: (operation, error, meta = {}) => {
    logger.error(`Database Error: ${operation}`, {
      ...meta,
      service: serviceName,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
      },
    });
  },
  // Log de llamadas a servicios externos
  logExternalCall: (service, method, url, status, duration, error = null) => {
    const meta = {
      service: serviceName,
      externalService: service,
      method,
      url,
      status,
      duration: `${duration}ms`,
    };

    if (error) {
      logger.error(`External Service Error: ${service}`, {
        ...meta,
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    } else if (status >= 500) {
      logger.error(`External Service Error: ${service}`, meta);
    } else if (status >= 400) {
      logger.warn(`External Service Warning: ${service}`, meta);
    } else {
      logger.info(`External Service Call: ${service}`, meta);
    }
  },
});

// Stream para Morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = {
  logger,
  createLogger,
};
