/**
 * @fileoverview CSRF Protection Middleware for Flores Victoria
 * @description Protección contra ataques Cross-Site Request Forgery
 * 
 * @features
 * - Generación de tokens CSRF seguros
 * - Validación en métodos no seguros (POST, PUT, DELETE, PATCH)
 * - Soporte para SPA (Single Page Applications)
 * - Double Submit Cookie pattern
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const crypto = require('crypto');

// Configuración
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_COOKIE_OPTIONS = {
  httpOnly: false, // El frontend necesita leerlo
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
};

/**
 * Genera un token CSRF seguro
 * @returns {string} Token de 64 caracteres hex
 */
function generateCsrfToken() {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Middleware para establecer el token CSRF en la cookie
 * @param {Object} options - Opciones de configuración
 * @param {Array<string>} options.ignorePaths - Rutas a ignorar
 * @returns {Function} Middleware de Express
 */
function csrfTokenSetter(options = {}) {
  const ignorePaths = options.ignorePaths || ['/health', '/metrics', '/ready', '/live'];

  return (req, res, next) => {
    // Ignorar rutas especificadas
    if (ignorePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Solo establecer en peticiones GET (navegación)
    if (req.method === 'GET') {
      // Verificar si ya existe un token válido
      const existingToken = req.cookies?.[CSRF_COOKIE_NAME];
      
      if (!existingToken) {
        const token = generateCsrfToken();
        res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
        req.csrfToken = token;
      } else {
        req.csrfToken = existingToken;
      }
    }

    // Agregar función helper para obtener el token
    res.locals.csrfToken = () => req.csrfToken || req.cookies?.[CSRF_COOKIE_NAME];

    next();
  };
}

/**
 * Middleware para validar el token CSRF en métodos no seguros
 * @param {Object} options - Opciones de configuración
 * @param {Array<string>} options.ignorePaths - Rutas a ignorar
 * @param {Array<string>} options.ignoreMethods - Métodos a ignorar
 * @returns {Function} Middleware de Express
 */
function csrfProtection(options = {}) {
  const ignorePaths = options.ignorePaths || [
    '/health',
    '/metrics',
    '/ready',
    '/live',
    '/api/webhooks', // Webhooks externos
    '/internal/',    // Comunicación inter-servicio
  ];
  
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const ignoreMethods = options.ignoreMethods || [];

  return (req, res, next) => {
    // Ignorar métodos seguros
    if (safeMethods.includes(req.method) || ignoreMethods.includes(req.method)) {
      return next();
    }

    // Ignorar rutas especificadas
    if (ignorePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Ignorar solicitudes internas de servicios
    if (req.headers['x-internal-request'] === 'true') {
      return next();
    }

    // Obtener token de la cookie
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    
    // Obtener token del header o body
    const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] || 
                       req.headers['x-xsrf-token'] ||
                       req.body?._csrf;

    // Validar que ambos tokens existan y coincidan
    if (!cookieToken || !headerToken) {
      return res.status(403).json({
        status: 'fail',
        message: 'Token CSRF faltante',
        code: 'CSRF_TOKEN_MISSING',
      });
    }

    // Comparación segura contra timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
      return res.status(403).json({
        status: 'fail',
        message: 'Token CSRF inválido',
        code: 'CSRF_TOKEN_INVALID',
      });
    }

    // Token válido, regenerar para la siguiente petición (rotación)
    const newToken = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, newToken, CSRF_COOKIE_OPTIONS);

    next();
  };
}

/**
 * Middleware combinado para CSRF (setter + protección)
 * @param {Object} options - Opciones de configuración
 * @returns {Array<Function>} Array de middlewares
 */
function csrf(options = {}) {
  return [
    csrfTokenSetter(options),
    csrfProtection(options),
  ];
}

/**
 * Endpoint para obtener un token CSRF (útil para SPAs)
 * @returns {Function} Handler de Express
 */
function csrfTokenEndpoint() {
  return (req, res) => {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
    
    res.json({
      status: 'success',
      csrfToken: token,
    });
  };
}

module.exports = {
  generateCsrfToken,
  csrfTokenSetter,
  csrfProtection,
  csrf,
  csrfTokenEndpoint,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
};
