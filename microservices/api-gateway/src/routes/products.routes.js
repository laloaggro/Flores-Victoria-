/**
 * Product Routes Proxy Module
 * Handles product catalog proxy routes
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const { searchLimiter } = require('@flores-victoria/shared/middleware/rate-limiter');
const config = require('../config');
const { logger } = require('../middleware/logger');

/**
 * Creates proxy middleware for product service
 */
const createProductProxy = () => {
  return createProxyMiddleware({
    target: config.services.productService,
    changeOrigin: true,
    pathRewrite: { '^/products': '/api/products' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      logger.debug({ service: 'api-gateway', target: 'product-service' }, 'Proxying product request');
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Product proxy error');
      if (!res.headersSent) {
        res.status(502).json({
          status: 'error',
          message: 'Product service unavailable',
          requestId: req.id,
        });
      }
    },
  });
};

/**
 * Register product routes on Express router
 */
const registerProductRoutes = (router) => {
  const productProxy = createProductProxy();

  // Search products with rate limiting
  router.get('/products/search', searchLimiter, productProxy);

  // Categories
  router.get('/products/categories', productProxy);

  // Featured products
  router.get('/products/featured', productProxy);

  // Single product by ID
  router.get('/products/:id', productProxy);

  // All products
  router.get('/products', productProxy);

  // Admin routes (require auth middleware)
  router.post('/products', productProxy);
  router.put('/products/:id', productProxy);
  router.delete('/products/:id', productProxy);

  logger.info({ service: 'api-gateway' }, 'Product routes registered');
};

module.exports = { registerProductRoutes, createProductProxy };
