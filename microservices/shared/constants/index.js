/**
 * @fileoverview Constantes compartidas para todos los microservicios
 * @description Centraliza magic numbers, timeouts, límites y configuraciones
 * @author Flores Victoria Team
 * @version 1.0.0
 */

// ============================================
// TIEMPOS (en milisegundos)
// ============================================
const TIMEOUTS = {
  // Health checks
  HEALTH_CHECK: 5000,
  HEALTH_CHECK_INTERVAL: 30000,

  // Llamadas entre servicios
  SERVICE_CALL: 10000,
  SERVICE_CALL_RETRY: 3000,

  // Base de datos
  DATABASE_QUERY: 30000,
  DATABASE_CONNECTION: 10000,

  // Cache TTL
  CACHE_TTL_SHORT: 60 * 1000, // 1 minuto
  CACHE_TTL_MEDIUM: 5 * 60 * 1000, // 5 minutos
  CACHE_TTL_LONG: 60 * 60 * 1000, // 1 hora
  CACHE_TTL_DAY: 24 * 60 * 60 * 1000, // 24 horas

  // Rate limiting windows
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos

  // Session
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos de inactividad

  // Debounce/Throttle
  DEBOUNCE_DEFAULT: 300,
  THROTTLE_DEFAULT: 1000,
};

// ============================================
// LÍMITES
// ============================================
const LIMITS = {
  // Carrito de compras
  MAX_CART_ITEMS: 100,
  MAX_CART_ITEM_QUANTITY: 99,
  MIN_CART_ITEM_QUANTITY: 1,

  // Pedidos
  MAX_ORDER_ITEMS: 50,
  MIN_ORDER_AMOUNT: 1000, // Centavos/mínimo en moneda local

  // Archivos
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,

  // Paginación
  PAGINATION_DEFAULT: 20,
  PAGINATION_MAX: 100,
  PAGINATION_MIN: 1,

  // Búsqueda
  SEARCH_MIN_LENGTH: 2,
  SEARCH_MAX_LENGTH: 100,
  SEARCH_MAX_RESULTS: 500,

  // Texto
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
  REVIEW_MAX_LENGTH: 2000,

  // Contraseñas
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,

  // Intentos
  MAX_LOGIN_ATTEMPTS: 5,
  MAX_RETRY_ATTEMPTS: 3,

  // Conexiones
  DB_POOL_MIN: 2,
  DB_POOL_MAX: 10,
  REDIS_MAX_CONNECTIONS: 50,
};

// ============================================
// HTTP STATUS CODES
// ============================================
const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// ============================================
// RATE LIMITING
// ============================================
const RATE_LIMITS = {
  // Endpoints públicos sin autenticación
  PUBLIC: {
    windowMs: TIMEOUTS.RATE_LIMIT_WINDOW,
    max: 50,
    message: 'Demasiadas solicitudes. Por favor, intenta de nuevo en 15 minutos.',
  },

  // Usuarios autenticados
  AUTHENTICATED: {
    windowMs: TIMEOUTS.RATE_LIMIT_WINDOW,
    max: 200,
    message: 'Has excedido el límite de solicitudes.',
  },

  // Administradores
  ADMIN: {
    windowMs: TIMEOUTS.RATE_LIMIT_WINDOW,
    max: 500,
    message: 'Límite de solicitudes de administrador excedido.',
  },

  // Endpoints críticos (login, registro)
  CRITICAL: {
    windowMs: TIMEOUTS.RATE_LIMIT_WINDOW,
    max: 10,
    message: 'Demasiados intentos. Espera 15 minutos.',
  },

  // Búsqueda
  SEARCH: {
    windowMs: 60 * 1000, // 1 minuto
    max: 30,
    message: 'Demasiadas búsquedas. Espera un momento.',
  },

  // Upload de archivos
  UPLOAD: {
    windowMs: TIMEOUTS.RATE_LIMIT_WINDOW,
    max: 20,
    message: 'Límite de uploads alcanzado.',
  },
};

// ============================================
// REGEX PATTERNS
// ============================================
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_MX: /^(\+?52)?[1-9]\d{9}$/,
  PHONE_INTL: /^\+?[1-9]\d{6,14}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  MONGO_ID: /^[0-9a-fA-F]{24}$/,
  JWT: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
  CREDIT_CARD: /^\d{13,19}$/,
  POSTAL_CODE_MX: /^\d{5}$/,
};

// ============================================
// ESTADOS DE PEDIDOS
// ============================================
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const ORDER_STATUS_FLOW = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: [],
};

// ============================================
// ESTADOS DE PAGO
// ============================================
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

// ============================================
// ROLES DE USUARIO
// ============================================
const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

const ROLE_HIERARCHY = {
  [USER_ROLES.GUEST]: 0,
  [USER_ROLES.USER]: 1,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.SUPER_ADMIN]: 3,
};

// ============================================
// CATEGORÍAS DE PRODUCTOS
// ============================================
const PRODUCT_CATEGORIES = {
  ROSES: 'rosas',
  TULIPS: 'tulipanes',
  ORCHIDS: 'orquideas',
  SUNFLOWERS: 'girasoles',
  MIXED: 'mixtos',
  EXOTIC: 'exoticos',
  SEASONAL: 'temporada',
};

// ============================================
// EVENTOS DEL SISTEMA (para Event Bus)
// ============================================
const EVENTS = {
  // Usuario
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  PASSWORD_RESET_REQUESTED: 'user.password_reset_requested',
  PASSWORD_CHANGED: 'user.password_changed',

  // Pedidos
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CANCELLED: 'order.cancelled',

  // Pagos
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Productos
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  STOCK_LOW: 'product.stock_low',
  STOCK_OUT: 'product.stock_out',

  // Carrito
  CART_UPDATED: 'cart.updated',
  CART_ABANDONED: 'cart.abandoned',

  // Sistema
  SERVICE_STARTED: 'system.service_started',
  SERVICE_STOPPED: 'system.service_stopped',
  HEALTH_CHECK_FAILED: 'system.health_check_failed',
};

// ============================================
// SERVICIOS
// ============================================
const SERVICES = {
  API_GATEWAY: 'api-gateway',
  AUTH: 'auth-service',
  USER: 'user-service',
  PRODUCT: 'product-service',
  ORDER: 'order-service',
  CART: 'cart-service',
  WISHLIST: 'wishlist-service',
  PAYMENT: 'payment-service',
  NOTIFICATION: 'notification-service',
  REVIEW: 'review-service',
  CONTACT: 'contact-service',
  PROMOTION: 'promotion-service',
};

// ============================================
// PUERTOS POR DEFECTO
// ============================================
const DEFAULT_PORTS = {
  [SERVICES.API_GATEWAY]: 3000,
  [SERVICES.AUTH]: 3001,
  [SERVICES.USER]: 3002,
  [SERVICES.PRODUCT]: 3009,
  [SERVICES.ORDER]: 3004,
  [SERVICES.CART]: 3005,
  [SERVICES.WISHLIST]: 3006,
  [SERVICES.PAYMENT]: 3018,
  [SERVICES.NOTIFICATION]: 3008,
  [SERVICES.REVIEW]: 3010,
  [SERVICES.CONTACT]: 3011,
  [SERVICES.PROMOTION]: 3019,
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  TIMEOUTS,
  LIMITS,
  HTTP_STATUS,
  RATE_LIMITS,
  PATTERNS,
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  PAYMENT_STATUS,
  USER_ROLES,
  ROLE_HIERARCHY,
  PRODUCT_CATEGORIES,
  EVENTS,
  SERVICES,
  DEFAULT_PORTS,
};
