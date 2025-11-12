/**
 * Request ID Middleware
 * Adds correlation ID to all requests for tracing
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Add correlation ID to request
 */
const requestId = () => {
  return (req, res, next) => {
    req.id = req.get('X-Request-ID') || req.get('X-Correlation-ID') || uuidv4();
    req.correlationId = req.id;
    res.set('X-Request-ID', req.id);
    res.set('X-Correlation-ID', req.id);
    next();
  };
};

/**
 * Attach logger to request with correlation ID
 */
const withLogger = (logger) => {
  return (req, res, next) => {
    req.logger = logger.child({ correlationId: req.correlationId || req.id });
    next();
  };
};

module.exports = {
  requestId,
  withLogger,
};
