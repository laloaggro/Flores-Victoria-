// Configuración del API Gateway
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;

// URLs internas de Railway (comunicación dentro de la red privada)
// Formato: http://<service-name>.railway.internal:<port>
const railwayUrls = {
  authService: 'http://auth-service.railway.internal:3001',
  productService: 'http://product-service.railway.internal:3009',
  userService: 'http://user-service.railway.internal:3003',
  orderService: 'http://order-service.railway.internal:3004',
  cartService: 'http://cart-service.railway.internal:3005',
  wishlistService: 'http://wishlist-service.railway.internal:3006',
  reviewService: 'http://review-service.railway.internal:3007',
  contactService: 'http://contact-service.railway.internal:3008',
};

// URLs por defecto para Docker Compose (desarrollo local)
const dockerUrls = {
  authService: 'http://auth-service:3001',
  productService: 'http://product-service:3009',
  userService: 'http://user-service:3003',
  orderService: 'http://order-service:3004',
  cartService: 'http://cart-service:3005',
  wishlistService: 'http://wishlist-service:3006',
  reviewService: 'http://review-service:3007',
  contactService: 'http://contact-service:3008',
};

const defaultUrls = isRailway ? railwayUrls : dockerUrls;

// Validar JWT_SECRET en producción
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.error('⚠️ CRÍTICO: JWT_SECRET no configurado en producción');
    process.exit(1);
  }
  return secret || 'dev_secret_only_for_local_testing';
};

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: getJwtSecret(),
  services: {
    authService: process.env.AUTH_SERVICE_URL || defaultUrls.authService,
    productService: process.env.PRODUCT_SERVICE_URL || defaultUrls.productService,
    userService: process.env.USER_SERVICE_URL || defaultUrls.userService,
    orderService: process.env.ORDER_SERVICE_URL || defaultUrls.orderService,
    cartService: process.env.CART_SERVICE_URL || defaultUrls.cartService,
    wishlistService: process.env.WISHLIST_SERVICE_URL || defaultUrls.wishlistService,
    reviewService: process.env.REVIEW_SERVICE_URL || defaultUrls.reviewService,
    contactService: process.env.CONTACT_SERVICE_URL || defaultUrls.contactService,
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
