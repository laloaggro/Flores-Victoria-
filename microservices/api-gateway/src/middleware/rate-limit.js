const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const { createLogger } = require('../../shared/utils/logger');

const logger = createLogger('rate-limiter');

// Configuración de Redis
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_RATE_LIMIT_DB || 1,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 100, 3000);
  }
});

redisClient.on('error', (err) => {
  logger.error('Redis error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis connected for rate limiting');
});

/**
 * Rate limiter general para toda la API
 * 100 requests por 15 minutos
 */
const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes, por favor intente más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Retorna rate limit info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
  skip: (req) => {
    // Excluir rutas de health check y métricas
    return req.path === '/health' || req.path === '/ready' || req.path === '/metrics';
  },
  keyGenerator: (req) => {
    // Usar IP + User-Agent para identificar únicamente
    return `${req.ip}-${req.get('user-agent')}`;
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      status: 'error',
      message: 'Demasiadas solicitudes. Por favor intente más tarde.',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

/**
 * Rate limiter estricto para autenticación
 * 5 intentos por 15 minutos para prevenir brute force
 */
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  skipSuccessfulRequests: true, // No contar requests exitosos
  message: {
    status: 'error',
    message: 'Demasiados intentos de inicio de sesión. Cuenta temporalmente bloqueada.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit por email intentado
    return req.body?.email || req.ip;
  },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email,
      path: req.path
    });
    
    res.status(429).json({
      status: 'error',
      message: 'Demasiados intentos de inicio de sesión. Por favor intente más tarde.',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

/**
 * Rate limiter para creación de recursos
 * 20 requests por hora
 */
const createLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:create:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 creaciones por hora
  message: {
    status: 'error',
    message: 'Límite de creación alcanzado. Intente más tarde.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Solo aplicar a POST requests
    return req.method !== 'POST';
  },
  handler: (req, res) => {
    logger.warn('Create rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    res.status(429).json({
      status: 'error',
      message: 'Ha alcanzado el límite de creación. Por favor intente más tarde.',
      retryAfter: res.getHeader('RateLimit-Reset')
    });
  }
});

/**
 * Rate limiter para búsquedas
 * 50 requests por minuto
 */
const searchLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:search:'
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: 50, // 50 búsquedas por minuto
  message: {
    status: 'error',
    message: 'Demasiadas búsquedas. Intente más tarde.',
    retryAfter: '1 minuto'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para API pública (sin autenticación)
 * Más restrictivo: 30 requests por 15 minutos
 */
const publicLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:public:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 requests
  message: {
    status: 'error',
    message: 'Límite de API pública excedido. Regístrese para mayor cuota.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para usuarios autenticados
 * Más permisivo: 200 requests por 15 minutos
 */
const authenticatedLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:authenticated:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // 200 requests
  message: {
    status: 'error',
    message: 'Límite de solicitudes excedido.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit por usuario autenticado
    return req.user?.id || req.ip;
  }
});

/**
 * Middleware para seleccionar limiter basado en autenticación
 */
const smartLimiter = (req, res, next) => {
  if (req.user) {
    authenticatedLimiter(req, res, next);
  } else {
    publicLimiter(req, res, next);
  }
};

/**
 * Limpiar Redis al cerrar la aplicación
 */
const closeRedis = async () => {
  await redisClient.quit();
  logger.info('Redis connection closed');
};

process.on('SIGTERM', closeRedis);
process.on('SIGINT', closeRedis);

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
  searchLimiter,
  publicLimiter,
  authenticatedLimiter,
  smartLimiter,
  redisClient
};
