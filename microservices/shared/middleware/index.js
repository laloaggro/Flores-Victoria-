/**
 * @fileoverview Middleware module exports
 */

module.exports = {
  accessLog: require('./access-log'),
  authorize: require('./authorize'),
  circuitBreaker: require('./circuit-breaker'),
  csrf: require('./csrf'),
  errorHandler: require('./error-handler'),
  healthCheck: require('./health-check'),
  healthDashboard: require('./health-dashboard'),
  metrics: require('./metrics'),
  performance: require('./performance'),
  rateLimiter: require('./rate-limiter'),
  requestId: require('./request-id'),
  responseHandler: require('./response-handler'),
  security: require('./security'),
  securityHeaders: require('./security-headers'),
  validation: require('./validation'),
  compression: require('./compression'),
};
