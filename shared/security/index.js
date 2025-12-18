/**
 * Security Configuration Module
 * Centraliza configuraciones de seguridad para microservices
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

/**
 * Configuración de CORS
 * Define qué orígenes pueden acceder a la API
 */
const corsOptions = {
  origin(origin, callback) {
    // Lista blanca de orígenes permitidos
    const whitelist = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://flores-victoria.com',
      'https://www.flores-victoria.com',
      'https://admin.flores-victoria.com',
    ];

    // En desarrollo, permitir requests sin origin (Postman, curl, etc.)
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Permitir cookies
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 horas - cuánto tiempo el browser puede cachear la respuesta preflight
};

/**
 * Configuración de Helmet
 * Headers de seguridad HTTP
 */
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Para estilos inline si es necesario
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
};

/**
 * Rate Limiting por IP
 * Previene ataques de fuerza bruta y DDoS
 */
const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de requests por ventana
    message: {
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Retornar info en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  };

  return rateLimit({ ...defaults, ...options });
};

/**
 * Rate Limiter estricto para endpoints sensibles
 * (login, registro, cambio de contraseña, etc.)
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many attempts, please try again after 15 minutes.',
  },
});

/**
 * Input Sanitization
 * Previene ataques de injection (XSS, SQL, NoSQL)
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remover caracteres peligrosos
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Iframe tags
    .replace(/javascript:/gi, '') // JavaScript protocol
    .replace(/on\w+\s*=/gi, '') // Event handlers (onclick, onerror, etc.)
    .trim();
};

/**
 * Sanitizar objeto completo recursivamente
 */
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

/**
 * Middleware de sanitización para Express
 */
const sanitizationMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * Security Headers Middleware
 * Añade headers de seguridad adicionales
 */
const securityHeadersMiddleware = (req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Política de referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (antes Feature Policy)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

  next();
};

/**
 * Configuración completa de seguridad
 * Aplica todos los middlewares de seguridad
 */
const setupSecurity = (app) => {
  // CORS
  app.use(cors(corsOptions));

  // Helmet (Security Headers)
  app.use(helmet(helmetConfig));

  // Security Headers adicionales
  app.use(securityHeadersMiddleware);

  // Input Sanitization
  app.use(sanitizationMiddleware);

  // Rate Limiting global
  app.use(createRateLimiter());

  // Deshabilitar powered-by
  app.disable('x-powered-by');

  return {
    strictRateLimiter, // Export para usar en rutas específicas
    createRateLimiter, // Export para configuraciones custom
  };
};

module.exports = {
  setupSecurity,
  corsOptions,
  helmetConfig,
  createRateLimiter,
  strictRateLimiter,
  sanitizeInput,
  sanitizeObject,
  sanitizationMiddleware,
  securityHeadersMiddleware,
};
