const express = require('express');

const config = require('../config');
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
  // La URL ya viene sin el prefijo /products del router
  // Simplemente pasar la URL tal como viene
  ServiceProxy.routeToService(config.services.productService, req, res);
});

module.exports = router;
