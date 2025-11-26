/**
 * @fileoverview Advanced Rate Limiting Middleware con Redis
 * @description Sistema de rate limiting distribuido con soporte para
 *              diferentes niveles de límites según autenticación y rol
 *
 * @features
 * - Rate limiting distribuido con Redis
 * - Límites por nivel (público, autenticado, admin)
 * - Whitelist de IPs
 * - Límites personalizados por endpoint
 * - Headers informativos (RateLimit-*)
 * - Logging de intentos bloqueados
 *
 * @author Flores Victoria Team
 * @version 3.0.0
 */

const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const RedisStore = require('rate-limit-redis');

// ====================================================================
// CONFIGURACIÓN DE REDIS
// ====================================================================

let redisClient = null;

/**
 * Inicializa el cliente Redis para rate limiting
 * @param {Object} options - Opciones de configuración de Redis
 * @returns {Redis} Cliente Redis configurado
 */
function initRedisClient(options = {}) {
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  const redisConfig = {
    host: options.host || process.env.REDIS_HOST || 'localhost',
    port: options.port || process.env.REDIS_PORT || 6379,
    password: options.password || process.env.REDIS_PASSWORD,
    db: options.db || process.env.REDIS_RATELIMIT_DB || 2,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  };

  redisClient = new Redis(redisConfig);

  redisClient.on('error', (err) => {
    console.warn('[RateLimiter] Redis error:', err.message);
  });

  redisClient.on('connect', () => {
    console.warn('[RateLimiter] Redis connected successfully');
  });

  return redisClient;
}

/**
 * Obtiene el cliente Redis actual (lazy initialization)
 * @returns {Redis} Cliente Redis
 */
function getRedisClient() {
  if (!redisClient || redisClient.status !== 'ready') {
    return initRedisClient();
  }
  return redisClient;
}

// ====================================================================
// CONFIGURACIÓN DE LÍMITES POR NIVEL
// ====================================================================

/**
 * Límites predefinidos por nivel de acceso
 * @version 3.0 - Límites más estrictos en producción
 * @type {Object}
 */
const isProduction = process.env.NODE_ENV === 'production';

const RATE_LIMIT_TIERS = {
  // Endpoints públicos sin autenticación
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isProduction ? 50 : 100, // 50 prod, 100 dev
    message: 'Demasiadas solicitudes. Por favor, intenta de nuevo en 15 minutos.',
    skipSuccessfulRequests: false, // Contar todos los requests
  },

  // Usuarios autenticados
  authenticated: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isProduction ? 500 : 1000, // 500 prod, 1000 dev
    message: 'Límite de solicitudes alcanzado. Por favor, intenta de nuevo en 15 minutos.',
    skipSuccessfulRequests: false,
  },

  // Administradores
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isProduction ? 2000 : 5000, // 2000 prod, 5000 dev
    message: 'Límite de solicitudes alcanzado. Por favor, intenta de nuevo en 15 minutos.',
    skipSuccessfulRequests: false,
  },

  // Endpoints críticos (login, register, password reset)
  critical: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isProduction ? 5 : 10, // 5 prod, 10 dev - MÁS ESTRICTO
    message: 'Demasiados intentos de autenticación. Por favor, intenta de nuevo en 15 minutos.',
    skipSuccessfulRequests: true, // Solo contar intentos fallidos
    skipFailedRequests: false,
  },

  // Endpoints de búsqueda intensiva
  search: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: isProduction ? 20 : 30, // 20 prod, 30 dev
    message: 'Demasiadas búsquedas. Por favor, reduce la frecuencia.',
    skipSuccessfulRequests: false,
  },

  // Endpoints de carga de archivos
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: isProduction ? 20 : 50, // 20 prod, 50 dev - MÁS ESTRICTO
    message: 'Límite de uploads alcanzado. Por favor, intenta de nuevo en 1 hora.',
    skipSuccessfulRequests: false,
  },

  // Endpoints de API pública (sin auth) - MUY ESTRICTO
  apiPublic: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: isProduction ? 30 : 60, // 30 prod, 60 dev
    message: 'Rate limit exceeded. Please try again in 5 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  },
};

// ====================================================================
// WHITELIST DE IPS
// ====================================================================

/**
 * Lista de IPs que no están sujetas a rate limiting
 * @type {Set<string>}
 */
const IP_WHITELIST = new Set([
  '127.0.0.1',
  '::1',
  'localhost',
  // Agregar IPs de monitoreo, health checks, etc.
  ...(process.env.RATE_LIMIT_WHITELIST || '').split(',').filter(Boolean),
]);

