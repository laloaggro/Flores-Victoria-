/**
 * CONFIGURACIÓN OPTIMIZADA DE CACHE
 * Estrategias de TTL (Time To Live) para diferentes tipos de datos
 * Flores Victoria - Performance Optimization
 */

// TTL en segundos para diferentes tipos de datos
const CACHE_TTL = {
  // Datos que cambian raramente - cache largo
  CATEGORIES: 3600, // 1 hora - categorías raramente cambian
  OCCASIONS: 3600, // 1 hora - ocasiones raramente cambian
  FEATURED_PRODUCTS: 1800, // 30 minutos - productos destacados
  STATS: 900, // 15 minutos - estadísticas del dashboard

  // Datos que cambian frecuentemente - cache medio
  PRODUCT_LIST: 300, // 5 minutos - listados de productos
  PRODUCT_DETAIL: 600, // 10 minutos - detalle de producto individual
  PRODUCT_SEARCH: 300, // 5 minutos - resultados de búsqueda

  // Datos específicos del usuario - cache corto
  USER_CART: 1800, // 30 minutos - carrito de compras
  USER_WISHLIST: 1800, // 30 minutos - lista de deseos
  USER_PROFILE: 900, // 15 minutos - perfil de usuario
  USER_ORDERS: 300, // 5 minutos - historial de pedidos

  // Datos de sesión - cache muy corto
  AUTH_TOKEN: 3600, // 1 hora - token de autenticación
  RATE_LIMIT: 60, // 1 minuto - control de rate limiting

  // Datos analíticos - cache medio
  REVIEWS: 900, // 15 minutos - reseñas de productos
  ANALYTICS: 1800, // 30 minutos - datos analíticos
};

// Prefijos de claves para organizar el cache
const CACHE_KEYS = {
  // Productos
  PRODUCT_LIST: 'products:list',
  PRODUCT_DETAIL: 'product:detail',
  PRODUCT_SEARCH: 'products:search',
  CATEGORIES: 'products:categories',
  OCCASIONS: 'products:occasions',
  FEATURED: 'products:featured',
  STATS: 'products:stats',

  // Usuario
  USER_CART: 'user:cart',
  USER_WISHLIST: 'user:wishlist',
  USER_PROFILE: 'user:profile',
  USER_ORDERS: 'user:orders',

  // Reseñas
  PRODUCT_REVIEWS: 'reviews:product',
  USER_REVIEWS: 'reviews:user',

  // Rate limiting
  RATE_LIMIT: 'ratelimit',
};

/**
 * Genera una clave de cache estructurada
 * @param {string} prefix - Prefijo del tipo de dato
 * @param {string|number} identifier - Identificador único
 * @param {object} params - Parámetros adicionales
 * @returns {string} Clave de cache
 */
function generateCacheKey(prefix, identifier = '', params = {}) {
  const parts = [prefix];

  if (identifier) {
    parts.push(identifier);
  }

  // Agregar parámetros ordenados alfabéticamente para consistencia
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join(':');

  if (sortedParams) {
    parts.push(sortedParams);
  }

  return parts.join(':');
}

/**
 * Estrategia de invalidación de cache
 */
const CACHE_INVALIDATION = {
  // Cuando se crea/actualiza/elimina un producto
  ON_PRODUCT_CHANGE: [
    'products:list:*',
    'products:search:*',
    'products:featured:*',
    'products:stats',
    'products:categories',
  ],

  // Cuando se actualiza el stock
  ON_STOCK_CHANGE: ['product:detail:*', 'products:list:*'],

  // Cuando se crea/actualiza una reseña
  ON_REVIEW_CHANGE: ['reviews:product:*', 'product:detail:*'],

  // Cuando se actualiza el carrito
  ON_CART_CHANGE: ['user:cart:*'],

  // Cuando se crea un pedido
  ON_ORDER_CREATE: ['user:cart:*', 'user:orders:*', 'product:detail:*'],
};

/**
 * Configuración de Redis para producción
 */
const REDIS_CONFIG = {
  // Pool de conexiones
  MAX_CLIENTS: 10,
  MIN_CLIENTS: 2,

  // Timeouts
  CONNECT_TIMEOUT: 10000, // 10 segundos
  COMMAND_TIMEOUT: 5000, // 5 segundos

  // Retry strategy
  RETRY_MAX_DELAY: 3000, // 3 segundos
  RETRY_MAX_TIME: 60000, // 1 minuto

  // Memory policy
  MAXMEMORY_POLICY: 'allkeys-lru', // Evict least recently used keys
};

/**
 * Métricas de cache para monitoreo
 */
class CacheMetrics {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
  }

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  recordError() {
    this.errors++;
  }

  getHitRate() {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      errors: this.errors,
      hitRate: `${this.getHitRate().toFixed(2)}%`,
      total: this.hits + this.misses,
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
  }
}

module.exports = {
  CACHE_TTL,
  CACHE_KEYS,
  CACHE_INVALIDATION,
  REDIS_CONFIG,
  generateCacheKey,
  CacheMetrics,
};
