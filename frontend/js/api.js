// API Configuration
// Este archivo contiene la configuración de las URLs de los microservicios

const API_CONFIG = {
  // Servicios backend
  AUTH_SERVICE: 'http://localhost:3001/api/v1',
  USER_SERVICE: 'http://localhost:3002/api/v1',
  PRODUCT_SERVICE: 'http://localhost:3003/api/v1/products',
  CART_SERVICE: 'http://localhost:3004/api/v1',
  ORDER_SERVICE: 'http://localhost:3005/api/v1',
  REVIEW_SERVICE: 'http://localhost:3006/api/v1',
  WISHLIST_SERVICE: 'http://localhost:3007/api/v1',
  CONTACT_SERVICE: 'http://localhost:3008/api/v1',
  
  // Servicios adicionales
  AUDIT_SERVICE: 'http://localhost:3005',
  MESSAGING_SERVICE: 'http://localhost:3009',
  I18N_SERVICE: 'http://localhost:3010',
  ANALYTICS_SERVICE: 'http://localhost:3008'
};

// Hacer la configuración disponible globalmente
window.API_CONFIG = API_CONFIG;

// NOTA: No usamos export porque este archivo se carga directamente en el HTML
// como un script normal, no como un módulo ES6.