/**
 * Verifica si una IP está en la whitelist
 * @param {string} ip - Dirección IP a verificar
 * @returns {boolean} True si está en whitelist
 */
function isWhitelisted(ip) {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  // Normalizar IP (remover ::ffff: prefix de IPv6-mapped IPv4)
  const normalizedIp = ip.replace(/^::ffff:/, '');
  return IP_WHITELIST.has(normalizedIp) || IP_WHITELIST.has(ip);
}

/**
 * Agrega una IP a la whitelist
 * @param {string} ip - Dirección IP a agregar
 */
function addToWhitelist(ip) {
  IP_WHITELIST.add(ip);
  console.warn(`[RateLimiter] IP agregada a whitelist: ${ip}`);
}

/**
 * Remueve una IP de la whitelist
 * @param {string} ip - Dirección IP a remover
 */
function removeFromWhitelist(ip) {
  IP_WHITELIST.delete(ip);
  console.warn(`[RateLimiter] IP removida de whitelist: ${ip}`);
}

// ====================================================================
// FUNCIONES DE DETECCIÓN DE NIVEL
// ====================================================================

/**
 * Detecta el nivel de acceso del usuario basado en el token JWT
 * @param {Object} req - Request de Express
 * @returns {string} Nivel: 'public', 'authenticated', 'admin'
 */
function detectUserTier(req) {
  // Si no hay token, es público
  if (!req.headers.authorization && !req.user) {
    return 'public';
  }

  // Si hay usuario en req (ya autenticado por middleware previo)
  if (req.user) {
    const role = req.user.role || req.user.rol;
    if (role === 'admin' || role === 'administrator') {
      return 'admin';
    }
    return 'authenticated';
  }

  // Si hay token pero no user, asumimos autenticado
  return 'authenticated';
}

/**
 * Genera una clave única para rate limiting
 * @param {Object} req - Request de Express
 * @param {string} prefix - Prefijo para la clave
 * @returns {string} Clave única
 */
function generateKey(req, prefix = 'rl') {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = req.user?.id || req.user?.userId || 'anonymous';
  const tier = detectUserTier(req);

  return `${prefix}:${tier}:${userId}:${ip}`;
}

// ====================================================================
// HANDLER DE LÍMITE ALCANZADO
// ====================================================================

/**
 * Handler cuando se alcanza el límite de rate
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
function rateLimitHandler(req, res) {
  const ip = req.ip || req.connection.remoteAddress;
  const userId = req.user?.id || 'anonymous';
  const tier = detectUserTier(req);
  const endpoint = req.originalUrl || req.url;

  console.warn(`[RateLimiter] Límite alcanzado:`, {
    ip,
    userId,
    tier,
    endpoint,
    timestamp: new Date().toISOString(),
  });

  // Registrar en sistema de logging si está disponible
  if (req.logger) {
    req.logger.warn('Rate limit exceeded', {
      ip,
      userId,
      tier,
      endpoint,
    });
  }

  res.status(429).json({
    status: 'fail',
    message: 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    retryAfter: res.getHeader('Retry-After'),
  });
}

// ====================================================================
// FUNCIONES PRINCIPALES DE RATE LIMITING
// ====================================================================

/**
 * Crea un rate limiter con configuración personalizada
 * @param {Object} options - Opciones de configuración
 * @param {string} options.tier - Nivel de límite ('public', 'authenticated', 'admin', 'critical', 'search', 'upload')
 * @param {number} options.windowMs - Ventana de tiempo en ms
 * @param {number} options.max - Número máximo de requests
 * @param {string} options.message - Mensaje personalizado
 * @param {boolean} options.useRedis - Usar Redis (default: true si disponible)
 * @param {string} options.keyPrefix - Prefijo para las keys de Redis
 * @returns {Function} Middleware de rate limiting
 */
function createRateLimiter(options = {}) {
  const tier = options.tier || 'public';
  const tierConfig = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.public;

  const config = {
    windowMs: options.windowMs || tierConfig.windowMs,
    max: options.max || tierConfig.max,
    message: options.message || tierConfig.message,
    standardHeaders: true, // Incluir headers RateLimit-*
    legacyHeaders: false, // Deshabilitar X-RateLimit-*
    keyGenerator: (req) => generateKey(req, options.keyPrefix || `rl:${tier}`),
    skip: (req) => {
      const ip = req.ip || req.connection.remoteAddress;
      return isWhitelisted(ip);
    },
    handler: rateLimitHandler,
  };

  // Usar Redis Store si está disponible y habilitado
  if (options.useRedis !== false) {
    try {
      const client = getRedisClient();
      if (client && client.status === 'ready') {
        config.store = new RedisStore({
          // @ts-expect-error - Redis client typing issue
          client,
          prefix: options.keyPrefix || `rl:${tier}:`,
        });
      }
    } catch (error) {
      console.warn('[RateLimiter] Redis no disponible, usando memoria:', error.message);
    }
  }

  return rateLimit(config);
}

