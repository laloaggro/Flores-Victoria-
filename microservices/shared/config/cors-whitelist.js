/**
 * @fileoverview Configuración dinámica de CORS whitelist
 * @description Carga la whitelist de orígenes permitidos desde variables de entorno
 *              con soporte para desarrollo, staging y producción
 * 
 * @example
 * // En .env
 * CORS_WHITELIST=http://localhost:5173,http://localhost:3010,https://app.railway.app
 * 
 * // En app.js
 * const corsWhitelist = require('@flores-victoria/shared/config/cors-whitelist');
 * const corsOptions = corsWhitelist.getCorsOptions();
 * app.use(cors(corsOptions));
 */

const logger = require('../logging/logger').createLogger('cors-whitelist');

/**
 * Orígenes por defecto para desarrollo local
 */
const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',  // Frontend dev
  'http://localhost:3010',  // Admin panel dev
  'http://localhost:3000',  // API Gateway dev
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3010',
  'http://127.0.0.1:3000',
];

/**
 * Patrones de dominios permitidos en producción
 */
const PRODUCTION_DOMAIN_PATTERNS = [
  /\.railway\.app$/,        // Cualquier subdominio de railway.app
  /\.up\.railway\.app$/,    // Específicamente servicios de Railway
];

/**
 * Parsea la whitelist de orígenes desde variables de entorno
 * @returns {string[]} Array de orígenes permitidos
 */
function parseWhitelist() {
  const env = process.env.NODE_ENV || 'development';
  
  // En desarrollo, usar orígenes por defecto si no hay configuración
  if (env === 'development') {
    const customWhitelist = process.env.CORS_WHITELIST;
    if (customWhitelist) {
      const origins = customWhitelist.split(',').map(origin => origin.trim());
      logger.info(`[CORS] Whitelist de desarrollo (custom): ${origins.join(', ')}`);
      return origins;
    }
    logger.info(`[CORS] Usando orígenes por defecto de desarrollo`);
    return DEFAULT_DEV_ORIGINS;
  }

  // En producción y staging, CORS_WHITELIST es obligatorio
  const whitelist = process.env.CORS_WHITELIST;
  if (!whitelist) {
    logger.error('[CORS] CRITICAL: CORS_WHITELIST no está configurado en producción');
    logger.error('[CORS] Por favor establece CORS_WHITELIST con orígenes permitidos');
    logger.error('[CORS] Ejemplo: CORS_WHITELIST=https://app.railway.app,https://admin.railway.app');
    if (env === 'production') {
      process.exit(1);
    }
  }

  const origins = whitelist
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

  if (origins.length === 0) {
    logger.warn('[CORS] Whitelist vacío, usando solo development origins');
    return DEFAULT_DEV_ORIGINS;
  }

  logger.info(`[CORS] Whitelist configurado con ${origins.length} orígenes`);
  return origins;
}

/**
 * Verifica si un origen está en la whitelist
 * @param {string} origin - Origin a verificar
 * @param {string[]} whitelist - Array de orígenes permitidos
 * @returns {boolean}
 */
function isOriginAllowed(origin, whitelist) {
  if (!origin) {
    return true; // Permitir requests sin origin (mobile apps, curl, etc)
  }

  // Verificación exacta
  if (whitelist.includes(origin)) {
    return true;
  }

  // En producción, verificar patrones (*.railway.app)
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_DOMAIN_PATTERNS.some(pattern => pattern.test(origin));
  }

  return false;
}

/**
 * Genera opciones CORS válidas
 * @returns {Object} Opciones para middleware de cors
 */
function getCorsOptions() {
  const whitelist = parseWhitelist();

  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin, whitelist)) {
        logger.debug(`[CORS] ✅ Origin permitido: ${origin || '(sin origin)'}`);
        callback(null, true);
      } else {
        const error = new Error(`[CORS] Origin no permitido: ${origin}`);
        logger.warn(`[CORS] ⛔ ${error.message}`);
        callback(error);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-CSRF-Token',
      'X-API-Key',
      'Accept',
      'Accept-Language',
      'Content-Language',
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Content-Length',
      'ETag',
    ],
    maxAge: 86400, // 24 horas en segundos
    preflightContinue: false,
  };
}

/**
 * Valida la configuración de CORS en startup
 * @returns {void}
 * @throws {Error} si la configuración es inválida
 */
function validateCorsConfiguration() {
  const env = process.env.NODE_ENV || 'development';
  
  if (env !== 'production') {
    return; // No validar en desarrollo
  }

  const whitelist = process.env.CORS_WHITELIST;
  if (!whitelist) {
    throw new Error(
      'CRITICAL: CORS_WHITELIST must be set in production. ' +
      'Example: CORS_WHITELIST=https://app.railway.app,https://admin.railway.app'
    );
  }

  const origins = whitelist.split(',').map(o => o.trim()).filter(o => o.length > 0);
  if (origins.length === 0) {
    throw new Error('CRITICAL: CORS_WHITELIST is empty. Must include at least one valid origin.');
  }

  if (origins.some(origin => origin.includes('localhost'))) {
    logger.warn('[CORS] ⚠️ Advertencia: localhost en CORS_WHITELIST en producción');
  }

  logger.info(`[CORS] ✅ Configuración validada: ${origins.length} orígenes permitidos`);
}

module.exports = {
  getCorsOptions,
  parseWhitelist,
  isOriginAllowed,
  validateCorsConfiguration,
  DEFAULT_DEV_ORIGINS,
};
