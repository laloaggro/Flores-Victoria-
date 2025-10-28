/**
 * Configuración de tests para microservicios
 * Este archivo configurará las URLs de los servicios para entorno de testing
 */

const TEST_CONFIG = {
  // URLs de servicios para testing (usando localhost en lugar de nombres Docker)
  services: {
    apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
    authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    userService: process.env.USER_SERVICE_URL || 'http://localhost:3003',
    orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    cartService: process.env.CART_SERVICE_URL || 'http://localhost:3005',
    wishlistService: process.env.WISHLIST_SERVICE_URL || 'http://localhost:3006',
    reviewService: process.env.REVIEW_SERVICE_URL || 'http://localhost:3007',
    contactService: process.env.CONTACT_SERVICE_URL || 'http://localhost:3008',
    productService: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3009',
    adminPanel: process.env.ADMIN_PANEL_URL || 'http://localhost:3010',
  },

  // Configuración de timeouts
  timeouts: {
    request: 5000,
    response: 10000,
  },

  // Configuración de reintentos
  retries: {
    maxRetries: 3,
    retryDelay: 1000,
  },

  // Configuración de tests
  test: {
    skipIntegrationTests: process.env.SKIP_INTEGRATION_TESTS === 'true',
    skipPerformanceTests: process.env.SKIP_PERFORMANCE_TESTS === 'true',
    testUser: {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    },
    testProduct: {
      id: 'test-product-id',
      name: 'Test Product',
      price: 25.99,
      category: 'Ramos',
    },
  },
};

module.exports = TEST_CONFIG;
