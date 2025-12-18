/**
 * Metrics Middleware Stub for Railway Deployment
 */

const metricsMiddleware =
  (options = {}) =>
  (req, res, next) =>
    next();

const recordMetric = (name, value, tags = {}) => {
  // No-op in stub
};

const getMetrics = () => '# No metrics available\n';

module.exports = {
  metricsMiddleware,
  recordMetric,
  getMetrics,
  default: metricsMiddleware,
};
