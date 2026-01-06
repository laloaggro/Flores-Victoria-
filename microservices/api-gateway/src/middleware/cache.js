const Redis = require('ioredis');
const logger = require('./logger');

/**
 * Redis Cache Middleware for API Gateway
 * Caches GET requests to reduce load on microservices
 */

let redisClient = null;

// Initialize Redis client
function initRedisCache(redisUrl) {
  if (!redisClient) {
    try {
      redisClient = new Redis(redisUrl, {
        retryStrategy(times) {
          if (times > 3) {
            logger.warn({ service: 'api-gateway' }, 'Redis cache connection failed after 3 retries');
            return null;
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      // Registrar manejadores ANTES de conectar
      redisClient.on('error', (err) => {
        logger.warn({ service: 'api-gateway', error: err.message }, 'Redis Cache Error');
      });

      redisClient.on('connect', () => {
        logger.info({ service: 'api-gateway' }, '✅ Redis cache connected');
      });

      // Conectar de forma asíncrona
      redisClient.connect().catch((err) => {
        logger.warn({ service: 'api-gateway', error: err.message }, 'Redis cache connection failed');
      });
    } catch (error) {
      logger.error({ service: 'api-gateway', error }, 'Failed to initialize Redis cache');
      redisClient = null;
    }
  }
  return redisClient;
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req) {
  const { method, originalUrl, query, user } = req;
  const userId = user?.id || 'anonymous';
  const queryString = JSON.stringify(query);
  return `api:${method}:${originalUrl}:${queryString}:${userId}`;
}

/**
 * Check if request should be cached
 */
function shouldCache(req) {
  // Only cache GET requests
  if (req.method !== 'GET') return false;

  // Don't cache if explicitly disabled
  if (req.headers['x-no-cache'] === 'true') return false;

  // Don't cache health checks
  if (req.path.includes('/health') || req.path.includes('/ready')) return false;

  // Don't cache auth endpoints
  if (req.path.includes('/auth/me') || req.path.includes('/auth/verify')) return false;

  return true;
}

/**
 * Get TTL based on endpoint type
 */
function getTTL(req) {
  const path = req.path;

  // Long TTL for static content
  if (path.includes('/products') && !path.includes('/search')) {
    return 600; // 10 minutes
  }

  // Medium TTL for lists
  if (path.includes('/list') || path.includes('/all')) {
    return 300; // 5 minutes
  }

  // Short TTL for user-specific data
  if (path.includes('/cart') || path.includes('/wishlist')) {
    return 60; // 1 minute
  }

  // Very short TTL for search results
  if (path.includes('/search')) {
    return 30; // 30 seconds
  }

  // Default TTL
  return 180; // 3 minutes
}

/**
 * Cache Middleware
 */
function cacheMiddleware(options = {}) {
  const { enabled = process.env.ENABLE_CACHE === 'true' } = options;

  return async (req, res, next) => {
    // Skip if caching disabled
    if (!enabled || !redisClient) {
      return next();
    }

    // Skip if shouldn't cache
    if (!shouldCache(req)) {
      return next();
    }

    const cacheKey = generateCacheKey(req);

    try {
      // Try to get from cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        // Cache hit
        const data = JSON.parse(cachedData);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(data);
      }

      // Cache miss - intercept response
      const originalJson = res.json.bind(res);

      res.json = function (data) {
        // Set cache headers
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);

        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const ttl = getTTL(req);

          // Store in cache asynchronously
          redisClient.setex(cacheKey, ttl, JSON.stringify(data)).catch((err) => {
            logger.error({ service: 'api-gateway', error: err }, 'Failed to cache response');
          });
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error({ service: 'api-gateway', error }, 'Cache middleware error');
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Clear cache by pattern
 */
async function clearCache(pattern = 'api:*') {
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info({ service: 'api-gateway', count: keys.length, pattern }, `Cleared cache keys`);
    }
  } catch (error) {
    logger.error({ service: 'api-gateway', error }, 'Failed to clear cache');
  }
}

/**
 * Clear cache for specific resource
 */
async function clearResourceCache(resource) {
  const patterns = [`api:GET:/api/${resource}*`, `api:GET:/${resource}*`];

  for (const pattern of patterns) {
    await clearCache(pattern);
  }
}

/**
 * Get cache stats
 */
async function getCacheStats() {
  if (!redisClient) {
    return { enabled: false };
  }

  try {
    const info = await redisClient.info('stats');
    const dbSize = await redisClient.dbsize();

    return {
      enabled: true,
      keys: dbSize,
      info: info
        .split('\r\n')
        .filter((line) => line.includes(':'))
        .reduce((acc, line) => {
          const [key, value] = line.split(':');
          acc[key] = value;
          return acc;
        }, {}),
    };
  } catch (error) {
    logger.error({ service: 'api-gateway', error }, 'Failed to get cache stats');
    return { enabled: false, error: error.message };
  }
}

module.exports = {
  initRedisCache,
  cacheMiddleware,
  clearCache,
  clearResourceCache,
  getCacheStats,
};
