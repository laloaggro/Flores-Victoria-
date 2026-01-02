/**
 * Additional Service Routes Proxy Module
 * Handles reviews, wishlist, payments, notifications, and contacts
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const { logger } = require('../middleware/logger');

// =============================================================================
// Review Service
// =============================================================================
const createReviewProxy = () => {
  return createProxyMiddleware({
    target: config.services.reviewService || 'http://review-service:8080',
    changeOrigin: true,
    pathRewrite: { '^/reviews': '/api/reviews' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Review proxy error');
      if (!res.headersSent) {
        res.status(502).json({ status: 'error', message: 'Review service unavailable' });
      }
    },
  });
};

const registerReviewRoutes = (router) => {
  const reviewProxy = createReviewProxy();
  router.get('/reviews/product/:productId', reviewProxy);
  router.post('/reviews', reviewProxy);
  router.put('/reviews/:id', reviewProxy);
  router.delete('/reviews/:id', reviewProxy);
  router.use('/reviews', reviewProxy);
  logger.info({ service: 'api-gateway' }, 'Review routes registered');
};

// =============================================================================
// Wishlist Service
// =============================================================================
const createWishlistProxy = () => {
  return createProxyMiddleware({
    target: config.services.wishlistService || 'http://wishlist-service:8080',
    changeOrigin: true,
    pathRewrite: { '^/wishlist': '/api/wishlist' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Wishlist proxy error');
      if (!res.headersSent) {
        res.status(502).json({ status: 'error', message: 'Wishlist service unavailable' });
      }
    },
  });
};

const registerWishlistRoutes = (router) => {
  const wishlistProxy = createWishlistProxy();
  router.get('/wishlist', wishlistProxy);
  router.post('/wishlist', wishlistProxy);
  router.delete('/wishlist/:productId', wishlistProxy);
  router.use('/wishlist', wishlistProxy);
  logger.info({ service: 'api-gateway' }, 'Wishlist routes registered');
};

// =============================================================================
// Payment Service
// =============================================================================
const createPaymentProxy = () => {
  return createProxyMiddleware({
    target: config.services.paymentService || 'http://payment-service:8080',
    changeOrigin: true,
    pathRewrite: { '^/payments': '/api/payments' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Payment proxy error');
      if (!res.headersSent) {
        res.status(502).json({ status: 'error', message: 'Payment service unavailable' });
      }
    },
  });
};

const registerPaymentRoutes = (router) => {
  const paymentProxy = createPaymentProxy();
  router.post('/payments/stripe', paymentProxy);
  router.post('/payments/paypal', paymentProxy);
  router.post('/payments/transbank', paymentProxy);
  router.post('/payments/webhook', paymentProxy);
  router.use('/payments', paymentProxy);
  logger.info({ service: 'api-gateway' }, 'Payment routes registered');
};

// =============================================================================
// Notification Service
// =============================================================================
const createNotificationProxy = () => {
  return createProxyMiddleware({
    target: config.services.notificationService || 'http://notification-service:8080',
    changeOrigin: true,
    pathRewrite: { '^/notifications': '/api/notifications' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Notification proxy error');
      if (!res.headersSent) {
        res.status(502).json({ status: 'error', message: 'Notification service unavailable' });
      }
    },
  });
};

const registerNotificationRoutes = (router) => {
  const notificationProxy = createNotificationProxy();
  router.get('/notifications', notificationProxy);
  router.put('/notifications/:id/read', notificationProxy);
  router.use('/notifications', notificationProxy);
  logger.info({ service: 'api-gateway' }, 'Notification routes registered');
};

// =============================================================================
// Contact Service
// =============================================================================
const createContactProxy = () => {
  return createProxyMiddleware({
    target: config.services.contactService || 'http://contact-service:8080',
    changeOrigin: true,
    pathRewrite: { '^/contact': '/api/contact' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Contact proxy error');
      if (!res.headersSent) {
        res.status(502).json({ status: 'error', message: 'Contact service unavailable' });
      }
    },
  });
};

const registerContactRoutes = (router) => {
  const contactProxy = createContactProxy();
  router.post('/contact', contactProxy);
  router.use('/contact', contactProxy);
  logger.info({ service: 'api-gateway' }, 'Contact routes registered');
};

// =============================================================================
// Promotion Service
// =============================================================================
const createPromotionProxy = () => {
  return createProxyMiddleware({
    target: config.services.promotionService || 'http://promotion-service:8080',
    changeOrigin: true,
    pathRewrite: { '^/promotions': '/api/promotions' },
    onProxyReq: (proxyReq, req) => {
      if (req.id) proxyReq.setHeader('X-Request-ID', req.id);
    },
    onError: (err, req, res) => {
      logger.error({ service: 'api-gateway', error: err }, 'Promotion proxy error');
      if (!res.headersSent) {
        res.status(502).json({ status: 'error', message: 'Promotion service unavailable' });
      }
    },
  });
};

const registerPromotionRoutes = (router) => {
  const promotionProxy = createPromotionProxy();
  router.get('/promotions/active', promotionProxy);
  router.get('/promotions/:code', promotionProxy);
  router.post('/promotions/validate', promotionProxy);
  router.use('/promotions', promotionProxy);
  logger.info({ service: 'api-gateway' }, 'Promotion routes registered');
};

module.exports = {
  registerReviewRoutes,
  registerWishlistRoutes,
  registerPaymentRoutes,
  registerNotificationRoutes,
  registerContactRoutes,
  registerPromotionRoutes,
};
