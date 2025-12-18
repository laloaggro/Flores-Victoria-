/**
 * Logger Stub for Railway Deployment
 * Provides console-based logging functionality
 */

const createLogger = (name) => {
  const formatMessage = (level, args) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${name}] ${args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
      .join(' ')}`;
  };

  const logger = {
    info: (...args) => console.log(formatMessage('info', args)),
    error: (...args) => console.error(formatMessage('error', args)),
    warn: (...args) => console.warn(formatMessage('warn', args)),
    debug: (...args) => {
      if (process.env.DEBUG === 'true') {
        console.log(formatMessage('debug', args));
      }
    },
    withRequestId: (requestId) => ({
      info: (...args) => console.log(formatMessage('info', [`[req:${requestId}]`, ...args])),
      error: (...args) => console.error(formatMessage('error', [`[req:${requestId}]`, ...args])),
      warn: (...args) => console.warn(formatMessage('warn', [`[req:${requestId}]`, ...args])),
      debug: (...args) => {
        if (process.env.DEBUG === 'true') {
          console.log(formatMessage('debug', [`[req:${requestId}]`, ...args]));
        }
      },
    }),
  };

  return logger;
};

// Create default logger
const logger = createLogger('auth-service');

module.exports = { createLogger, logger };
