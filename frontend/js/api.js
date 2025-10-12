// API Configuration
// Este archivo contiene la configuración de las URLs de los microservicios

const API_CONFIG = {
  // API Gateway (punto de entrada único para todos los microservicios)
  API_GATEWAY: 'http://localhost:8000/api',
  
  // Servicios backend (ahora se acceden a través del API Gateway)
  AUTH_SERVICE: 'http://localhost:8000/api/auth',
  USER_SERVICE: 'http://localhost:8000/api/users',
  PRODUCT_SERVICE: 'http://localhost:8000/api/products',
  CART_SERVICE: 'http://localhost:8000/api/cart',
  ORDER_SERVICE: 'http://localhost:8000/api/orders',
  REVIEW_SERVICE: 'http://localhost:8000/api/reviews',
  WISHLIST_SERVICE: 'http://localhost:8000/api/wishlist',
  CONTACT_SERVICE: 'http://localhost:8000/api/contacts',
  
  // Servicios adicionales
  AUDIT_SERVICE: 'http://localhost:8000/api/audit',
  MESSAGING_SERVICE: 'http://localhost:8000/api/messaging',
  I18N_SERVICE: 'http://localhost:8000/api/i18n',
  ANALYTICS_SERVICE: 'http://localhost:8000/api/analytics'
};

// Hacer la configuración disponible globalmente
window.API_CONFIG = API_CONFIG;

// NOTA: No usamos export porque este archivo se carga directamente en el HTML
// como un script normal, no como un módulo ES6.