/**
 * Cart Routes Proxy Module
 * Handles shopping cart operations
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { logger } = require('../middleware/logger');

/**
 * Creates proxy middleware for cart service
 */
const createCartProxy = () => {
  return createProxyMiddleware({
    target: config.services.cartService,
    changeOrigin: true,
    pathRewrite: { '^/cart': '/api/cart' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Cart proxy error');
      if (!res.headersSent) {
        res.status(502).json({
          status: 'error',
          message: 'Cart service unavailable',
          requestId: req.id,
        });
      }
    },
  });
};

/**
 * Register cart routes on Express router
 */
const registerCartRoutes = (router) => {
  const cartProxy = createCartProxy();

  // Get cart
  router.get('/cart', cartProxy);

  // Add item to cart
  router.post('/cart/items', cartProxy);

  // Update item quantity
  router.put('/cart/items/:productId', cartProxy);

  // Remove item from cart
  router.delete('/cart/items/:productId', cartProxy);

  // Clear cart
  router.delete('/cart', cartProxy);

  // Apply coupon
  router.post('/cart/coupon', cartProxy);

  logger.info({ service: 'api-gateway' }, 'Cart routes registered');
};

module.exports = { registerCartRoutes, createCartProxy };
