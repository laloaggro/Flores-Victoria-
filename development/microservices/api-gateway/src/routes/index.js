const ServiceProxy = require('../utils/proxy');
const authMiddleware = require('../middleware/auth');
const loggerMiddleware = require('../middleware/logger');
const config = require('../config');
const express = require('express');

const router = express.Router();

// Ruta raíz
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway - Arreglos Victoria',
    version: '1.0.0'
  });
});

// Rutas públicas
router.use('/auth', loggerMiddleware.logRequest, (req, res) => {
  ServiceProxy.routeToService(config.services.authService, req, res);
});

// Rutas para el servicio de productos
router.get('/products/all', loggerMiddleware.logRequest, (req, res) => {
  req.url = '/api/products/all';
  ServiceProxy.routeToService(config.services.productService, req, res);
});

// Ruta para /products (lista de productos)
router.get('/products', loggerMiddleware.logRequest, (req, res) => {
  req.url = '/api/products';
  ServiceProxy.routeToService(config.services.productService, req, res);
});

// Middleware catch-all para otras rutas de productos
router.use('/products', loggerMiddleware.logRequest, (req, res) => {
  // Asegurarse de que la URL comienza con /api/products
  if (!req.url.startsWith('/api/products')) {
    // Si la URL no comienza con /api/products, construirla correctamente
    if (req.url.startsWith('/')) {
      req.url = '/api/products' + req.url;
    } else {
      req.url = '/api/products/' + req.url;
    }
  }
  ServiceProxy.routeToService(config.services.productService, req, res);
});

module.exports = router;