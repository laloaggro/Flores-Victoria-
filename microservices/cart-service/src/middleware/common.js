/**
 * Middleware común optimizado para cart-service
 * Centraliza CORS, rate limiting, JSON parsing y security
 */

const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('../../../shared/middleware/health-check');
const { requestId } = require('../../../shared/middleware/request-id');

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
 * Configura health checks mejorados con monitoreo completo
 * @param {Express} app - Aplicación Express
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} redisClient - Cliente de Redis (opcional)
 */
function setupHealthChecks(app, serviceName, redisClient = null) {
  // Función para verificar Redis
  const cacheCheck = redisClient
    ? async () => {
        try {
          return redisClient.status === 'ready';
        } catch (_error) {
          return false;
        }
      }
    : null;

  // Health check completo - incluye Redis, memoria, CPU, uptime
  app.get(
    '/health',
    createHealthCheck({
      serviceName,
      cacheCheck,
    })
  );

  // Readiness check - verifica que puede recibir tráfico
  app.get(
    '/ready',
    createReadinessCheck({
      serviceName,
      cacheCheck,
    })
  );

  // Liveness check - solo verifica que el proceso está vivo
  app.get('/live', createLivenessCheck(serviceName));
}

module.exports = {
  applyCommonMiddleware,
  setupHealthChecks,
};