/**
 * Rate limiter para endpoints públicos (sin autenticación)
 * @param {Object} customOptions - Opciones personalizadas
 * @returns {Function} Middleware
 */
const publicLimiter = createRateLimiter({
  tier: 'public',
});

/**
 * Rate limiter para usuarios autenticados
 * @param {Object} customOptions - Opciones personalizadas
 * @returns {Function} Middleware
 */
const authenticatedLimiter = createRateLimiter({
  tier: 'authenticated',
});

/**
 * Rate limiter para administradores
 * @type {Function} Middleware
 */
const adminLimiter = createRateLimiter({
  tier: 'admin',
});

/**
 * Rate limiter para endpoints críticos (login, register, etc.)
 * @type {Function} Middleware
 */
const criticalLimiter = createRateLimiter({
  tier: 'critical',
});

/**
 * Rate limiter para búsquedas
 * @type {Function} Middleware
 */
const searchLimiter = createRateLimiter({
  tier: 'search',
});

/**
 * Rate limiter para uploads
 * @type {Function} Middleware
 */
const uploadLimiter = createRateLimiter({
  tier: 'upload',
});

/**
 * Rate limiter adaptativo que detecta automáticamente el nivel
 * @param {Object} customOptions - Opciones personalizadas
 * @returns {Function} Middleware
 */
function adaptiveLimiter(customOptions = {}) {
  return (req, res, next) => {
    const tier = detectUserTier(req);
    const limiter = createRateLimiter({
      tier,
      ...customOptions,
    });
    return limiter(req, res, next);
  };
}

// ====================================================================
// UTILIDADES
// ====================================================================

/**
 * Obtiene estadísticas de rate limiting para una IP o usuario
 * @param {string} identifier - IP o user ID
 * @param {string} tier - Nivel de límite
 * @returns {Promise<Object>} Estadísticas
 */
async function getRateLimitStats(identifier, tier = 'public') {
  try {
    const client = getRedisClient();
    const key = `rl:${tier}:${identifier}`;
    const value = await client.get(key);
    const ttl = await client.ttl(key);

    return {
      identifier,
      tier,
      remaining: value
        ? Math.max(0, RATE_LIMIT_TIERS[tier].max - parseInt(value))
        : RATE_LIMIT_TIERS[tier].max,
      reset: ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : null,
      limit: RATE_LIMIT_TIERS[tier].max,
    };
  } catch (error) {
    console.error('[RateLimiter] Error obteniendo stats:', error.message);
    return null;
  }
}

/**
 * Resetea el rate limit para un identificador específico
 * @param {string} identifier - IP o user ID
 * @param {string} tier - Nivel de límite
 * @returns {Promise<boolean>} True si se reseteó exitosamente
 */
async function resetRateLimit(identifier, tier = 'public') {
  try {
    const client = getRedisClient();
    const key = `rl:${tier}:${identifier}`;
    await client.del(key);
    console.warn(`[RateLimiter] Rate limit reseteado: ${key}`);
    return true;
  } catch (error) {
    console.error('[RateLimiter] Error reseteando rate limit:', error.message);
    return false;
  }
}

/**
 * Cierra la conexión de Redis
 * @returns {Promise<void>}
 */
async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.warn('[RateLimiter] Redis connection closed');
  }
}

// ====================================================================
// EXPORTS
// ====================================================================

module.exports = {
  // Inicialización
  initRedisClient,
  getRedisClient,
  closeRedisConnection,

  // Rate limiters por nivel
  publicLimiter,
  authenticatedLimiter,
  adminLimiter,
  criticalLimiter,
  searchLimiter,
  uploadLimiter,
  adaptiveLimiter,

  // Creación personalizada
  createRateLimiter,

  // Whitelist management
  isWhitelisted,
  addToWhitelist,
  removeFromWhitelist,

  // Utilidades
  getRateLimitStats,
  resetRateLimit,
  detectUserTier,
  generateKey,

  // Constantes
  RATE_LIMIT_TIERS,
  IP_WHITELIST,
};
