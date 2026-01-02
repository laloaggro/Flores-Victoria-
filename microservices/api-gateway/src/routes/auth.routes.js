/**
 * Auth Routes Proxy Module
 * Handles authentication-related proxy routes
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const { criticalLimiter } = require('@flores-victoria/shared/middleware/rate-limiter');
const config = require('../config');
const { logger } = require('../middleware/logger');

/**
 * Creates proxy middleware for auth service
 */
const createAuthProxy = () => {
  return createProxyMiddleware({
    target: config.services.authService,
    changeOrigin: true,
    pathRewrite: { '^/auth': '/auth' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      logger.debug({ service: 'api-gateway', target: 'auth-service' }, 'Proxying auth request');
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Auth proxy error');
      if (!res.headersSent) {
        res.status(502).json({
          status: 'error',
          message: 'Auth service unavailable',
          requestId: req.id,
        });
      }
    },
  });
};

/**
 * Register auth routes on Express router
 */
const registerAuthRoutes = (router) => {
  const authProxy = createAuthProxy();

  // Login - critical endpoint with rate limiting
  router.post('/auth/login', criticalLimiter, authProxy);

  // Register - critical endpoint with rate limiting
  router.post('/auth/register', criticalLimiter, authProxy);

  // Refresh token
  router.post('/auth/refresh', authProxy);

  // Logout
  router.post('/auth/logout', authProxy);

  // Password reset
  router.post('/auth/forgot-password', criticalLimiter, authProxy);
  router.post('/auth/reset-password', criticalLimiter, authProxy);

  // Google OAuth
  router.get('/auth/google', authProxy);
  router.get('/auth/google/callback', authProxy);

  // Verify token
  router.get('/auth/verify', authProxy);

  // All other auth routes
  router.use('/auth', authProxy);

  logger.info({ service: 'api-gateway' }, 'Auth routes registered');
};

module.exports = { registerAuthRoutes, createAuthProxy };
