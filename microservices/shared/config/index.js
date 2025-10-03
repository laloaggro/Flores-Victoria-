// Configuración centralizada para microservicios
const config = {
  // Configuración de bases de datos
  databases: {
    postgres: {
      host: process.env.POSTGRES_HOST || 'postgres',
      port: process.env.POSTGRES_PORT || 5432,
      user: process.env.POSTGRES_USER || 'flores_user',
      password: process.env.POSTGRES_PASSWORD || 'flores_password',
      database: process.env.POSTGRES_DB || 'flores_db'
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/floresvictoria?authSource=admin'
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://redis:6379'
    }
  },
  
  // Configuración de RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:adminpassword@rabbitmq:5672'
  },
  
  // Configuración de seguridad
  security: {
    jwtSecret: process.env.JWT_SECRET || 'secreto_super_seguro_para_flores_victoria',
    saltRounds: parseInt(process.env.SALT_ROUNDS) || 10
  },
  
  // Configuración de rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos por defecto
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // 100 solicitudes por ventana por defecto
  },
  
  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  },
  
  // Configuración de servicios
  services: {
    apiGateway: process.env.API_GATEWAY_URL || 'http://api-gateway:8000',
    authService: process.env.AUTH_SERVICE_URL || 'http://auth-service:4001',
    productService: process.env.PRODUCT_SERVICE_URL || 'http://product-service:4002',
    userService: process.env.USER_SERVICE_URL || 'http://user-service:4003',
    orderService: process.env.ORDER_SERVICE_URL || 'http://order-service:4004',
    cartService: process.env.CART_SERVICE_URL || 'http://cart-service:4005',
    wishlistService: process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:4006',
    reviewService: process.env.REVIEW_SERVICE_URL || 'http://review-service:4007',
    contactService: process.env.CONTACT_SERVICE_URL || 'http://contact-service:4008'
  }
};

module.exports = config;