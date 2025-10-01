// Configuración del API Gateway
const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'my_secret_key',
  services: {
    authService: process.env.AUTH_SERVICE_URL || 'http://auth-service:4001',
    productService: process.env.PRODUCT_SERVICE_URL || 'http://product-service:4002',
    userService: process.env.USER_SERVICE_URL || 'http://user-service:4001',
    orderService: process.env.ORDER_SERVICE_URL || 'http://order-service:4003',
    cartService: process.env.CART_SERVICE_URL || 'http://cart-service:4004',
    wishlistService: process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:4005',
    reviewService: process.env.REVIEW_SERVICE_URL || 'http://review-service:4006',
    contactService: process.env.CONTACT_SERVICE_URL || 'http://contact-service:4007'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana
  }
};

module.exports = config;