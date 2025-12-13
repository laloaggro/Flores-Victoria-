const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const RedisStore = require('rate-limit-redis');
const logger = require('./logger');

/**
 * Rate Limiting Middleware for API Gateway
 * Protects against DDoS and brute force attacks
 */

let redisClient = null;

/**
 * Initialize Redis client for rate limiting
 */
function initRateLimitRedis(redisUrl) {
  if (!redisClient) {
    try {
      redisClient = new Redis(redisUrl, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
      });

      redisClient.on('error', (err) => {
        logger.error('Rate limit Redis error', { service: 'api-gateway', err: err.message });
      });

      logger.info('✅ Rate limit Redis connected', { service: 'api-gateway' });
    } catch (error) {
      logger.error('Failed to initialize rate limit Redis', { service: 'api-gateway', error });
      redisClient = null;
    }
  }
  return redisClient;
}

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use Redis store if available
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:api:',
      })
    : undefined,
  skip: (req) =>
    // Skip rate limiting for health checks
    req.path === '/health' || req.path === '/ready',
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:auth:',
      })
    : undefined,
});

/**
 * Medium rate limiter for search endpoints
 * 30 requests per minute per IP
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per minute
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:search:',
      })
    : undefined,
});

/**
 * Strict rate limiter for order creation
 * 10 requests per hour per IP
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 order creations per hour
  message: {
    error: 'Too many order attempts, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:order:',
      })
    : undefined,
});

/**
 * Moderate rate limiter for write operations
 * 20 requests per minute per IP
 */
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 write requests per minute
  message: {
    error: 'Too many write requests, please try again later.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:write:',
      })
    : undefined,
});

/**
 * Very strict limiter for sensitive operations
 * 3 requests per hour per IP
 */
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 sensitive requests per hour
  message: {
    error: 'Too many requests for this sensitive operation.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'rl:sensitive:',
      })
    : undefined,
});

/**
 * Get rate limit status for an IP
 */
async function getRateLimitStatus(ip, prefix = 'rl:api:') {
  if (!redisClient) {
    return { available: true, message: 'Rate limiting not configured' };
  }

  try {
    const key = `${prefix}${ip}`;
    const current = await redisClient.get(key);
    const ttl = await redisClient.ttl(key);

    return {
      requests: parseInt(current) || 0,
      resetIn: ttl > 0 ? ttl : 0,
    };
  } catch (error) {
    logger.error('Failed to get rate limit status', { service: 'api-gateway', error });
    return { error: error.message };
  }
}

/**
 * Reset rate limit for an IP (admin only)
 */
async function resetRateLimit(ip, prefix = 'rl:api:') {
  if (!redisClient) {
    return { success: false, message: 'Rate limiting not configured' };
  }

  try {
    const key = `${prefix}${ip}`;
    await redisClient.del(key);
    return { success: true, message: 'Rate limit reset successfully' };
  } catch (error) {
    logger.error('Failed to reset rate limit', { service: 'api-gateway', error });
    return { success: false, error: error.message };
  }
}

/**
 * Custom rate limiter with dynamic limits
 */
function createCustomLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests',
    prefix = 'rl:custom:',
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient
      ? new RedisStore({
          client: redisClient,
          prefix,
        })
      : undefined,
  });
}

module.exports = {
  initRateLimitRedis,
  apiLimiter,
  authLimiter,
  searchLimiter,
  orderLimiter,
  writeLimiter,
  sensitiveLimiter,
  getRateLimitStatus,
  resetRateLimit,
  createCustomLimiter,
};
