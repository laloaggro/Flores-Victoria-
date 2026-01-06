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

    // Valkey
    valkeyUrl: process.env.VALKEY_URL || 'redis://localhost:6379',
  },

  // Service URLs - Todos los microservicios (URLs reales de Railway con sufijos correctos)
  services: {
    // Core Services - Desplegados en Railway
    apiGateway: process.env.API_GATEWAY_URL || 'https://api-gateway-production-b02f.up.railway.app',
    authService:
      process.env.AUTH_SERVICE_URL || 'https://auth-service-production-ab8c.up.railway.app',
    userService:
      process.env.USER_SERVICE_URL || 'https://user-service-production-9ff7.up.railway.app',
    productService:
      process.env.PRODUCT_SERVICE_URL || 'https://product-service-production-089c.up.railway.app',
    orderService:
      process.env.ORDER_SERVICE_URL || 'https://order-service-production-29eb.up.railway.app',
    cartService:
      process.env.CART_SERVICE_URL || 'https://cart-service-production-73f6.up.railway.app',

    // Business Services - Desplegados
    wishlistService:
      process.env.WISHLIST_SERVICE_URL || 'https://wishlist-service-production-c8c3.up.railway.app',
    reviewService:
      process.env.REVIEW_SERVICE_URL || 'https://review-service-production-4431.up.railway.app',
    contactService:
      process.env.CONTACT_SERVICE_URL || 'https://contact-service-production-7256.up.railway.app',

    // Auxiliary Services - Desplegados
    notificationService:
      process.env.NOTIFICATION_SERVICE_URL ||
      'https://notification-service-production-9520.up.railway.app',
    paymentService:
      process.env.PAYMENT_SERVICE_URL || 'https://payment-service-production-c6e0.up.railway.app',
    promotionService:
      process.env.PROMOTION_SERVICE_URL || 'https://promotion-service-production.up.railway.app',

    // Frontend & Admin
    frontend: process.env.FRONTEND_URL || 'https://frontend-v2-production-7508.up.railway.app',
    adminDashboard:
      process.env.ADMIN_DASHBOARD_URL ||
      'https://admin-dashboard-service-production.up.railway.app',
  },

  // Servicios habilitados para monitoreo (todos los desplegados)
  enabledServices: (
    process.env.ENABLED_SERVICES ||
    'apiGateway,authService,userService,productService,orderService,cartService,wishlistService,reviewService,contactService,notificationService,paymentService,promotionService,frontend,adminDashboard'
  ).split(','),

  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};
