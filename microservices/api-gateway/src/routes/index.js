const express = require('express');

const config = require('../config');
const authMiddleware = require('../middleware/auth');
const loggerMiddleware = require('../middleware/logger');
const ServiceProxy = require('../utils/proxy');

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
  // La ruta llega como /login, /register, etc.
  // Necesitamos reescribirla a /api/auth/login, /api/auth/register
  req.url = `/api/auth${req.url}`;
  ServiceProxy.routeToService(config.services.authService, req, res);
});

// Ruta de compatibilidad: /api/users/profile -> auth-service /api/auth/profile
router.get('/users/profile', loggerMiddleware.logRequest, (req, res) => {
  req.url = '/api/auth/profile';
  ServiceProxy.routeToService(config.services.authService, req, res);
});

// Rutas para el servicio de productos
router.get('/products/all', loggerMiddleware.logRequest, (req, res) => {
  req.url = '/products/all';
  ServiceProxy.routeToService(config.services.productService, req, res);
});

// Ruta para /products (lista de productos)
router.get('/products', loggerMiddleware.logRequest, (req, res) => {
  req.url = '/products';
  ServiceProxy.routeToService(config.services.productService, req, res);
});

// Middleware catch-all para otras rutas de productos
router.use('/products', loggerMiddleware.logRequest, (req, res) => {
  // Asegurarse de que la URL no tenga el prefijo /api/products
  if (req.url.startsWith('/api/products')) {
    // Quitar el prefijo /api/products
    req.url = req.url.substring('/api/products'.length);
    // Asegurarse de que comienza con /
    if (!req.url.startsWith('/')) {
      req.url = `/${req.url}`;
    }
  }
  ServiceProxy.routeToService(config.services.productService, req, res);
});

module.exports = router;
