/**
 * @fileoverview Rate Limiting Middleware Basado en Roles
 * @description Aplica límites de tasa diferenciados según el rol del usuario
 * 
 * @example
 * const { createRoleBasedLimiter } = require('@flores-victoria/shared/middleware/role-based-limiter');
 * 
 * // Crear limiter para endpoint específico
 * const productSearchLimiter = createRoleBasedLimiter('productSearch');
 * app.get('/api/products/search', productSearchLimiter, controller);
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const { getRateLimitForRole, canBypassRateLimit, getRateLimitInfo } = require('../config/rate-limits-by-role');
const { normalizeRole, ROLES } = require('../config/roles');
const logger = require('../logging/logger').createLogger('role-based-limiter');

let redisClient = null;
let connectionErrorLogged = false;

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN DE VALKEY
// ═══════════════════════════════════════════════════════════════

/**
 * Inicializa conexión a Valkey para rate limiting distribuido
 */
function initValkey() {
  if (process.env.DISABLE_VALKEY === 'true') {
    logger.info('[RoleBasedLimiter] Valkey deshabilitado por configuración');
    return null;
  }

  try {
    const cacheUrl = process.env.VALKEY_URL;
    const client = cacheUrl
      ? new Redis(cacheUrl, {
          lazyConnect: true,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 3000)),
          enableOfflineQueue: false,
        })
      : new Redis({
          host: process.env.VALKEY_HOST || 'localhost',
          port: parseInt(process.env.VALKEY_PORT) || 6379,
          password: process.env.VALKEY_PASSWORD,
          db: parseInt(process.env.VALKEY_RATELIMIT_DB) || 2,
          lazyConnect: true,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 3000)),
          enableOfflineQueue: false,
        });

    client.on('connect', () => {
      connectionErrorLogged = false;
      logger.info('[RoleBasedLimiter] ✅ Valkey conectado');
    });

    client.on('error', (err) => {
      if (!connectionErrorLogged) {
        logger.info(`[RoleBasedLimiter] Modo memoria local: ${err.message}`);
        connectionErrorLogged = true;
      }
    });

    client.connect().catch(() => {});
    redisClient = client;
    return client;
  } catch (error) {
    logger.warn(`[RoleBasedLimiter] Error inicializando Valkey: ${error.message}`);
    return null;
  }
}

function getValkeyClient() {
  if (!redisClient) initValkey();
  return redisClient;
}

// ═══════════════════════════════════════════════════════════════
// GENERADORES DE CLAVES Y HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Extrae el rol del request
 */
function extractRole(req) {
  if (!req.user) return 'public';
  return normalizeRole(req.user.role) || 'customer';
}

/**
 * Genera clave única para rate limiting
 */
function generateKey(req, endpointType) {
  const ip = (req.ip || req.connection.remoteAddress || 'unknown').replace(/^::ffff:/, '');
  const role = extractRole(req);
  const userId = req.user?.id || req.user?.userId;

  if (userId && role !== 'public') {
    return `rbl:${endpointType}:${role}:user:${userId}`;
  }
  return `rbl:${endpointType}:${role}:ip:${ip}`;
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE FACTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Crea un middleware de rate limiting basado en rol
 * @param {string} endpointType - Tipo de endpoint (debe coincidir con BASE_LIMITS)
 * @param {Object} options - Opciones adicionales
 * @returns {Function} Express middleware
 */
function createRoleBasedLimiter(endpointType, options = {}) {
  const {
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    skipPaths = ['/health', '/live', '/metrics'],
    customMessage = null,
  } = options;

  // Cache de limiters por rol
  const limiterCache = new Map();

  return (req, res, next) => {
    const role = extractRole(req);

    // Verificar bypass
    if (canBypassRateLimit(endpointType, role)) {
      // Añadir header informativo
      res.setHeader('X-RateLimit-Bypass', 'true');
      res.setHeader('X-RateLimit-Role', role);
      return next();
    }

    // Skip paths configurados
    if (skipPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Obtener o crear limiter para este rol
    const cacheKey = `${endpointType}:${role}`;
    
    if (!limiterCache.has(cacheKey)) {
      const limitConfig = getRateLimitForRole(endpointType, role);
      
      const limiterConfig = {
        windowMs: limitConfig.windowMs,
        max: limitConfig.max,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        skipFailedRequests,
        keyGenerator: (req) => generateKey(req, endpointType),
        handler: (req, res) => {
          const info = getRateLimitInfo(endpointType, role);
          
          logger.warn('[RoleBasedLimiter] Límite alcanzado', {
            endpoint: endpointType,
            role,
            userId: req.user?.id || 'anonymous',
            ip: req.ip,
            limit: info.max,
            window: info.windowMinutes,
          });

          res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: customMessage || `Demasiadas solicitudes. Límite: ${info.max} cada ${info.windowMinutes} minutos.`,
              retryAfter: res.getHeader('Retry-After'),
              limit: info.max,
              windowMinutes: info.windowMinutes,
              role: role,
              upgrade: role === 'public' 
                ? 'Inicia sesión para obtener límites más altos'
                : role === 'customer'
                  ? 'Contacta soporte si necesitas límites más altos'
                  : null,
            },
          });
        },
      };

      // Agregar Redis store si está disponible
      const client = getValkeyClient();
      if (client && client.status === 'ready') {
        limiterConfig.store = new RedisStore({
          client,
          prefix: `rbl:${endpointType}:${role}:`,
        });
      }

      limiterCache.set(cacheKey, rateLimit(limiterConfig));
      
      logger.debug(`[RoleBasedLimiter] Limiter creado`, {
        endpoint: endpointType,
        role,
        max: limitConfig.max,
        windowMs: limitConfig.windowMs,
      });
    }

    // Añadir headers informativos
    const info = getRateLimitInfo(endpointType, role);
    res.setHeader('X-RateLimit-Role', role);
    res.setHeader('X-RateLimit-Limit-For-Role', info.max);

    // Aplicar el limiter
    limiterCache.get(cacheKey)(req, res, next);
  };
}

