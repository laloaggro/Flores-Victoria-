/**
 * Rate Limiter Middleware Stub for Railway Deployment
 */

const noopLimiter = (req, res, next) => next();

const initRedisClient = (config) => {
  console.log('[rate-limiter] Redis init stub called (no-op in Railway)');
};

const createRateLimiter = (options = {}) => noopLimiter;

module.exports = {
  initRedisClient,
  createRateLimiter,
  publicLimiter: noopLimiter,
  criticalLimiter: noopLimiter,
  searchLimiter: noopLimiter,
  uploadLimiter: noopLimiter,
  authenticatedLimiter: noopLimiter,
  adminLimiter: noopLimiter,
};
