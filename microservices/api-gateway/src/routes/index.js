const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = require('../config');
const loggerMiddleware = require('../middleware/logger');

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
router.use(
  '/auth',
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
  })
);

// Middleware para todas las rutas de productos
router.use(
  '/products',
  loggerMiddleware.logRequest,
  createProxyMiddleware({
    target: config.services.productService,
    changeOrigin: true,
    pathRewrite: {
      '^/': '/products/',
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
