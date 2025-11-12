const winston = require('winston');
const LogstashTransport = require('winston-logstash/lib/winston-logstash-latest');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'payment-service' },
  transports: [
    // Console
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
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
