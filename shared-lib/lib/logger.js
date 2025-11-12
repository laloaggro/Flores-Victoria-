/**
 * Logging utilities
 * Sistema centralizado de logging con Winston
 */

const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Formato personalizado para los logs
 */
const customFormat = printf(({ level, message, timestamp, stack, service, ...metadata }) => {
  let log = `${timestamp} [${service || 'service'}] ${level}: ${message}`;

  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`;
  }

  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

/**
 * Crea un logger configurado
 * @param {Object} options - Opciones de configuración
 * @returns {winston.Logger}
 */
function createLogger(options = {}) {
  const {
    service = 'flores-victoria',
    level = process.env.LOG_LEVEL || 'info',
    filename = null,
    enableConsole = true,
    enableFile = false,
  } = options;

  const transports = [];

  // Console transport
  if (enableConsole) {
    transports.push(
      new winston.transports.Console({
        format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
      })
    );
  }

  // File transport
  if (enableFile && filename) {
    transports.push(
      new winston.transports.File({
        filename,
        format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
      })
    );

    // Error log file separado
    transports.push(
      new winston.transports.File({
        filename: filename.replace('.log', '-error.log'),
        level: 'error',
        format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
      })
    );
  }

  const logger = winston.createLogger({
    level,
    format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
    defaultMeta: { service },
    transports,
  });

  return logger;
}

/**
 * Logger por defecto para toda la aplicación
 */
const defaultLogger = createLogger({
  service: 'flores-victoria',
  enableConsole: true,
  enableFile: process.env.NODE_ENV === 'production',
  filename: process.env.LOG_FILE || 'logs/app.log',
});

/**
 * Middleware para logging de requests HTTP
 * @param {winston.Logger} logger - Logger a usar
 * @returns {Function} Middleware de Express
 */
function requestLogger(logger = defaultLogger) {
  return (req, res, next) => {
    const start = Date.now();

    // Log cuando la respuesta termina
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      if (res.statusCode >= 500) {
        logger.error('HTTP Request Error', logData);
      } else if (res.statusCode >= 400) {
        logger.warn('HTTP Request Warning', logData);
      } else {
        logger.info('HTTP Request', logData);
      }
    });

    next();
  };
}

/**
 * Helper para logging de errores
 * @param {winston.Logger} logger - Logger a usar
 * @param {Error} error - Error a loggear
 * @param {Object} context - Contexto adicional
 */
function logError(error, context = {}, logger = defaultLogger) {
  logger.error(error.message, {
    error: error.name,
    stack: error.stack,
    ...context,
  });
}

/**
 * Helper para logging de eventos de negocio
 * @param {string} event - Nombre del evento
 * @param {Object} data - Datos del evento
 * @param {winston.Logger} logger - Logger a usar
 */
function logBusinessEvent(event, data = {}, logger = defaultLogger) {
  logger.info(`Business Event: ${event}`, {
    event,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  createLogger,
  defaultLogger,
  requestLogger,
  logError,
  logBusinessEvent,
  logger: defaultLogger, // Exportar logger por defecto
};
