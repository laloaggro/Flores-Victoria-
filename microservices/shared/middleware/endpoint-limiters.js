/**
 * @fileoverview Rate Limiting Middleware por Endpoint Específico
 * @description Configuración granular de rate limiting para diferentes endpoints
 *              con soporte para tiering, Redis, y logging detallado
 * 
 * @example
 * const endpointLimiters = require('@flores-victoria/shared/middleware/endpoint-limiters');
 * 
 * app.post('/api/auth/login', endpointLimiters.loginLimiter, authController.login);
 * app.get('/api/products/search', endpointLimiters.searchLimiter, productController.search);
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const logger = require('../logging/logger').createLogger('endpoint-limiters');

let redisClient = null;

/**
 * Inicializa Valkey para rate limiting distribuido
 */
function initValkeyForEndpointLimiters() {
  if (process.env.DISABLE_VALKEY === 'true' || process.env.USE_VALKEY === 'false') {
    logger.info('[EndpointLimiters] Valkey deshabilitado');
    return null;
  }

  try {
    let client;
    const cacheUrl = process.env.VALKEY_URL;
    if (cacheUrl) {
      client = new Redis(cacheUrl, {
        lazyConnect: true,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 50, 2000)),
      });
    } else {
      client = new Redis({
        host: process.env.VALKEY_HOST || 'localhost',
        port: process.env.VALKEY_PORT || 6379,
        password: process.env.VALKEY_PASSWORD,
        db: process.env.VALKEY_RATELIMIT_DB || 2,
        lazyConnect: true,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 50, 2000)),
      });
    }

    // Registrar manejadores ANTES de conectar
    client.on('connect', () => logger.info('[EndpointLimiters] Valkey conectado'));
    client.on('error', (err) =>
      logger.warn(`[EndpointLimiters] Valkey error: ${err.message}`)
    );

    // Conectar de forma asíncrona
    client.connect().catch((err) => {
      logger.warn(`[EndpointLimiters] Valkey connection failed: ${err.message}`);
    });

    redisClient = client;
    return client;
  } catch (error) {
    logger.warn(`[EndpointLimiters] No se pudo inicializar Valkey: ${error.message}`);
    return null;
  }
}

/**
 * Obtiene el cliente Valkey
 */
function getValkeyClient() {
  if (!redisClient) {
    initValkeyForEndpointLimiters();
  }
  return redisClient;
}

/**
 * Detecta el nivel del usuario
 */
function detectTier(req) {
  if (!req.user) return 'public';
  return req.user.role === 'admin' ? 'admin' : 'authenticated';
}

/**
 * Genera clave de rate limiting
 */
function generateLimiterKey(req, prefix) {
  const ip = (req.ip || req.connection.remoteAddress || 'unknown').replace(/^::ffff:/, '');
  const userId = req.user?.id || null;
  const tier = detectTier(req);

  // Usar userId si está disponible y autenticado
  if (userId && tier !== 'public') {
    return `${prefix}:${tier}:user:${userId}`;
  }
  return `${prefix}:${tier}:ip:${ip}`;
}

/**
 * Handler cuando se alcanza el límite
 */
