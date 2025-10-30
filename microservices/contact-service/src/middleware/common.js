const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const { requestId } = require('../../../../shared/middleware/request-id');

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

  console.log('✅ Common middleware applied to contact-service');
}

// Configurar health checks mejorados
function setupHealthChecks(app) {
  app.get('/health', (req, res) => {
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    res.json({
      status: 'OK',
      service: 'contact-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: memUsedMB,
        total: memTotalMB,
      },
    });
  });

  console.log('✅ Enhanced health checks configured for contact-service');
}

module.exports = {
  applyCommonMiddleware,
  setupHealthChecks,
};
