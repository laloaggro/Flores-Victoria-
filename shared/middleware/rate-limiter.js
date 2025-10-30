/**
 * Sistema avanzado de Rate Limiting con Redis
 *
 * Características:
 * - Límites por usuario (userId de JWT)
 * - Límites por endpoint
 * - Límites por IP (fallback)
 * - Headers informativos (X-RateLimit-*)
 * - Bypass para admins/servicios internos
 * - Integración con logging y error handling
 */

const { TooManyRequestsError } = require('../errors/AppError');

/**
 * Configuración de límites por defecto
 */
const DEFAULT_LIMITS = {
  // Límites globales (por IP)
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000,
  },
  
  // Límites por usuario autenticado
  perUser: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500,
  },
  
  // Límites por endpoint crítico
  strict: {
    windowMs: 60 * 1000, // 1 minuto
    max: 10,
  },
  
  // Límites para login/registro (prevenir brute force)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,
  },
};

/**
 * Extrae userId del request (desde JWT)
 * @param {Object} req - Express request object
 * @returns {string|null} - User ID o null si no autenticado
 */
function getUserId(req) {
  if (req.user && req.user.id) {
    return req.user.id;
  }
  if (req.user && req.user.userId) {
    return req.user.userId;
  }
  return null;
}

/**
 * Extrae IP del request (considera proxies)
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Verifica si el usuario tiene bypass de rate limiting
 * @param {Object} req - Express request object
 * @returns {boolean} - true si debe hacer bypass
 */
function shouldBypass(req) {
  // Bypass para admins
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return true;
  }
  
  // Bypass para servicios internos (autenticación con API key específica)
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
    return true;
  }
  
  // Bypass para health checks
  if (req.path === '/health' || req.path === '/ready' || req.path === '/metrics') {
    return true;
  }
  
  return false;
}

/**
 * Crea middleware de rate limiting con Redis
 * @param {Object} redisClient - Cliente de Redis
 * @param {Object} options - Opciones de configuración
 * @param {number} options.windowMs - Ventana de tiempo en ms
 * @param {number} options.max - Máximo de requests por ventana
 * @param {string} options.keyPrefix - Prefijo para keys de Redis
 * @param {string} options.scope - Scope del rate limit ('global', 'user', 'ip')
 * @returns {Function} - Express middleware
 */
