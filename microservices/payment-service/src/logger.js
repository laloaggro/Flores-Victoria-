const winston = require('winston');
const LogstashTransport = require('winston-logstash/lib/winston-logstash-latest');

const SERVICE_NAME = 'payment-service';

// Custom format to properly serialize objects
const consoleFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const ts = timestamp || new Date().toISOString();
  const msgStr = typeof message === 'object' ? JSON.stringify(message) : message;
  const { service, environment, host, ...rest } = metadata;
  const metaStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
  return `${ts} [${level}] [${SERVICE_NAME}]: ${msgStr}${metaStr}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: SERVICE_NAME },
  transports: [
    // Console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        consoleFormat
      ),
    }),
  ],
});

// Logstash transport (solo en producción o si está habilitado)
if (process.env.LOGSTASH_HOST && process.env.LOGSTASH_PORT) {
  logger.add(
    new LogstashTransport({
      port: parseInt(process.env.LOGSTASH_PORT) || 5000,
      host: process.env.LOGSTASH_HOST || 'localhost',
      node_name: 'payment-service',
      max_connect_retries: -1,
    })
  );
}

module.exports = logger;
