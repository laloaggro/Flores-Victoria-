/**
 * @fileoverview Security Middleware - Headers y protecciones adicionales
 * @description Middleware de seguridad con CSP, HSTS, sanitización y más
 *
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const helmet = require('helmet');

// ====================================================================
// CONFIGURACIÓN DE CONTENT SECURITY POLICY
// ====================================================================

/**
 * Configuración de CSP por entorno
 */
const getCSPConfig = () => {
  const isDev = process.env.NODE_ENV !== 'production';

  return {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // Permitir scripts inline en desarrollo para hot reload
        ...(isDev ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
        // CDNs confiables
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net',
        // Google (Analytics, Maps, OAuth)
        'https://www.google.com',
        'https://www.gstatic.com',
        'https://accounts.google.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Necesario para estilos inline
        'https://fonts.googleapis.com',
        'https://cdnjs.cloudflare.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'data:'],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
        // Proveedores de imágenes
        'https://lh3.googleusercontent.com', // Google profile pics
        'https://via.placeholder.com',
      ],
      connectSrc: [
        "'self'",
        // APIs propias
        process.env.API_URL || 'https://api.floresvictoria.com',
        // Servicios externos
        'https://www.google-analytics.com',
        'https://accounts.google.com',
        // WebSockets en desarrollo
        ...(isDev ? ['ws:', 'wss:'] : []),
      ],
      frameSrc: [
        "'self'",
        'https://accounts.google.com', // OAuth popup
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: isDev ? null : [],
    },
    reportOnly: isDev, // Solo reportar en desarrollo, bloquear en producción
  };
};

// ====================================================================
// CONFIGURACIÓN DE HELMET
// ====================================================================

/**
 * Crea middleware de Helmet con configuración optimizada
 * @param {Object} options - Opciones adicionales
 * @returns {Function} Middleware de Express
 */
function createSecurityMiddleware(options = {}) {
  const isDev = process.env.NODE_ENV !== 'production';

  return helmet({
    // Content Security Policy
    contentSecurityPolicy: options.disableCSP ? false : getCSPConfig(),

    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },

    // Prevenir clickjacking
    frameguard: {
      action: 'deny',
    },

    // Prevenir MIME sniffing
    noSniff: true,

    // XSS Protection (legacy, pero útil para navegadores antiguos)
    xssFilter: true,

    // Ocultar X-Powered-By
    hidePoweredBy: true,

    // Referrer Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

    // Permissions Policy (anteriormente Feature-Policy)
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },

    // Cross-Origin policies
    crossOriginEmbedderPolicy: !isDev, // Puede romper recursos externos en dev
    crossOriginOpenerPolicy: {
      policy: 'same-origin',
    },
    crossOriginResourcePolicy: {
      policy: 'same-origin',
    },

    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: true, // Permitir para mejor performance
    },

    // IE No Open
    ieNoOpen: true,
  });
}

// ====================================================================
// INPUT SANITIZATION
// ====================================================================

/**
 * Caracteres peligrosos para XSS
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /data:/gi,
  /vbscript:/gi,
];

/**
 * Sanitiza una cadena eliminando patrones XSS peligrosos
 * @param {string} str - Cadena a sanitizar
 * @returns {string} Cadena sanitizada
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  let sanitized = str;

  // Eliminar patrones XSS conocidos
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Escapar caracteres HTML básicos
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

/**
 * Sanitiza recursivamente un objeto
 * @param {any} obj - Objeto a sanitizar
 * @param {number} depth - Profundidad máxima (previene DoS)
 * @returns {any} Objeto sanitizado
 */
function sanitizeObject(obj, depth = 0) {
  if (depth > 10) return obj; // Prevenir recursión infinita

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // También sanitizar las keys
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value, depth + 1);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware de sanitización de inputs
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Middleware de Express
 */
function sanitizeInput(options = {}) {
  const {
    sanitizeBody = true,
    sanitizeQuery = true,
    sanitizeParams = true,
    skipPaths = [],
  } = options;

  return (req, res, next) => {
    // Verificar si debe saltar este path
    if (skipPaths.some((path) => req.path.includes(path))) {
      return next();
    }

    try {
      if (sanitizeBody && req.body) {
        req.body = sanitizeObject(req.body);
      }

      if (sanitizeQuery && req.query) {
        req.query = sanitizeObject(req.query);
      }

      if (sanitizeParams && req.params) {
        req.params = sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      // Log del error pero continuar (no bloquear requests)
      console.error('[Security] Error sanitizing input:', error.message);
      next();
    }
  };
}

// ====================================================================
// PROTECCIÓN CONTRA SQL INJECTION (capa adicional)
// ====================================================================

/**
 * Patrones de SQL injection conocidos
 * Nota: Se usan patrones simplificados para evitar escapes innecesarios
 */
const SQL_PATTERNS = [
  /('|--|#)/gi,
  /union\s+(all\s+)?select/gi,
  /exec\s+(s|x)p/gi,
  /insert\s+into/gi,
  /delete\s+from/gi,
  /drop\s+table/gi,
  /update\s+\w+\s+set/gi,
  /or\s+1\s*=\s*1/gi,
  /and\s+1\s*=\s*1/gi,
  /;\s*--/gi,
];

/**
 * Detecta posibles intentos de SQL injection
 * @param {string} str - Cadena a verificar
 * @returns {boolean} True si se detecta patrón sospechoso
 */
function detectSqlInjection(str) {
  if (typeof str !== 'string') return false;

  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(str)) {
      return true;
    }
  }
  return false;
}

