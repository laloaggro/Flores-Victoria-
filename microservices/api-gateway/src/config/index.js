// Configuración del API Gateway
const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'my_secret_key',
  services: {
    authService: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    productService: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3009',
    userService: process.env.USER_SERVICE_URL || 'http://user-service:3003',
    orderService: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
    cartService: process.env.CART_SERVICE_URL || 'http://cart-service:3005',
    wishlistService: process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:3006',
    reviewService: process.env.REVIEW_SERVICE_URL || 'http://review-service:3007',
    contactService: process.env.CONTACT_SERVICE_URL || 'http://contact-service:3008',
    aiRecommendationsService: process.env.AI_RECOMMENDATIONS_URL || 'http://recommendations:3002',
    wasmService: process.env.WASM_PROCESSOR_URL || 'http://wasm-processor:3003',
    paymentService: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3018',
    promotionService: process.env.PROMOTION_SERVICE_URL || 'http://promotion-service:3019',
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos (configurable)
    max: process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? 500 : 2000), // Desarrollo: 2000, Producción: 500
  },
};

module.exports = config;
