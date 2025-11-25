/**
 * @flores-victoria/shared/middleware
 * Exporta middleware compartidos
 */

module.exports = {
  accessLog: require('./access-log'),
  errorHandler: require('./error-handler'),
  metrics: require('./metrics'),
  rateLimiter: require('./rate-limiter'),
  requestId: require('./request-id'),
  validator: require('./validator'),
};
