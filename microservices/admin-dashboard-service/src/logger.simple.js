/**
 * Logger simplificado para Admin Dashboard Service
 * Sin dependencias externas problemáticas
 */

const SERVICE_NAME = 'admin-dashboard-service';

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}] [${SERVICE_NAME}]: ${message}${metaStr}`;
};

const logger = {
  info: (message, meta) => console.log(formatMessage('info', message, meta)),
  error: (message, meta) => console.error(formatMessage('error', message, meta)),
  warn: (message, meta) => console.warn(formatMessage('warn', message, meta)),
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.log(formatMessage('debug', message, meta));
    }
  },
};

module.exports = logger;
