// Configuración de las URLs de la API
const API_CONFIG = {
  // Gateway de la API (puerto 3000)
  BASE_URL: 'http://localhost:3000/api',
  
  // URLs de los microservicios a través del gateway
  AUTH_SERVICE: 'http://localhost:3000/api/auth',
  PRODUCT_SERVICE: 'http://localhost:3000/api/products',
  USER_SERVICE: 'http://localhost:3000/api/users',
  ORDER_SERVICE: 'http://localhost:3000/api/orders',
  CART_SERVICE: 'http://localhost:3000/api/cart',
  WISHLIST_SERVICE: 'http://localhost:3000/api/wishlist',
  REVIEW_SERVICE: 'http://localhost:3000/api/reviews',
  CONTACT_SERVICE: 'http://localhost:3000/api/contact'
};

// Función para construir URLs completas
const buildUrl = (endpoint) => {
  // Si el endpoint ya es una URL completa, devolverla tal cual
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // De lo contrario, concatenar con la URL base
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Hacer que API_CONFIG sea global
window.API_CONFIG = API_CONFIG;
window.buildUrl = buildUrl;