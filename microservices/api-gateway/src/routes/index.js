const express = require('express');

const config = require('../config');
const loggerMiddleware = require('../middleware/logger');

const ServiceProxy = require('../utils/proxy');
const aiImagesRouter = require('./aiImages');

const router = express.Router();

// Ruta raíz
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway - Arreglos Victoria',
    version: '1.0.0',
  });
});

// Rutas públicas - Proxy para autenticación
router.use('/auth', loggerMiddleware.logRequest, (req, res) => {
  // La ruta llega como /login, /register, /google, etc.
  // El auth-service espera /api/auth/login, /api/auth/register, /api/auth/google
  // req.url ya contiene /login, /register, etc. (sin /auth)
  req.url = `/api/auth${req.url}`;
  ServiceProxy.routeToService(config.services.authService, req, res);
});

// Ruta de compatibilidad: /api/users/profile -> auth-service /api/auth/profile
router.get('/users/profile', loggerMiddleware.logRequest, (req, res) => {
  req.url = '/api/auth/profile';
  ServiceProxy.routeToService(config.services.authService, req, res);
});

// Middleware para todas las rutas de productos
router.use('/products', loggerMiddleware.logRequest, (req, res) => {
  // Express router elimina /products de req.url, pero el product-service lo necesita
  // Recomponer la URL completa para el product-service
  req.url = `/products${req.url}`;
  console.log('🔍 API Gateway - Query params:', req.query);
  console.log('🔍 API Gateway - Full URL:', req.url);
  ServiceProxy.routeToService(config.services.productService, req, res);
});

// Rutas de AI Horde - Generación de imágenes
router.use('/ai-images', aiImagesRouter);

// Rutas de Recomendaciones de IA (proxy a recommendations service)
// El servicio de recomendaciones expone rutas como /health, /recommendations/:userId, /trending, etc.
// Gateway: /api/ai/health -> Recommendations: /health
// Gateway: /api/ai/recommendations -> Recommendations: /recommendations
router.use('/ai', loggerMiddleware.logRequest, (req, res) => {
  // Express ya eliminó el prefijo /ai de req.url, dejando solo /health, /recommendations, etc.
  // No necesitamos modificar req.url - pasarlo tal cual
  ServiceProxy.routeToService(config.services.aiRecommendationsService, req, res);
});

// Rutas de WASM Processor (proxy)
router.use('/wasm', loggerMiddleware.logRequest, (req, res) => {
  ServiceProxy.routeToService(config.services.wasmService, req, res);
});

// Rutas de Pagos (proxy)
router.use('/payments', loggerMiddleware.logRequest, (req, res) => {
  // Alinear con las rutas internas del servicio de pagos (/payments, /refunds, /stats, /metrics, /health)
  // Para /payments/* debemos recomponer el prefijo eliminado por el router
  // Para endpoints como /health o /metrics no se requiere prefijo adicional
  const passthroughPaths = ['/health', '/metrics', '/stats'];
  if (!passthroughPaths.includes(req.url.split('?')[0])) {
    req.url = `/payments${req.url}`;
  }
  ServiceProxy.routeToService(config.services.paymentService, req, res);
});

// Rutas de Promociones (proxy)
router.use('/promotions', loggerMiddleware.logRequest, (req, res) => {
  // El promotion-service expone rutas bajo /api/promotions
  // Gateway: /api/promotions/* -> Promotion: /api/promotions/*
  req.url = `/api/promotions${req.url}`;
  ServiceProxy.routeToService(config.services.promotionService, req, res);
});

module.exports = router;
