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

  // Service URLs - Todos los microservicios (URLs reales de Railway)
  services: {
    apiGateway: process.env.API_GATEWAY_URL || 'https://api-gateway-production-949b.up.railway.app',
    authService: process.env.AUTH_SERVICE_URL || 'https://auth-service-production-ab8c.up.railway.app',
    userService: process.env.USER_SERVICE_URL || 'https://user-service-production.up.railway.app',
    cartService: process.env.CART_SERVICE_URL || 'https://cart-service-production-73f6.up.railway.app',
    orderService: process.env.ORDER_SERVICE_URL || 'https://order-service-production.up.railway.app',
    wishlistService: process.env.WISHLIST_SERVICE_URL || 'https://wishlist-service-production.up.railway.app',
    reviewService: process.env.REVIEW_SERVICE_URL || 'https://review-service-production.up.railway.app',
    contactService: process.env.CONTACT_SERVICE_URL || 'https://contact-service-production.up.railway.app',
    productService: process.env.PRODUCT_SERVICE_URL || 'https://product-service-production-089c.up.railway.app',
    notificationService: process.env.NOTIFICATION_SERVICE_URL || 'https://notification-service-production.up.railway.app',
    paymentService: process.env.PAYMENT_SERVICE_URL || 'https://payment-service-production.up.railway.app',
    promotionService: process.env.PROMOTION_SERVICE_URL || 'https://promotion-service-production.up.railway.app',
    frontend: process.env.FRONTEND_URL || 'https://frontend-v2-production-7508.up.railway.app',
    adminDashboard: process.env.ADMIN_DASHBOARD_URL || 'https://admin-dashboard-service-production.up.railway.app',
  },

  // Servicios habilitados para monitoreo (TODOS)
  enabledServices: (process.env.ENABLED_SERVICES || 'apiGateway,authService,userService,cartService,orderService,wishlistService,reviewService,contactService,productService,notificationService,paymentService,promotionService,frontend,adminDashboard').split(','),

  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};
