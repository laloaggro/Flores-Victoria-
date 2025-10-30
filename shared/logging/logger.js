/**
 * Sistema de Logging Centralizado
 * Flores Victoria v3.0
 *
 * Características:
 * - Niveles: debug, info, warn, error
 * - Condicional según NODE_ENV
 * - Formato estructurado con timestamps
 * - Soporte para metadata y requestId
 * - Modo JSON opcional (LOG_FORMAT=json) y por defecto en producción si no hay TTY
 * - Redacción de campos sensibles en metadatos
 * - Transporte a archivo opcional (LOG_FILE, LOG_MAX_SIZE_MB, LOG_MAX_FILES)
 */

const os = require('os');

const winston = require('winston');

// Determinar nivel de logging según entorno
const getLogLevel = () => {
  if (process.env.LOG_LEVEL) return process.env.LOG_LEVEL;
  
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' ? 'info' : env === 'test' ? 'warn' : 'debug';
};

// Claves a redactar en metadatos
const SENSITIVE_KEYS = new Set([
  'password',
  'pass',
  'pwd',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'api_key',
  'authorization',
  'auth',
  'secret',
  'clientSecret',
  'privateKey',
  'stripeSecret',
]);

// Redacta valores sensibles profundamente (por valor)
const redact = (value) => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const out = Array.isArray(value) ? [] : {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return value;
};

// Redacta por nombre de clave (top-level) + profundo
const redactByKey = (key, value) => (SENSITIVE_KEYS.has(key) ? '[REDACTED]' : redact(value));

// Base de formatos
const baseFormat = [
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
];

// Formato de consola legible
const prettyPrintf = winston.format.printf(({ timestamp, level, message, service, requestId, pid, hostname, ...meta }) => {
  let log = `${timestamp} [${level.toUpperCase()}]`;
  if (service) log += ` [${service}]`;
  if (pid) log += ` [pid:${pid}]`;
  if (hostname) log += ` [${hostname}]`;
  if (requestId) log += ` [req:${String(requestId).substring(0, 8)}]`;
  log += `: ${message}`;

  const safeMeta = redact(meta);
  const metaKeys = Object.keys(safeMeta).filter((k) => k !== 'stack');
  if (metaKeys.length > 0) {
    log += ` ${JSON.stringify(safeMeta)}`;
  }
  return log;
});

/**
 * Crea un logger para un servicio específico
 * @param {string} serviceName - Nombre del servicio
 * @returns {object} Logger configurado
 */
const createLogger = (serviceName) => {
  const isJson = ((process.env.LOG_FORMAT || '').toLowerCase() === 'json') || (((process.env.NODE_ENV || 'development') === 'production') && !process.stdout.isTTY);

  const defaultMeta = {
    service: serviceName,
    pid: process.pid,
    hostname: os.hostname(),
  };

  const consoleFormat = isJson
    ? winston.format.combine(
        ...baseFormat,
        // Redact antes de serializar
        winston.format((info) => {
          if (typeof info.message === 'object') {
            info.message = JSON.stringify(redact(info.message));
          }
          for (const k of Object.keys(info)) {
            if (!['level', 'timestamp', 'service', 'requestId', 'pid', 'hostname', 'message'].includes(k)) {
              info[k] = redactByKey(k, info[k]);
            }
          }
          return info;
        })(),
        winston.format.json()
      )
    : winston.format.combine(winston.format.colorize(), ...baseFormat, prettyPrintf);

  const transports = [
    new winston.transports.Console({ format: consoleFormat })
  ];

  // Transporte a archivo opcional
  if (process.env.LOG_FILE) {
    const maxSizeMb = parseInt(process.env.LOG_MAX_SIZE_MB || '10', 10);
    const maxFiles = parseInt(process.env.LOG_MAX_FILES || '5', 10);
    transports.push(
      new winston.transports.File({
        filename: process.env.LOG_FILE,
        level: getLogLevel(),
        maxsize: maxSizeMb * 1024 * 1024,
        maxFiles,
        tailable: true,
        format: winston.format.combine(
          ...baseFormat,
          winston.format((info) => {
            if (typeof info.message === 'object') {
              info.message = JSON.stringify(redact(info.message));
            }
            for (const k of Object.keys(info)) {
              if (!['level', 'timestamp', 'service', 'requestId', 'pid', 'hostname', 'message'].includes(k)) {
                info[k] = redactByKey(k, info[k]);
              }
            }
            return info;
          })(),
          winston.format.json()
        ),
      })
    );
  }

  const logger = winston.createLogger({
    level: getLogLevel(),
    defaultMeta,
    transports,
    exitOnError: false,
    silent: String(process.env.LOG_SILENT || '').toLowerCase() === 'true',
  });

  // Wrapper con helpers
  return {
    debug: (message, meta = {}) => logger.debug(message, meta),
    info: (message, meta = {}) => logger.info(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    error: (message, meta = {}) => {
      if (meta instanceof Error) {
        logger.error(message, { error: meta.message, stack: meta.stack });
      } else {
        logger.error(message, meta);
      }
    },
    // Helper para logging con request ID
    withRequestId: (requestId) => ({
      debug: (message, meta = {}) => logger.debug(message, { requestId, ...meta }),
      info: (message, meta = {}) => logger.info(message, { requestId, ...meta }),
      warn: (message, meta = {}) => logger.warn(message, { requestId, ...meta }),
      error: (message, meta = {}) => {
        if (meta instanceof Error) {
          logger.error(message, { requestId, error: meta.message, stack: meta.stack });
        } else {
          logger.error(message, { requestId, ...meta });
        }
      },
    }),
  };
};

module.exports = { createLogger, getLogLevel };
