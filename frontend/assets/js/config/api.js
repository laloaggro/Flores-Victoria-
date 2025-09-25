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
export const buildUrl = (endpoint) => {
  // Si el endpoint ya es una URL completa, devolverla tal cual
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // De lo contrario, concatenar con la URL base
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Endpoints específicos
const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_CONFIG.AUTH_SERVICE}/register`,
    LOGIN: `${API_CONFIG.AUTH_SERVICE}/login`,
    GOOGLE_AUTH: `${API_CONFIG.AUTH_SERVICE}/google`,
    PROFILE: `${API_CONFIG.AUTH_SERVICE}/profile`,
    LOGOUT: `${API_CONFIG.AUTH_SERVICE}/logout`
  },
  
  // Product endpoints
  PRODUCTS: {
    GET_ALL: `/products/api/products`,
    GET_BY_ID: (id) => `/products/api/products/${id}`
  },
  
  // User endpoints
  USERS: {
    PROFILE: `${API_CONFIG.USER_SERVICE}/profile`,
    UPDATE: `${API_CONFIG.USER_SERVICE}/profile`
  },
  
  // Order endpoints
  ORDERS: {
    CREATE: `${API_CONFIG.ORDER_SERVICE}/create`,
    GET_USER_ORDERS: `${API_CONFIG.ORDER_SERVICE}/user`,
    GET_BY_ID: (id) => `${API_CONFIG.ORDER_SERVICE}/${id}`
  },
  
  // Cart endpoints
  CART: {
    GET: `${API_CONFIG.CART_SERVICE}/items`,
    ADD: `${API_CONFIG.CART_SERVICE}/add`,
    REMOVE: (itemId) => `${API_CONFIG.CART_SERVICE}/remove/${itemId}`,
    CLEAR: `${API_CONFIG.CART_SERVICE}/clear`
  },
  
  // Wishlist endpoints
  WISHLIST: {
    GET: `${API_CONFIG.WISHLIST_SERVICE}/items`,
    ADD: `${API_CONFIG.WISHLIST_SERVICE}/add`,
    REMOVE: (productId) => `${API_CONFIG.WISHLIST_SERVICE}/remove/${productId}`
  }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, API_ENDPOINTS, buildUrl };
} else {
  window.API_CONFIG = API_CONFIG;
  window.API_ENDPOINTS = API_ENDPOINTS;
  window.buildUrl = buildUrl;
}