/**
 * Middleware para añadir información de rate limit a todas las respuestas
 */
function rateLimitInfoMiddleware(endpointType) {
  return (req, res, next) => {
    const role = extractRole(req);
    const info = getRateLimitInfo(endpointType, role);
    
    // Guardar en request para uso en controladores
    req.rateLimitInfo = info;
    
    next();
  };
}

/**
 * Middleware de rate limiting dinámico que usa headers del request
 */
function dynamicRoleLimiter(getEndpointType) {
  return (req, res, next) => {
    const endpointType = typeof getEndpointType === 'function' 
      ? getEndpointType(req) 
      : getEndpointType;
    
    const limiter = createRoleBasedLimiter(endpointType);
    return limiter(req, res, next);
  };
}

// ═══════════════════════════════════════════════════════════════
// LIMITERS PRE-CONFIGURADOS
// ═══════════════════════════════════════════════════════════════

// Auth
const loginLimiter = createRoleBasedLimiter('login', { skipSuccessfulRequests: true });
const registerLimiter = createRoleBasedLimiter('register');
const passwordResetLimiter = createRoleBasedLimiter('passwordReset');

// Products
const productSearchLimiter = createRoleBasedLimiter('productSearch');
const productBrowseLimiter = createRoleBasedLimiter('productBrowse');
const productCreateLimiter = createRoleBasedLimiter('productCreate');
const productUpdateLimiter = createRoleBasedLimiter('productUpdate');

// Cart & Orders
const cartLimiter = createRoleBasedLimiter('cartOperations');
const orderCreateLimiter = createRoleBasedLimiter('orderCreate');
const orderViewLimiter = createRoleBasedLimiter('orderView');
const orderUpdateLimiter = createRoleBasedLimiter('orderUpdate');

// Reviews
const reviewCreateLimiter = createRoleBasedLimiter('reviewCreate');
const reviewModerateLimiter = createRoleBasedLimiter('reviewModerate');

// Files & Contact
const uploadLimiter = createRoleBasedLimiter('fileUpload');
const contactFormLimiter = createRoleBasedLimiter('contactForm');

// Admin
const adminDashboardLimiter = createRoleBasedLimiter('adminDashboard');
const adminReportsLimiter = createRoleBasedLimiter('adminReports');

// Notifications
const notificationLimiter = createRoleBasedLimiter('notificationSend');

// General API
const apiGeneralLimiter = createRoleBasedLimiter('apiGeneral');

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Factory
  createRoleBasedLimiter,
  dynamicRoleLimiter,
  rateLimitInfoMiddleware,
  
  // Helpers
  extractRole,
  generateKey,
  initValkey,
  getValkeyClient,
  
  // Pre-configured limiters - Auth
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  
  // Pre-configured limiters - Products
  productSearchLimiter,
  productBrowseLimiter,
  productCreateLimiter,
  productUpdateLimiter,
  
  // Pre-configured limiters - Cart & Orders
  cartLimiter,
  orderCreateLimiter,
  orderViewLimiter,
  orderUpdateLimiter,
  
  // Pre-configured limiters - Reviews
  reviewCreateLimiter,
  reviewModerateLimiter,
  
  // Pre-configured limiters - Files & Contact
  uploadLimiter,
  contactFormLimiter,
  
  // Pre-configured limiters - Admin
  adminDashboardLimiter,
  adminReportsLimiter,
  
  // Pre-configured limiters - Other
  notificationLimiter,
  apiGeneralLimiter,
};
