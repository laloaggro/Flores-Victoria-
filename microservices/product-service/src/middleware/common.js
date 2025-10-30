/**
 * Middleware común optimizado para product-service
 * Centraliza CORS, rate limiting, JSON parsing y security
 */

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const {
  checkDatabase,
  createLivenessResponse,
  createReadinessResponse,
} = require('../../../../shared/health/checks');
const { requestId } = require('../../../../shared/middleware/request-id');

/**
 * Aplica todo el middleware común en una sola función
 * @param {Express} app - Aplicación Express
 */
function applyCommonMiddleware(app) {
  // Correlation ID (siempre primero)
  app.use(requestId());

  // Middleware de seguridad
  app.use(helmet());

  // Middleware CORS
  app.use(cors());

  // Middleware para parsear JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}

/**
 * Configura health checks estándar
 * @param {Express} app - Aplicación Express
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} mongoose - Instancia de mongoose (opcional)
 */
function setupHealthChecks(app, serviceName, mongoose = null) {
  // Liveness: ¿está vivo el proceso?
  app.get('/health', (req, res) => {
    const response = createLivenessResponse(serviceName);
    res.status(200).json(response);
  });

  // Readiness: ¿puede recibir tráfico?
  app.get('/ready', async (req, res) => {
    const checks = {};

    // Check MongoDB si está disponible
    if (mongoose) {
      checks.database = await checkDatabase(mongoose);
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
