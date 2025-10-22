// Configuración del API Gateway
const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'my_secret_key',
  services: {
    authService: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    productService: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3009',
    userService: process.env.USER_SERVICE_URL || 'http://user-service:3003',
    orderService: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
    cartService: process.env.CART_SERVICE_URL || 'http://cart-service:3005',
    wishlistService: process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:3006',
    reviewService: process.env.REVIEW_SERVICE_URL || 'http://review-service:3007',
    contactService: process.env.CONTACT_SERVICE_URL || 'http://contact-service:3008'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500 // límite de 500 solicitudes por ventana (aumentado para dev/testing)
  }
};

module.exports = config;