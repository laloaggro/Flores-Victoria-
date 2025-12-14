/**
 * Configuración del servicio admin-dashboard-service
 */
require('dotenv').config();

module.exports = {
  // CRITICAL: PORT debe ser primera prioridad para Railway
  port: process.env.PORT || process.env.ADMIN_DASHBOARD_SERVICE_PORT || 3012,

  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: 'admin-dashboard-service',

  // Database configuration
  database: {
    // PostgreSQL
    postgresUrl: process.env.DATABASE_URL,

    // MongoDB
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_dashboard_service_db',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Service URLs - Todos los microservicios
  services: {
    apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:8080',
    authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    userService: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    cartService: process.env.CART_SERVICE_URL || 'http://localhost:3003',
    orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    wishlistService: process.env.WISHLIST_SERVICE_URL || null, // No desplegado en Railway
    reviewService: process.env.REVIEW_SERVICE_URL || null, // No desplegado en Railway
    contactService: process.env.CONTACT_SERVICE_URL || null, // No desplegado en Railway
    productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3009',
    notificationService: process.env.NOTIFICATION_SERVICE_URL || null, // No desplegado en Railway
    paymentService: process.env.PAYMENT_SERVICE_URL || null, // No desplegado en Railway
    promotionService: process.env.PROMOTION_SERVICE_URL || null, // No desplegado en Railway
  },

  // Servicios habilitados para monitoreo (solo los desplegados)
  enabledServices: (process.env.ENABLED_SERVICES || 'apiGateway,authService,userService,orderService,productService').split(','),

  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};
