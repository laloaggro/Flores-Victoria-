// Configuración de las URLs de la API
const API_CONFIG = {
  // Gateway de la API (puerto 8000)
  BASE_URL: 'http://localhost:8000/api',
  
  // URLs de los microservicios a través del gateway
  AUTH_SERVICE: 'http://localhost:8000/api/auth',
  PRODUCT_SERVICE: 'http://localhost:8000/api/products',
  USER_SERVICE: 'http://localhost:8000/api/users',
  ORDER_SERVICE: 'http://localhost:8000/api/orders',
  CART_SERVICE: 'http://localhost:8000/api/cart',
  WISHLIST_SERVICE: 'http://localhost:8000/api/wishlist',
  REVIEW_SERVICE: 'http://localhost:8000/api/reviews',
  CONTACT_SERVICE: 'http://localhost:8000/api/contact'
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
    GET_ALL: `/api/products`,
    GET_BY_ID: (id) => `/api/products/${id}`
  },
  
  // User endpoints
  USERS: {
    PROFILE: `${API_CONFIG.USER_SERVICE}/profile`,
    UPDATE: `${API_CONFIG.USER_SERVICE}/profile`
  },
  
  // Order endpoints
  ORDERS: {
    CREATE: `${API_CONFIG.ORDER_SERVICE}/create`,
    GET_USER_ORDERS: `${API_CONFIG.ORDER_SERVICE}/user-orders`
  },
  
  // Cart endpoints
  CART: {
    ADD_ITEM: `${API_CONFIG.CART_SERVICE}/add`,
    GET_ITEMS: `${API_CONFIG.CART_SERVICE}/items`,
    REMOVE_ITEM: `${API_CONFIG.CART_SERVICE}/remove`
  },
  
  // Wishlist endpoints
  WISHLIST: {
    ADD_ITEM: `${API_CONFIG.WISHLIST_SERVICE}/add`,
    GET_ITEMS: `${API_CONFIG.WISHLIST_SERVICE}/items`,
    REMOVE_ITEM: `${API_CONFIG.WISHLIST_SERVICE}/remove`
  },
  
  // Review endpoints
  REVIEWS: {
    ADD: `${API_CONFIG.REVIEW_SERVICE}/add`,
    GET_BY_PRODUCT: (productId) => `${API_CONFIG.REVIEW_SERVICE}/product/${productId}`
  },
  
  // Contact endpoints
  CONTACT: {
    SEND_MESSAGE: `${API_CONFIG.CONTACT_SERVICE}/send`
  }
};

// Hacer las funciones y endpoints disponibles globalmente
window.buildUrl = buildUrl;
window.API_ENDPOINTS = API_ENDPOINTS;