/**
 * Middleware de protección contra SQL injection
 * @param {Object} options - Opciones
 * @returns {Function} Middleware
 */
function sqlInjectionProtection(options = {}) {
  const { blockRequest = true, logAttempts = true } = options;

  return (req, res, next) => {
    const checkValue = (value, location) => {
      if (typeof value === 'string' && detectSqlInjection(value)) {
        if (logAttempts) {
          console.warn('[Security] SQL injection attempt detected:', {
            ip: req.ip,
            path: req.path,
            location,
            value: value.substring(0, 100),
          });
        }
        return true;
      }
      return false;
    };

    const checkObject = (obj, location) => {
      if (!obj) return false;
      for (const [key, value] of Object.entries(obj)) {
        if (checkValue(key, location) || checkValue(value, location)) {
          return true;
        }
        if (typeof value === 'object') {
          if (checkObject(value, location)) return true;
        }
      }
      return false;
    };

    const detected =
      checkObject(req.body, 'body') ||
      checkObject(req.query, 'query') ||
      checkObject(req.params, 'params');

    if (detected && blockRequest) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request detected',
        code: 'INVALID_INPUT',
      });
    }

    next();
  };
}

// ====================================================================
// HEADERS DE SEGURIDAD ADICIONALES
// ====================================================================

/**
 * Middleware para agregar headers de seguridad adicionales
 * @returns {Function} Middleware
 */
function additionalSecurityHeaders() {
  return (req, res, next) => {
    // Prevenir caching de datos sensibles
    if (req.path.includes('/auth/') || req.path.includes('/user/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // X-Content-Type-Options ya lo maneja helmet
    // Agregar header personalizado para identificar el servicio
    res.setHeader('X-Service', 'flores-victoria');

    // Prevenir que el navegador detecte el contenido
    res.setHeader('X-Download-Options', 'noopen');

    next();
  };
}

// ====================================================================
// EXPORTS
// ====================================================================

module.exports = {
  // Middleware principal
  createSecurityMiddleware,

  // Sanitización
  sanitizeInput,
  sanitizeString,
  sanitizeObject,

  // SQL Injection
  sqlInjectionProtection,
  detectSqlInjection,

  // Headers adicionales
  additionalSecurityHeaders,

  // Configuración CSP
  getCSPConfig,

  // CSRF Protection
  csrfProtection,

  // Rate Limiting Avanzado
  advancedRateLimiter,
  getRateLimitConfig,
};

// ====================================================================
// CSRF PROTECTION
// ====================================================================

const crypto = require('crypto');

/**
 * Genera token CSRF seguro
 * @returns {string}
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware de protección CSRF
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Express middleware
 */
function csrfProtection(options = {}) {
  const {
    cookieName = '_csrf',
    headerName = 'x-csrf-token',
    ignoreMethods = ['GET', 'HEAD', 'OPTIONS'],
    cookieOptions = {},
  } = options;

  return (req, res, next) => {
    // Ignorar métodos seguros
    if (ignoreMethods.includes(req.method)) {
      // Generar token para requests GET
      if (!req.cookies?.[cookieName]) {
        const token = generateCsrfToken();
        res.cookie(cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000,
          ...cookieOptions,
        });
        req.csrfToken = token;
      } else {
        req.csrfToken = req.cookies[cookieName];
      }
      res.locals.csrfToken = req.csrfToken;
      return next();
    }

    // Verificar token en requests que modifican estado
    const cookieToken = req.cookies?.[cookieName];
    const headerToken = req.headers[headerName] || req.body?._csrf;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({
        error: true,
        message: 'Token CSRF inválido',
        code: 'CSRF_VALIDATION_FAILED',
      });
    }

    next();
  };
}

// ====================================================================
// ADVANCED RATE LIMITING
// ====================================================================

// Cache en memoria para rate limiting
const rateLimitStore = new Map();

/**
 * Configuraciones de rate limit por tipo
 */
const RATE_LIMIT_CONFIGS = {
  public: { windowMs: 60000, max: 100 },
  authenticated: { windowMs: 60000, max: 300 },
  admin: { windowMs: 60000, max: 500 },
  critical: { windowMs: 60000, max: 10 },
};

/**
 * Obtiene configuración de rate limit por tipo
 * @param {string} type - Tipo de rate limit
 * @returns {Object}
 */
function getRateLimitConfig(type = 'public') {
  return RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.public;
}

/**
 * Rate limiter avanzado con soporte Redis/memoria
 * @param {Object} options - Opciones
 * @returns {Function} Express middleware
 */
function advancedRateLimiter(options = {}) {
  const {
    windowMs = 60000,
    max = 100,
    keyGenerator = (req) => req.ip,
    skip = null,
    handler = null,
  } = options;

  return async (req, res, next) => {
    if (skip && skip(req)) {
      return next();
    }

    const key = `rate:${keyGenerator(req)}`;
    const now = Date.now();

    // Limpiar entradas antiguas
    for (const [k, v] of rateLimitStore) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k);
      }
    }

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    // Headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);

      if (handler) {
        return handler(req, res, next);
      }

      return res.status(429).json({
        error: true,
        message: 'Demasiadas solicitudes',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      });
    }

    next();
  };
}
