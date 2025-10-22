/**
 * Middleware común optimizado para order-service
 * Centraliza CORS, rate limiting, JSON parsing y security
 */

const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * Aplica todo el middleware común en una sola función
 * @param {Express} app - Aplicación Express
 * @param {Object} config - Configuración del servicio
 */
function applyCommonMiddleware(app, config) {
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
 */
function setupHealthChecks(app, serviceName) {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    });
  });
}

module.exports = {
  applyCommonMiddleware,
  setupHealthChecks,
};
