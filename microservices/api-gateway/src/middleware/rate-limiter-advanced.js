/**
 * Advanced Rate Limiting Configuration
 * Differentiated rate limits per endpoint type
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const Redis = require('ioredis');
const logger = require('../middleware/logger').logger || console;

// Valkey client for distributed rate limiting
let redisClient;

const getValkeyClient = () => {
  if (!redisClient) {
    const valkeyUrl = process.env.VALKEY_URL;
    redisClient = valkeyUrl
      ? new Redis(valkeyUrl, {
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 100, 2000);
          },
        })
      : new Redis({
          host: process.env.VALKEY_HOST || 'valkey',
          port: Number.parseInt(process.env.VALKEY_PORT || '6379', 10),
          password: process.env.VALKEY_PASSWORD,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 100, 2000);
          },
        });

    // Registrar manejadores ANTES de conectar
    redisClient.on('error', (err) => {
      logger.warn({ error: err.message }, 'Valkey rate limit client error');
    });

    redisClient.on('ready', () => {
      logger.info('Valkey rate limit client connected');
    });

    // Conectar de forma asíncrona
    redisClient.connect().catch((err) => {
      logger.warn({ error: err.message }, 'Valkey rate limit client connection failed');
    });
  }
  return redisClient;
};

// Store factory for Valkey or memory fallback
const getStore = (prefix) => {
  try {
    const client = getValkeyClient();
    return new RedisStore({
      sendCommand: (...args) => client.call(...args),
      prefix: `rl:${prefix}:`,
    });
  } catch {
    logger.warn('Using memory store for rate limiting (Valkey unavailable)');
    return undefined; // Falls back to memory store
  }
};

// Standard response handler
const standardHandler = (req, res) => {
  res.status(429).json({
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Demasiadas solicitudes. Por favor, intenta más tarde.',
    retryAfter: res.getHeader('Retry-After'),
  });
};

// Key generators
const keyGenerators = {
  // By IP address
  byIP: (req) => req.ip,
  
  // By user ID (for authenticated requests)
  byUser: (req) => req.user?.id || req.ip,
  
  // By IP + endpoint
  byIPEndpoint: (req) => `${req.ip}:${req.path}`,
  
  // By user + endpoint
  byUserEndpoint: (req) => `${req.user?.id || req.ip}:${req.path}`,
};

// =============================================================================
// Rate Limiters by Category
// =============================================================================

/**
 * Critical endpoints (login, register, password reset)
 * Very strict limits to prevent brute force
 */
const criticalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Demasiados intentos. Espera 15 minutos antes de intentar nuevamente.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byIP,
  store: getStore('critical'),
  skip: (req) => {
    // Skip for internal health checks
    return req.path === '/health';
  },
});

/**
 * Authentication endpoints
 * Moderate limits for general auth operations
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byIP,
  store: getStore('auth'),
});

/**
 * Search and listing endpoints
 * Higher limits but still controlled
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byIP,
  store: getStore('search'),
});

/**
 * Standard API endpoints
 * General purpose rate limiting
 */
const standardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byIPEndpoint,
  store: getStore('standard'),
});

/**
 * Write operations (POST, PUT, DELETE)
 * More strict than read operations
 */
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 writes per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byUser,
  store: getStore('write'),
  skip: (req) => req.method === 'GET',
});

/**
 * Upload endpoints
 * Very strict limits
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byUser,
  store: getStore('upload'),
});

/**
 * Webhook endpoints
 * Allow more requests for external services
 */
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byIP,
  store: getStore('webhook'),
});

/**
 * Admin endpoints
 * Higher limits for admin users
 */
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute for admins
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byUser,
  store: getStore('admin'),
});

/**
 * OTP/Verification endpoints
 * Very strict to prevent abuse
 */
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 OTP requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byIP,
  store: getStore('otp'),
});

/**
 * Contact form
 * Prevent spam
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 contact submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byIP,
  store: getStore('contact'),
});

/**
 * Cart operations
 * Moderate limits
 */
const cartLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 cart operations per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byUser,
  store: getStore('cart'),
});

/**
 * Checkout/Payment endpoints
 * Strict but allow legitimate transactions
 */
const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 checkout attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: standardHandler,
  keyGenerator: keyGenerators.byUser,
  store: getStore('checkout'),
});

// =============================================================================
// Dynamic Rate Limiter
// =============================================================================

/**
 * Create custom rate limiter with specific configuration
 */
const createCustomLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: options.handler || standardHandler,
    keyGenerator: options.keyGenerator || keyGenerators.byIP,
    store: getStore(options.prefix || 'custom'),
    skip: options.skip,
  });
};

/**
 * Middleware to apply rate limits based on route configuration
 */
const adaptiveRateLimiter = (routeConfig) => {
  const limiters = {
    critical: criticalLimiter,
    auth: authLimiter,
    search: searchLimiter,
    standard: standardLimiter,
    write: writeLimiter,
    upload: uploadLimiter,
    webhook: webhookLimiter,
    admin: adminLimiter,
    otp: otpLimiter,
    contact: contactLimiter,
    cart: cartLimiter,
    checkout: checkoutLimiter,
  };

  return (req, res, next) => {
    const limiterType = routeConfig[req.path] || 'standard';
    const limiter = limiters[limiterType] || standardLimiter;
    return limiter(req, res, next);
  };
};

module.exports = {
  // Individual limiters
  criticalLimiter,
  authLimiter,
  searchLimiter,
  standardLimiter,
  writeLimiter,
  uploadLimiter,
  webhookLimiter,
  adminLimiter,
  otpLimiter,
  contactLimiter,
  cartLimiter,
  checkoutLimiter,
  
  // Utilities
  createCustomLimiter,
  adaptiveRateLimiter,
  keyGenerators,
};
