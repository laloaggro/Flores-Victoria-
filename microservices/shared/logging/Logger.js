/**
 * @fileoverview Structured Logger - Logging centralizado con formato JSON
 * @description Logger compatible con ELK Stack, CloudWatch, etc.
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { SERVICES } = require('../constants');

/**
 * Niveles de log
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  HTTP: 3,
  DEBUG: 4,
};

/**
 * Logger estructurado para microservicios
 */
class Logger {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName || process.env.SERVICE_NAME || 'unknown-service';
    this.level = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;
    this.prettyPrint = options.prettyPrint ?? process.env.NODE_ENV !== 'production';
    this.correlationIdKey = options.correlationIdKey || 'x-correlation-id';
  }

  /**
   * Formatea el mensaje de log
   * @private
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...meta,
    };

    // Añadir stack trace si hay error
    if (meta.error instanceof Error) {
      logEntry.error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      };
      delete logEntry.error; // Evitar duplicación
      logEntry.errorDetails = {
        name: meta.error.name,
        message: meta.error.message,
        stack: this.prettyPrint ? meta.error.stack : meta.error.stack?.split('\n').slice(0, 5),
      };
    }

    // Añadir correlation ID si está disponible
    if (meta.req?.headers?.[this.correlationIdKey]) {
      logEntry.correlationId = meta.req.headers[this.correlationIdKey];
    }

    // Añadir request info si está disponible
    if (meta.req) {
      logEntry.request = {
        method: meta.req.method,
        path: meta.req.path || meta.req.url,
        ip: meta.req.ip || meta.req.headers?.['x-forwarded-for'],
        userAgent: meta.req.headers?.['user-agent'],
      };
      delete logEntry.req;
    }

    // Limpiar campos undefined
    Object.keys(logEntry).forEach((key) => {
      if (logEntry[key] === undefined) {
        delete logEntry[key];
      }
    });

    return logEntry;
  }

  /**
   * Escribe el log
   * @private
   */
  write(level, levelName, message, meta) {
    if (level > this.level) {
      return;
    }

    const logEntry = this.formatMessage(levelName, message, meta);

    if (this.prettyPrint) {
      const colorMap = {
        ERROR: '\x1b[31m', // Red
        WARN: '\x1b[33m', // Yellow
        INFO: '\x1b[32m', // Green
        HTTP: '\x1b[36m', // Cyan
        DEBUG: '\x1b[35m', // Magenta
      };
      const reset = '\x1b[0m';
      const color = colorMap[levelName] || '';

      console.log(
        `${color}[${logEntry.timestamp}] [${levelName}] [${this.serviceName}]${reset}`,
        message,
        Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ''
      );
    } else {
      const output = JSON.stringify(logEntry);
      if (level <= LOG_LEVELS.ERROR) {
        console.error(output);
      } else if (level <= LOG_LEVELS.WARN) {
        console.warn(output);
      } else {
        console.log(output);
      }
    }
  }

  /**
   * Log de error
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos adicionales
   */
  error(message, meta = {}) {
    this.write(LOG_LEVELS.ERROR, 'ERROR', message, meta);
  }

  /**
   * Log de warning
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos adicionales
   */
  warn(message, meta = {}) {
    this.write(LOG_LEVELS.WARN, 'WARN', message, meta);
  }

  /**
   * Log de info
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos adicionales
   */
  info(message, meta = {}) {
    this.write(LOG_LEVELS.INFO, 'INFO', message, meta);
  }

  /**
   * Log de HTTP requests
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos adicionales
   */
  http(message, meta = {}) {
    this.write(LOG_LEVELS.HTTP, 'HTTP', message, meta);
  }

  /**
   * Log de debug
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos adicionales
   */
  debug(message, meta = {}) {
    this.write(LOG_LEVELS.DEBUG, 'DEBUG', message, meta);
  }

  /**
   * Crea un child logger con contexto adicional
   * @param {Object} context - Contexto a añadir a todos los logs
   * @returns {Object} Logger con métodos bound
   */
  child(context = {}) {
    const childLogger = {
      error: (msg, meta = {}) => this.error(msg, { ...context, ...meta }),
      warn: (msg, meta = {}) => this.warn(msg, { ...context, ...meta }),
      info: (msg, meta = {}) => this.info(msg, { ...context, ...meta }),
      http: (msg, meta = {}) => this.http(msg, { ...context, ...meta }),
      debug: (msg, meta = {}) => this.debug(msg, { ...context, ...meta }),
    };
    return childLogger;
  }

  /**
   * Middleware Express para logging de requests
   * @returns {Function} Express middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Log al finalizar la respuesta
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const meta = {
          req,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        };

        if (res.statusCode >= 500) {
          this.error(`${req.method} ${req.path} ${res.statusCode}`, meta);
        } else if (res.statusCode >= 400) {
          this.warn(`${req.method} ${req.path} ${res.statusCode}`, meta);
        } else {
          this.http(`${req.method} ${req.path} ${res.statusCode}`, meta);
        }
      });

      next();
    };
  }

  /**
   * Middleware para añadir correlation ID
   * @returns {Function} Express middleware
   */
  correlationMiddleware() {
    return (req, res, next) => {
      const correlationId =
        req.headers[this.correlationIdKey] ||
        `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      req.headers[this.correlationIdKey] = correlationId;
      res.setHeader(this.correlationIdKey, correlationId);

      next();
    };
  }
}

// Factory para crear loggers por servicio
const createLogger = (serviceName, options = {}) => {
  return new Logger(serviceName, options);
};

// Loggers pre-configurados para cada servicio
const loggers = {};
Object.values(SERVICES).forEach((serviceName) => {
  loggers[serviceName] = createLogger(serviceName);
});

module.exports = {
  Logger,
  createLogger,
  loggers,
  LOG_LEVELS,
};
