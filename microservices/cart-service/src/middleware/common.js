/**
 * Middleware común optimizado para cart-service
 * Centraliza CORS, rate limiting, JSON parsing y security
 */

const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const {
  checkRedis,
  createLivenessResponse,
  createReadinessResponse,
} = require('../../../../shared/health/checks');
const { requestId } = require('../../../../shared/middleware/request-id');

/**
 * Aplica todo el middleware común en una sola función
 * @param {Express} app - Aplicación Express
 * @param {Object} config - Configuración del servicio
 */
function applyCommonMiddleware(app, config) {
  // Correlation ID lo antes posible
  app.use(requestId());

  // Middleware de seguridad
  app.use(helmet());

  // Middleware CORS
  app.use(cors());

  // Middleware para parsear JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      status: 'fail',
      message: 'Demasiadas solicitudes, por favor inténtelo de nuevo más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);
}

/**
 * Configura health checks estándar
 * @param {Express} app - Aplicación Express
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} redisClient - Cliente de Redis (opcional)
 */
function setupHealthChecks(app, serviceName, redisClient = null) {
  // Liveness: ¿está vivo el proceso?
  app.get('/health', (req, res) => {
    const response = createLivenessResponse(serviceName);
    res.status(200).json(response);
  });

  // Readiness: ¿puede recibir tráfico?
  app.get('/ready', async (req, res) => {
    const checks = {};

    // Check Redis si está disponible
    if (redisClient) {
      checks.redis = await checkRedis(redisClient);
    }

    const response = createReadinessResponse(serviceName, checks);
    const statusCode = response.status === 'ready' ? 200 : 503;
    res.status(statusCode).json(response);
  });
}

module.exports = {
  applyCommonMiddleware,
  setupHealthChecks,
};
