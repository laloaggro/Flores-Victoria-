const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

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
  // auth-service expone rutas como /health, /api/auth/login, /api/auth/register
  // Gateway: /api/auth/health -> auth-service: /health
  // Gateway: /api/auth/login -> auth-service: /api/auth/login
  if (req.url === '/health' || req.url.startsWith('/health')) {
    // Pasar health directamente
    ServiceProxy.routeToService(config.services.authService, req, res);
  } else {
    // Para otras rutas, agregar /api/auth
    req.url = `/api/auth${req.url}`;
    ServiceProxy.routeToService(config.services.authService, req, res);
  }
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
  ServiceProxy.routeToService(config.services.productService, req, res);
});

// Rutas de usuarios
router.use('/users', loggerMiddleware.logRequest, (req, res) => {
  ServiceProxy.routeToService(config.services.userService, req, res);
});

// Rutas de órdenes
router.use('/orders', loggerMiddleware.logRequest, (req, res) => {
  ServiceProxy.routeToService(config.services.orderService, req, res);
});

// Rutas de carrito
router.use('/cart', loggerMiddleware.logRequest, (req, res) => {
  ServiceProxy.routeToService(config.services.cartService, req, res);
});

// Rutas de wishlist
router.use('/wishlist', loggerMiddleware.logRequest, (req, res) => {
  ServiceProxy.routeToService(config.services.wishlistService, req, res);
});

// Rutas de reseñas
router.use('/reviews', loggerMiddleware.logRequest, (req, res) => {
  ServiceProxy.routeToService(config.services.reviewService, req, res);
});

// Rutas de contacto
router.use('/contact', loggerMiddleware.logRequest, (req, res) => {
  ServiceProxy.routeToService(config.services.contactService, req, res);
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

// Rutas de Pagos (http-proxy-middleware)
router.use(
  '/payments',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.paymentService,
    changeOrigin: true,
    pathRewrite: {
      '^/payments': '/payments',
    },
    onProxyReq: (proxyReq, req, _res) => {
      // Propagar Request ID
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      // Preservar el Content-Type original
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

// Rutas de Promociones (http-proxy-middleware)
router.use(
  '/promotions',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.promotionService,
    changeOrigin: true,
    pathRewrite: {
      '^/promotions': '/api/promotions',
    },
    onProxyReq: (proxyReq, req, _res) => {
      // Propagar Request ID
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      // Preservar el body para POST/PUT/PATCH
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    logLevel: 'debug',
  })
);

module.exports = router;
