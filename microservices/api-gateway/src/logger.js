// logger.js - Centralized logging with ELK Stack integration
const winston = require('winston');
const LogstashTransport = require('winston-logstash/lib/winston-logstash-latest');

const SERVICE_NAME = process.env.SERVICE_NAME || 'api-gateway';
const LOGSTASH_HOST = process.env.LOGSTASH_HOST || 'logstash';
const LOGSTASH_PORT = parseInt(process.env.LOGSTASH_PORT) || 5000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}] [${SERVICE_NAME}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: SERVICE_NAME,
    environment: NODE_ENV,
    host: require('os').hostname(),
  },
  transports: [
    // Console transport (always enabled for local debugging)
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Add Logstash transport only if not in test environment
if (NODE_ENV !== 'test') {
  try {
    const logstashTransport = new LogstashTransport({
      port: LOGSTASH_PORT,
      host: LOGSTASH_HOST,
      node_name: SERVICE_NAME,

      // Connection options
      max_connect_retries: -1, // Infinite retries
      timeout_connect_retries: 10000, // 10 seconds between retries

      // SSL/TLS (disabled in development)
      ssl_enable: false,
      ssl_verify: false,
    });

    // Handle Logstash transport errors
    logstashTransport.on('error', (error) => {
      console.error('Logstash transport error:', error.message);
    });

    logstashTransport.on('connect', () => {
      logger.info('Connected to Logstash', {
        host: LOGSTASH_HOST,
        port: LOGSTASH_PORT,
      });
    });

    logger.add(logstashTransport);
    logger.info('Logstash transport initialized', {
      host: LOGSTASH_HOST,
      port: LOGSTASH_PORT,
    });
  } catch (error) {
    console.error('Failed to initialize Logstash transport:', error.message);
  }
}

// Helper functions for structured logging
logger.logRequest = (req, res, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id || 'anonymous',
  });
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    error: error.message,
    stack: error.stack,
    code: error.code,
    ...context,
  });
};

logger.logBusiness = (event, data = {}) => {
  logger.info(event, {
    eventType: 'business',
    ...data,
  });
};

logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance metric', {
    operation,
    duration,
    ...metadata,
  });
};

// Export logger
module.exports = logger;
