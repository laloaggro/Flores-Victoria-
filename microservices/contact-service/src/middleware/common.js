const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('../../../../shared/middleware/health-check');
const { requestId } = require('../../../../shared/middleware/request-id');

const logger = { info: () => {} }; // Placeholder logger

// Configuración de CORS unificada
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Configuración de Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware común para aplicar a todos los servicios
function applyCommonMiddleware(app) {
  app.use(requestId());
  app.use(cors(corsOptions));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(limiter);

  logger.info('✅ Common middleware applied to contact-service');
}

function setupHealthChecks(app) {
  const serviceName = 'contact-service';

  // Health check completo - incluye memoria, CPU, uptime
  app.get('/health', createHealthCheck({ serviceName }));

  // Readiness check - verifica que puede recibir tráfico
  app.get('/ready', createReadinessCheck({ serviceName }));

  // Liveness check - solo verifica que el proceso está vivo
  app.get('/live', createLivenessCheck(serviceName));

  logger.info('✅ Enhanced health checks configured for contact-service');
}

module.exports = {
  applyCommonMiddleware,
  setupHealthChecks,
};
