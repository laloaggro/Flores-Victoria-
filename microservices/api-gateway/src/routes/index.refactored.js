/**
 * API Gateway - Routes Index (Modular Version)
 * @version 3.0.0
 *
 * This file serves as the main router that imports and registers
 * all modular route handlers for a cleaner architecture.
 */

const express = require('express');
const { logger } = require('../middleware/logger');
const config = require('../config');

// Import modular route handlers
const { registerAuthRoutes } = require('./auth.routes');
const { registerProductRoutes } = require('./products.routes');
const { registerUserRoutes } = require('./users.routes');
const { registerCartRoutes } = require('./cart.routes');
const { registerOrderRoutes } = require('./orders.routes');
const {
  registerReviewRoutes,
  registerWishlistRoutes,
  registerPaymentRoutes,
  registerNotificationRoutes,
  registerContactRoutes,
  registerPromotionRoutes,
} = require('./services.routes');
const aiImagesRouter = require('./aiImages.routes');

const router = express.Router();

// =============================================================================
// Root & Health Routes
// =============================================================================
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway - Flores Victoria',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    services: {
      auth: config.services.authService,
      products: config.services.productService,
      users: config.services.userService,
      cart: config.services.cartService,
      orders: config.services.orderService,
      reviews: config.services.reviewService,
      wishlist: config.services.wishlistService,
      payments: config.services.paymentService,
      notifications: config.services.notificationService,
      contact: config.services.contactService,
      promotions: config.services.promotionService,
    },
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// =============================================================================
// Register All Service Routes
// =============================================================================
try {
  // Core services
  registerAuthRoutes(router);
  registerProductRoutes(router);
  registerUserRoutes(router);
  registerCartRoutes(router);
  registerOrderRoutes(router);

  // Additional services
  registerReviewRoutes(router);
  registerWishlistRoutes(router);
  registerPaymentRoutes(router);
  registerNotificationRoutes(router);
  registerContactRoutes(router);
  registerPromotionRoutes(router);

  // AI Services
  router.use('/ai-images', aiImagesRouter);

  logger.info({ service: 'api-gateway' }, 'All routes registered successfully');
} catch (error) {
  logger.error({ service: 'api-gateway', error: error.message }, 'Failed to register routes');
}

// =============================================================================
// 404 Handler
// =============================================================================
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

module.exports = router;
