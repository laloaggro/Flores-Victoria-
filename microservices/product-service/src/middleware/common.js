/**
 * Middleware común optimizado para product-service
 * Centraliza CORS, rate limiting, JSON parsing y security
 */

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

// Ajuste de rutas a la carpeta shared dentro del contenedor (/app/shared)
const {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('../../../shared/middleware/health-check');
const { requestId } = require('../../../shared/middleware/request-id');

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
 * Configura health checks mejorados con monitoreo completo
 * @param {Express} app - Aplicación Express
 * @param {string} serviceName - Nombre del servicio
 * @param {Object} mongoose - Instancia de mongoose (opcional)
 */
function setupHealthChecks(app, serviceName, mongoose = null) {
  // Función para verificar MongoDB
  const dbCheck = mongoose
    ? async () => {
        try {
          return mongoose.connection.readyState === 1; // 1 = connected
        } catch (_error) {
          return false;
        }
      }
    : null;

  // Función para verificar Redis (cache)
  const cacheCheck = async () => {
    try {
      const { cacheService } = require('../services/cacheService');
      return cacheService && cacheService.isConnected;
    } catch (_error) {
      return false;
    }
  };

  // Health check completo - incluye DB, cache, memoria, CPU
  app.get(
    '/health',
    createHealthCheck({
      serviceName,
      dbCheck,
      cacheCheck,
    })
  );

  // Readiness check - verifica que puede recibir tráfico
  app.get(
    '/ready',
    createReadinessCheck({
      serviceName,
      dbCheck,
      cacheCheck,
    })
  );

  // Liveness check - solo verifica que el proceso está vivo (para Kubernetes)
  app.get('/live', createLivenessCheck(serviceName));
}

module.exports = {
  applyCommonMiddleware,
  setupHealthChecks,
};