function createRateLimiter(redisClient, options = {}) {
  const {
    windowMs = DEFAULT_LIMITS.global.windowMs,
    max = DEFAULT_LIMITS.global.max,
    keyPrefix = 'ratelimit',
    scope = 'user', // 'user', 'ip', 'endpoint'
  } = options;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req, res, next) => {
    try {
      // Bypass si aplica
      if (shouldBypass(req)) {
        req.log?.debug('Rate limit bypassed', {
          user: req.user?.id,
          role: req.user?.role,
          path: req.path,
        });
        return next();
      }

      // Determinar la key según el scope
      let rateLimitKey;
      let identifier;

      switch (scope) {
        case 'user':
          identifier = getUserId(req);
          if (!identifier) {
            // Si no está autenticado, usar IP como fallback
            identifier = getClientIp(req);
            rateLimitKey = `${keyPrefix}:ip:${identifier}`;
          } else {
            rateLimitKey = `${keyPrefix}:user:${identifier}`;
          }
          break;

        case 'ip':
          identifier = getClientIp(req);
          rateLimitKey = `${keyPrefix}:ip:${identifier}`;
          break;

        case 'endpoint': {
          identifier = getUserId(req) || getClientIp(req);
          const endpoint = `${req.method}:${req.route?.path || req.path}`;
          rateLimitKey = `${keyPrefix}:endpoint:${identifier}:${endpoint}`;
          break;
        }

        default:
          identifier = getUserId(req) || getClientIp(req);
          rateLimitKey = `${keyPrefix}:${identifier}`;
      }

      // Incrementar contador en Redis con TTL
      const current = await redisClient.incr(rateLimitKey);
      
      // Si es el primer request, establecer TTL
      if (current === 1) {
        await redisClient.expire(rateLimitKey, windowSeconds);
      }

      // Obtener TTL restante
      const ttl = await redisClient.ttl(rateLimitKey);
      const resetTime = Date.now() + ttl * 1000;

      // Headers informativos
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      res.setHeader('X-RateLimit-Reset', resetTime);

      // Verificar si excedió el límite
      if (current > max) {
        const retryAfter = ttl;
        res.setHeader('Retry-After', retryAfter);

        req.log?.warn('Rate limit exceeded', {
          identifier,
          scope,
          current,
          max,
          retryAfter,
          path: req.path,
          method: req.method,
        });

        throw new TooManyRequestsError(
          'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.',
          {
            limit: max,
            current,
            window: `${windowSeconds}s`,
            retryAfter,
            resetTime,
          }
        );
      }

      // Log para debugging (solo en desarrollo o si está muy cerca del límite)
      if (current > max * 0.8) {
        req.log?.info('Rate limit warning', {
          identifier,
          scope,
          current,
          max,
          remaining: max - current,
        });
      }

      next();
    } catch (err) {
      // Si es TooManyRequestsError, dejarlo pasar al error handler
      if (err instanceof TooManyRequestsError) {
        return next(err);
      }

      // Si Redis falla, loggear pero NO bloquear requests (fail open)
      req.log?.error('Rate limiter error', {
        error: err.message,
        stack: err.stack,
      });
      
      // Continuar sin rate limiting si Redis no está disponible
      next();
    }
  };
}

/**
 * Rate limiter global (por IP, límites generosos)
 */
function globalRateLimiter(redisClient) {
  return createRateLimiter(redisClient, {
    windowMs: DEFAULT_LIMITS.global.windowMs,
    max: DEFAULT_LIMITS.global.max,
    keyPrefix: 'rl:global',
    scope: 'ip',
  });
}

/**
 * Rate limiter por usuario (más restrictivo)
 */
function userRateLimiter(redisClient) {
  return createRateLimiter(redisClient, {
    windowMs: DEFAULT_LIMITS.perUser.windowMs,
    max: DEFAULT_LIMITS.perUser.max,
    keyPrefix: 'rl:user',
    scope: 'user',
  });
}

/**
 * Rate limiter para endpoints de autenticación (brute force prevention)
 */
function authRateLimiter(redisClient) {
  return createRateLimiter(redisClient, {
    windowMs: DEFAULT_LIMITS.auth.windowMs,
    max: DEFAULT_LIMITS.auth.max,
    keyPrefix: 'rl:auth',
    scope: 'ip', // Por IP para evitar bypass sin autenticación
  });
}

/**
 * Rate limiter estricto para operaciones críticas
 */
function strictRateLimiter(redisClient) {
  return createRateLimiter(redisClient, {
    windowMs: DEFAULT_LIMITS.strict.windowMs,
    max: DEFAULT_LIMITS.strict.max,
    keyPrefix: 'rl:strict',
    scope: 'endpoint',
  });
}

/**
 * Rate limiter personalizado con opciones flexibles
 * @param {Object} redisClient - Cliente de Redis
 * @param {Object} customOptions - Opciones personalizadas
 * @returns {Function} - Express middleware
 */
function customRateLimiter(redisClient, customOptions) {
  return createRateLimiter(redisClient, {
    ...DEFAULT_LIMITS.perUser,
    ...customOptions,
  });
}

module.exports = {
  // Middleware factories
  createRateLimiter,
  globalRateLimiter,
  userRateLimiter,
  authRateLimiter,
  strictRateLimiter,
  customRateLimiter,
  
  // Utilidades
  getUserId,
  getClientIp,
  shouldBypass,
  
  // Constantes
  DEFAULT_LIMITS,
};
