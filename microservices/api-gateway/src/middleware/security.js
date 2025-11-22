const helmet = require('helmet');

/**
 * Configuración de Helmet para seguridad de headers HTTP
 * Implementa múltiples headers de seguridad
 * @version 3.0 - Configuración mejorada para producción
 */
const isProduction = process.env.NODE_ENV === 'production';

const helmetConfig = helmet({
  // Content Security Policy - Más restrictivo en producción
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        isProduction ? "'sha256-HASH'" : "'unsafe-inline'", // Producción: usar hashes
        'https://fonts.googleapis.com',
      ],
      scriptSrc: [
        "'self'",
        isProduction ? "'sha256-HASH'" : "'unsafe-inline'", // Producción: solo hashes
        ...(isProduction ? [] : ["'unsafe-eval'"]), // Desarrollo: permitir eval
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        ...(isProduction ? [] : ['http:']), // Producción: solo HTTPS
        'https://res.cloudinary.com', // CDN de imágenes
        'https://storage.googleapis.com', // Google Cloud Storage
      ],
      connectSrc: [
        "'self'",
        'https://api.floresvictoria.cl',
        ...(isProduction ? [] : ['http://localhost:3000', 'http://localhost:5173']),
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null, // Solo en producción
    },
  },

  // HTTP Strict Transport Security - Solo en producción
  hsts: isProduction
    ? {
        maxAge: 63072000, // 2 años (recomendado para preload list)
        includeSubDomains: true,
        preload: true,
      }
    : false,

  // X-Frame-Options
  frameguard: {
    action: 'deny',
  },

  // X-Content-Type-Options
  noSniff: true,

  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // X-DNS-Prefetch-Control
  dnsPrefetchControl: {
    allow: false,
  },

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: isProduction,

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // Origin-Agent-Cluster
  originAgentCluster: true,
});

/**
 * Headers de seguridad adicionales personalizados
 */
const customSecurityHeaders = (req, res, next) => {
  // Ocultar información de servidor
  res.removeHeader('X-Powered-By');

  // Headers personalizados
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Configuración de CORS segura - Adaptativa según entorno
 * @version 3.0 - Más restrictivo en producción
 */
const secureCorsOptions = {
  origin(origin, callback) {
    const productionOrigins = [
      'https://floresvictoria.cl',
      'https://www.floresvictoria.cl',
      'https://admin.floresvictoria.cl',
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
    ].filter(Boolean);

    const developmentOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3010',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];

    const allowedOrigins = isProduction
      ? productionOrigins
      : [...productionOrigins, ...developmentOrigins];

    // En producción: más restrictivo con requests sin origin
    if (!origin) {
      if (isProduction) {
        console.warn('[CORS] Request without origin blocked in production');
        return callback(new Error('Origin header required'));
      }
      // Desarrollo: permitir requests sin origin (Postman, curl, etc)
      return callback(null, true);
    }

    // Validar origin contra lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-API-Key',
    'X-CSRF-Token',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-Response-Time'],
  maxAge: isProduction ? 86400 : 600, // 24h producción, 10min desarrollo
  preflightContinue: false,
};

/**
 * Protección CSRF básica
 */
const csrfProtection = (req, res, next) => {
  // Permitir métodos seguros sin validación CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrfToken;

  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({
      status: 'fail',
      message: 'CSRF token inválido',
    });
  }

  next();
};

module.exports = {
  helmetConfig,
  customSecurityHeaders,
  secureCorsOptions,
  securityHeaders: customSecurityHeaders, // Alias para compatibilidad
  csrfProtection,
};
