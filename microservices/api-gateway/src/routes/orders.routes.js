/**
 * Order Routes Proxy Module
 * Handles order management and checkout
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { logger } = require('../middleware/logger');

/**
 * Creates proxy middleware for order service
 */
const createOrderProxy = () => {
  return createProxyMiddleware({
    target: config.services.orderService,
    changeOrigin: true,
    pathRewrite: { '^/orders': '/api/orders' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Order proxy error');
      if (!res.headersSent) {
        res.status(502).json({
          status: 'error',
          message: 'Order service unavailable',
          requestId: req.id,
        });
      }
    },
  });
};

/**
 * Register order routes on Express router
 */
const registerOrderRoutes = (router) => {
  const orderProxy = createOrderProxy();

  // Create order (checkout)
  router.post('/orders', orderProxy);

  // Get user orders
  router.get('/orders', orderProxy);

  // Get order by ID
  router.get('/orders/:id', orderProxy);

  // Cancel order
  router.post('/orders/:id/cancel', orderProxy);

  // Update order status (admin)
  router.put('/orders/:id/status', orderProxy);

  logger.info({ service: 'api-gateway' }, 'Order routes registered');
};

module.exports = { registerOrderRoutes, createOrderProxy };