function handleLimitExceeded(req, res, options = {}) {
  const ip = (req.ip || req.connection.remoteAddress).replace(/^::ffff:/, '');
  const userId = req.user?.id || 'anonymous';
  const tier = detectTier(req);

  logger.warn('[EndpointLimiters] Límite alcanzado', {
    tier,
    userId,
    ip,
    endpoint: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  res.status(429).json({
    status: 'fail',
    message: options.message || 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    retryAfter: res.getHeader('Retry-After'),
  });
}

/**
 * Crea un limiter personalizado
 */
function createEndpointLimiter(config) {
  const {
    name,
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Demasiadas solicitudes',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyPrefix = 'endpoint',
  } = config;

  const limiterConfig = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: (req) => generateLimiterKey(req, keyPrefix),
    skip: (req) => {
      // Skipear health checks y requests internos
      const skipPaths = ['/health', '/live', '/metrics', '/.well-known'];
      if (skipPaths.some((path) => req.path.startsWith(path))) {
        return true;
      }
      // Skipear IPs whitelisteadas
      const ip = req.ip || req.connection.remoteAddress;
      const whitelist = (process.env.RATE_LIMIT_WHITELIST || '').split(',').filter(Boolean);
      return whitelist.includes(ip);
    },
    handler: (req, res) => handleLimitExceeded(req, res, { message }),
  };

  // Agregar store de Valkey si está disponible
  const client = getValkeyClient();
  if (client && client.status === 'ready') {
    limiterConfig.store = new RedisStore({
      client,
      prefix: `${keyPrefix}:`,
    });
  }

  const limiter = rateLimit(limiterConfig);

  logger.info(`[EndpointLimiters] Limiter creado: ${name}`, {
    windowMs,
    max,
    useValkey: !!client,
  });

  return limiter;
}

// ============================================================
// LIMITERS ESPECÍFICOS POR ENDPOINT
// ============================================================

/**
 * CRÍTICO: Login - 5 intentos por 15 minutos
 */
const loginLimiter = createEndpointLimiter({
  name: 'login',
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 10,
  message: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.',
  skipSuccessfulRequests: true, // Solo contar intentos fallidos
  keyPrefix: 'auth:login',
});

/**
 * CRÍTICO: Register - 3 intentos por hora
 */
const registerLimiter = createEndpointLimiter({
  name: 'register',
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 3 : 10,
  message: 'Demasiados intentos de registro. Por favor, intenta de nuevo en 1 hora.',
  keyPrefix: 'auth:register',
});

/**
 * CRÍTICO: Password Reset - 3 intentos por hora
 */
const passwordResetLimiter = createEndpointLimiter({
  name: 'password-reset',
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 3 : 10,
  message: 'Demasiados intentos de reset. Por favor, intenta de nuevo en 1 hora.',
  keyPrefix: 'auth:password-reset',
});

/**
 * ALTO: Búsqueda de productos - 30 por minuto
 */
const searchLimiter = createEndpointLimiter({
  name: 'search',
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 60,
  message: 'Demasiadas búsquedas. Por favor, reduce la frecuencia.',
  keyPrefix: 'api:search',
});

/**
 * ALTO: Listado de productos - 100 por 5 minutos
 */
const browseLimiter = createEndpointLimiter({
  name: 'browse',
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 200,
  message: 'Demasiados requests. Por favor, intenta de nuevo en 5 minutos.',
  keyPrefix: 'api:browse',
});

/**
 * ALTO: Crear/Actualizar carrito - 50 por 5 minutos
 */
const cartLimiter = createEndpointLimiter({
  name: 'cart',
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 100,
  message: 'Demasiadas operaciones de carrito. Por favor, intenta de nuevo en 5 minutos.',
  keyPrefix: 'api:cart',
});

/**
 * CRÍTICO: Crear orden - 10 por hora
 */
const createOrderLimiter = createEndpointLimiter({
  name: 'create-order',
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 20,
  message: 'Demasiadas órdenes creadas. Por favor, intenta de nuevo en 1 hora.',
  keyPrefix: 'api:orders:create',
});

/**
 * ALTO: Crear/Actualizar review - 20 por día
 */
const createReviewLimiter = createEndpointLimiter({
  name: 'create-review',
  windowMs: 24 * 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 50,
  message: 'Límite de reviews alcanzado. Intenta de nuevo mañana.',
  keyPrefix: 'api:reviews:create',
});

/**
 * CRÍTICO: Upload de archivo - 20 por hora
 */
const uploadLimiter = createEndpointLimiter({
  name: 'upload',
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 50,
  message: 'Límite de uploads alcanzado. Por favor, intenta de nuevo en 1 hora.',
  keyPrefix: 'api:upload',
});

/**
 * MODERADO: Contact form - 3 por hora
 */
const contactFormLimiter = createEndpointLimiter({
  name: 'contact',
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Límite de formularios alcanzado. Por favor, intenta de nuevo en 1 hora.',
  keyPrefix: 'api:contact',
});

/**
 * MODERADO: Endpoints API generales - 200 por minuto
 */
const apiGeneralLimiter = createEndpointLimiter({
  name: 'api-general',
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 500,
  message: 'Rate limit exceeded',
  keyPrefix: 'api:general',
});

module.exports = {
  // Inicialización
  initValkeyForEndpointLimiters,
  getValkeyClient,
  createEndpointLimiter,

  // Limiters específicos
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  searchLimiter,
  browseLimiter,
  cartLimiter,
  createOrderLimiter,
  createReviewLimiter,
  uploadLimiter,
  contactFormLimiter,
  apiGeneralLimiter,

  // Utilidades
  detectTier,
  generateLimiterKey,
  handleLimitExceeded,
};
