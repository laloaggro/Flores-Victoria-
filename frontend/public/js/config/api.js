// Configuración de las URLs de la API
const API_CONFIG = {
  // Gateway de la API (puerto 3000 para desarrollo)
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

// Hacer API_CONFIG global para que esté disponible en login.html
window.API_CONFIG = API_CONFIG;

// Función para construir URLs completas
const buildUrl = (endpoint) => {
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
    GET_ALL: `/products`,
    GET_BY_ID: (id) => `/products/${id}`
  },
  
  // User endpoints
  USERS: {
    PROFILE: `/users/profile`,
    UPDATE: `/users/profile`
  },
  
  // Order endpoints
  ORDERS: {
    CREATE: `/orders/create`,
    GET_USER_ORDERS: `/orders/user-orders`
  },
  
  // Cart endpoints
  CART: {
    ADD_ITEM: `/cart/add`,
    GET_ITEMS: `/cart/items`,
    REMOVE_ITEM: `/cart/remove`,
    CLEAR: `/cart/clear`,
    UPDATE_QUANTITY: `/cart/update-quantity`
  },
  
  // Wishlist endpoints
  WISHLIST: {
    ADD_ITEM: `/wishlist/add`,
    GET_ITEMS: `/wishlist/items`,
    REMOVE_ITEM: `/wishlist/remove`,
    CHECK_ITEM: `/wishlist/check`
  },
  
  // Review endpoints
  REVIEWS: {
    ADD: `/reviews/add`,
    GET_BY_PRODUCT: (productId) => `/reviews/product/${productId}`,
    GET_AVERAGE: (productId) => `/reviews/product/${productId}/average`
  },
  
  // Contact endpoints
  CONTACT: {
    SEND_MESSAGE: `/contact/send`
  }
};

// Hacer las funciones y endpoints disponibles globalmente
window.buildUrl = buildUrl;
window.API_CONFIG = API_CONFIG;
window.API_ENDPOINTS = API_ENDPOINTS;

// Exportar para módulos ES6
export { buildUrl, API_CONFIG, API_ENDPOINTS };