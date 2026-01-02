/**
 * User Routes Proxy Module
 * Handles user profile and management routes
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { logger } = require('../middleware/logger');

/**
 * Creates proxy middleware for user service
 */
const createUserProxy = () => {
  return createProxyMiddleware({
    target: config.services.userService,
    changeOrigin: true,
    pathRewrite: { '^/users': '/api/users' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'User proxy error');
      if (!res.headersSent) {
        res.status(502).json({
          status: 'error',
          message: 'User service unavailable',
          requestId: req.id,
        });
      }
    },
  });
};

/**
 * Register user routes on Express router
 */
const registerUserRoutes = (router) => {
  const userProxy = createUserProxy();

  // Profile routes
  router.get('/users/profile', userProxy);
  router.put('/users/profile', userProxy);

  // Change password
  router.post('/users/change-password', userProxy);

  // User addresses
  router.get('/users/addresses', userProxy);
  router.post('/users/addresses', userProxy);
  router.put('/users/addresses/:id', userProxy);
  router.delete('/users/addresses/:id', userProxy);

  // All other user routes
  router.use('/users', userProxy);

  logger.info({ service: 'api-gateway' }, 'User routes registered');
};

module.exports = { registerUserRoutes, createUserProxy };
