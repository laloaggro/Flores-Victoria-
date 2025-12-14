const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  criticalLimiter,
  searchLimiter,
} = require('@flores-victoria/shared/middleware/rate-limiter');
const config = require('../config');
const logger = require('../middleware/logger');
const loggerMiddleware = require('../middleware/logger');
const aiImagesRouter = require('./aiImages.routes');

const router = express.Router();

// Helper para manejar errores de proxy con respuesta JSON consistente
function handleProxyError(err, req, res, serviceName) {
  logger.error({ service: 'api-gateway', error: err, serviceName }, 'Proxy error');

  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(502).json({
      status: 'error',
      message: `Servicio ${serviceName} no disponible`,
      requestId: req.id,
    });
  }
}

// Ruta raíz - versión actualizada para verificar deploy
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway - Arreglos Victoria',
    version: '2.0.1-debug',
    timestamp: new Date().toISOString(),
    routes: {
      auth: config.services.authService,
      products: config.services.productService,
      users: config.services.userService,
    },
  });
});

// Debug route to verify router is working
router.get('/debug', (req, res) => {
  res.json({
    status: 'debug',
    authServiceUrl: config.services.authService,
    routesLoaded: true,
    timestamp: new Date().toISOString(),
  });
});

// Rutas públicas - Proxy para autenticación (con rate limiting crítico)
router.use(
  '/auth',
  criticalLimiter, // Limitar intentos de autenticación
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.authService,
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '/auth',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'auth'),
  })
);

// Middleware para todas las rutas de productos (búsquedas con límite especial)
router.use(
  '/products',
  searchLimiter, // Limitar búsquedas intensivas
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.productService,
    changeOrigin: true,
    pathRewrite: {
      '^/products': '/api/products',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'products'),
  })
);

// Rutas de usuarios
router.use(
  '/users',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.userService,
    changeOrigin: true,
    pathRewrite: {
      '^/users': '/api/users',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'users'),
  })
);

// Rutas de órdenes
router.use(
  '/orders',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.orderService,
    changeOrigin: true,
    pathRewrite: {
      '^/orders': '/api/orders',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'orders'),
  })
);

// Rutas de carrito
router.use(
  '/cart',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.cartService,
    changeOrigin: true,
    pathRewrite: {
      '^/cart': '/api/cart',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'cart'),
  })
);

// Rutas de wishlist
router.use(
  '/wishlist',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.wishlistService,
    changeOrigin: true,
    pathRewrite: {
      '^/wishlist': '/api/wishlist',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'wishlist'),
  })
);

// Rutas de reseñas
router.use(
  '/reviews',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.reviewService,
    changeOrigin: true,
    pathRewrite: {
      '^/reviews': '/api/reviews',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'reviews'),
  })
);

// Rutas de contacto
router.use(
  '/contact',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.contactService,
    changeOrigin: true,
    pathRewrite: {
      '^/contact': '/api/contacts',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'contact'),
  })
);

// Rutas de AI Horde - Generación de imágenes
router.use('/ai-images', aiImagesRouter);

// Rutas de Recomendaciones de IA
router.use(
  '/ai',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.aiRecommendationsService,
    changeOrigin: true,
    pathRewrite: {
      '^/ai': '',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'ai-recommendations'),
  })
);

// Rutas de WASM Processor
router.use(
  '/wasm',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.wasmService,
    changeOrigin: true,
    pathRewrite: {
      '^/wasm': '',
    },
    onProxyReq: (proxyReq, req, _res) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (err, req, res) => handleProxyError(err, req, res, 'wasm'),
  })
);

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
    onError: (err, req, res) => handleProxyError(err, req, res, 'payments'),
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
    onError: (err, req, res) => handleProxyError(err, req, res, 'promotions'),
    logLevel: 'debug',
  })
);

module.exports = router;
