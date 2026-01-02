/**
 * Middleware común optimizado para order-service
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
} = require('../shared/middleware/health-check');
const { requestId } = require('../shared/middleware/request-id');

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

  // CORS configurado para permitir admin dashboard y frontends
  const corsOptions = {
    origin: [
      'https://admin-dashboard-service-production.up.railway.app',
      'https://frontend-v2-production-7508.up.railway.app',
      'https://flores-victoria-production.up.railway.app',
      'http://localhost:3000',
      'http://localhost:3004',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
  };
  app.use(cors(corsOptions));

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
 * @param {Object} database - Conexión de base de datos PostgreSQL (opcional)
 */
function setupHealthChecks(app, serviceName, database = null) {
  // Función para verificar PostgreSQL
  const dbCheck =
    database && database.pool
      ? async () => {
          try {
            await database.pool.query('SELECT 1');
            return true;
          } catch (_error) {
            return false;
          }
        }
      : null;

  // Health check completo - incluye DB, memoria, CPU, uptime
  app.get(
    '/health',
    createHealthCheck({
      serviceName,
      dbCheck,
    })
  );

  // Readiness check - verifica que puede recibir tráfico
  app.get(
    '/ready',
    createReadinessCheck({
      serviceName,
      dbCheck,
    })
  );

  // Liveness check - solo verifica que el proceso está vivo
  app.get('/live', createLivenessCheck(serviceName));
}

module.exports = {
  applyCommonMiddleware,
  setupHealthChecks,
};
