/**
 * Rate Limiter Stub for Railway Deployment
 * Provides no-op rate limiting (allows all requests through)
 */

// No-op middleware that passes all requests
const noopLimiter = (req, res, next) => next();

// Redis client initialization stub
const initRedisClient = (config) => {
  console.log('[rate-limiter] Redis init stub called (no-op in Railway)');
};

// Create a rate limiter that does nothing
const createRateLimiter = (options = {}) => {
  return noopLimiter;
};

module.exports = {
  initRedisClient,
  publicLimiter: noopLimiter,
  criticalLimiter: noopLimiter,
  searchLimiter: noopLimiter,
  uploadLimiter: noopLimiter,
  authenticatedLimiter: noopLimiter,
  adminLimiter: noopLimiter,
  createRateLimiter,
  // Additional exports that might be needed
  RATE_LIMIT_TIERS: {
    public: { windowMs: 15 * 60 * 1000, max: 100 },
    authenticated: { windowMs: 15 * 60 * 1000, max: 500 },
    admin: { windowMs: 15 * 60 * 1000, max: 1000 },
  },
};
