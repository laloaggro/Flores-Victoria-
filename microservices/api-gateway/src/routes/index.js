const express = require('express');
const ServiceProxy = require('../utils/proxy');
const authMiddleware = require('../middleware/auth');
const loggerMiddleware = require('../middleware/logger');

const router = express.Router();

// Crear una instancia del proxy
const proxyRequest = (req, res, serviceUrl) => {
  ServiceProxy.routeToService(serviceUrl, req, res);
};

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
  proxyRequest(req, res, process.env.AUTH_SERVICE_URL || 'http://auth-service:3001');
});

router.use('/products', loggerMiddleware.logRequest, (req, res) => {
  proxyRequest(req, res, process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002');
});

router.use('/reviews', loggerMiddleware.logRequest, (req, res) => {
  proxyRequest(req, res, process.env.REVIEW_SERVICE_URL || 'http://review-service:3007');
});

router.use('/contact', loggerMiddleware.logRequest, (req, res) => {
  proxyRequest(req, res, process.env.CONTACT_SERVICE_URL || 'http://contact-service:3008');
});

// Rutas protegidas
router.use('/users', loggerMiddleware.logRequest, authMiddleware.authenticateToken, (req, res) => {
  proxyRequest(req, res, process.env.USER_SERVICE_URL || 'http://user-service:3003');
});

router.use('/orders', loggerMiddleware.logRequest, authMiddleware.authenticateToken, (req, res) => {
  proxyRequest(req, res, process.env.ORDER_SERVICE_URL || 'http://order-service:3004');
});

router.use('/cart', loggerMiddleware.logRequest, authMiddleware.authenticateToken, (req, res) => {
  proxyRequest(req, res, process.env.CART_SERVICE_URL || 'http://cart-service:3005');
});

router.use('/wishlist', loggerMiddleware.logRequest, authMiddleware.authenticateToken, (req, res) => {
  proxyRequest(req, res, process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:3006');
});

// Manejo de rutas no encontradas
router.use('*', (req, res) => {
  // Para solicitudes a .well-known, devolver 404 sin JSON
  if (req.path.includes('.well-known')) {
    return res.status(404).end();
  }
  
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada'
  });
});

module.exports = router;