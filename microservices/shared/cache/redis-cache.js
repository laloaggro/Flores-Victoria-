/**
 * @fileoverview Redis Caching Layer para Productos
 * @description Implementa caché distribuido para consultas frecuentes de productos
 *
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const Redis = require('ioredis');

// ====================================================================
// CONFIGURACIÓN DE REDIS
// ====================================================================

let redisClient = null;
let isConnected = false;
let cacheErrorLogged = false; // Control de spam de logs

/**
 * Configuración de TTL por tipo de dato (en segundos)
 */
const CACHE_TTL = {
  // Productos individuales - 10 minutos
  product: 600,
  // Lista de productos - 5 minutos (cambia más frecuentemente)
  productList: 300,
  // Categorías - 1 hora (cambian poco)
  categories: 3600,
  // Productos destacados - 15 minutos
  featured: 900,
  // Búsquedas - 5 minutos
  search: 300,
  // Carrito - 1 hora
  cart: 3600,
  // Sesión de usuario - 24 horas
  session: 86400,
};

/**
 * Prefijos de cache keys
 */
const CACHE_PREFIX = {
  product: 'prod:',
  productList: 'prods:',
  categories: 'cats:',
  featured: 'feat:',
  search: 'search:',
  cart: 'cart:',
  session: 'sess:',
};

/**
 * Inicializa la conexión a Redis
 * @param {Object} options - Opciones de configuración
 * @returns {Promise<Redis|null>} Cliente Redis o null si falla
 */
async function initCache(options = {}) {
  // Si ya está conectado, retornar el cliente existente
  if (redisClient && isConnected) {
    return redisClient;
  }

  // Si Valkey/Redis está deshabilitado
  if (process.env.DISABLE_VALKEY === 'true' || process.env.USE_VALKEY === 'false') {
    console.info('[Cache] Valkey deshabilitado por configuración');
    return null;
  }

  try {
    const valkeyConfig = {
      host: options.host || process.env.VALKEY_HOST || 'localhost',
      port: options.port || process.env.VALKEY_PORT || 6379,
      password: options.password || process.env.VALKEY_PASSWORD,
      db: options.db || process.env.VALKEY_CACHE_DB || 1,
      retryStrategy: (times) => {
        if (times > 5) {
          console.warn('[Cache] Valkey no disponible después de 5 intentos');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    // Usar VALKEY_URL si está disponible (Railway)
    const cacheUrl = process.env.VALKEY_URL;
    if (cacheUrl) {
      redisClient = new Redis(cacheUrl, {
        ...valkeyConfig,
        db: options.db || 1,
      });
    } else {
      redisClient = new Redis(valkeyConfig);
    }

    redisClient.on('connect', () => {
      isConnected = true;
      cacheErrorLogged = false; // Reset al reconectar
      console.info('[Cache] Valkey conectado exitosamente');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      // Solo loguear una vez para evitar spam de logs
      if (!cacheErrorLogged) {
        console.info('[Cache] Valkey no disponible - usando fallback sin cache:', err.message);
        cacheErrorLogged = true;
      }
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('[Cache] No se pudo conectar a Valkey:', error.message);
    return null;
  }
}

/**
 * Obtiene el cliente Redis (lazy init)
 * @returns {Redis|null}
 */
function getClient() {
  if (!redisClient || !isConnected) {
    return null;
  }
  return redisClient;
}

// ====================================================================
// FUNCIONES DE CACHE GENÉRICAS
// ====================================================================

/**
 * Obtiene un valor del cache
 * @param {string} key - Clave del cache
 * @returns {Promise<any|null>} Valor parseado o null
 */
async function get(key) {
  const client = getClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    if (!value) return null;

    return JSON.parse(value);
  } catch (error) {
    console.warn('[Cache] Error getting key:', key, error.message);
    return null;
  }
}

/**
 * Guarda un valor en el cache
 * @param {string} key - Clave del cache
 * @param {any} value - Valor a guardar (se serializa a JSON)
 * @param {number} ttl - Tiempo de vida en segundos
 * @returns {Promise<boolean>} True si se guardó correctamente
 */
async function set(key, value, ttl = 300) {
  const client = getClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    await client.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.warn('[Cache] Error setting key:', key, error.message);
    return false;
  }
}

/**
 * Elimina una clave del cache
 * @param {string} key - Clave a eliminar
 * @returns {Promise<boolean>}
 */
async function del(key) {
  const client = getClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.warn('[Cache] Error deleting key:', key, error.message);
    return false;
  }
}

/**
 * Elimina múltiples claves por patrón
 * @param {string} pattern - Patrón glob (e.g., 'prod:*')
 * @returns {Promise<number>} Número de claves eliminadas
 */
async function delByPattern(pattern) {
  const client = getClient();
  if (!client) return 0;

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;

    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.warn('[Cache] Error deleting pattern:', pattern, error.message);
    return 0;
  }
}

// ====================================================================
// FUNCIONES DE CACHE PARA PRODUCTOS
// ====================================================================

/**
 * Obtiene un producto del cache
 * @param {string} productId - ID del producto
 * @returns {Promise<Object|null>}
 */
async function getProduct(productId) {
  return get(`${CACHE_PREFIX.product}${productId}`);
}

/**
 * Guarda un producto en el cache
 * @param {string} productId - ID del producto
 * @param {Object} product - Datos del producto
 * @returns {Promise<boolean>}
 */
async function setProduct(productId, product) {
  return set(`${CACHE_PREFIX.product}${productId}`, product, CACHE_TTL.product);
}

/**
 * Invalida el cache de un producto
 * @param {string} productId - ID del producto
 * @returns {Promise<boolean>}
 */
async function invalidateProduct(productId) {
  // Invalidar el producto específico
  await del(`${CACHE_PREFIX.product}${productId}`);
  // También invalidar listas que podrían contenerlo
  await delByPattern(`${CACHE_PREFIX.productList}*`);
  await delByPattern(`${CACHE_PREFIX.featured}*`);
  return true;
}

/**
 * Obtiene una lista de productos del cache
 * @param {string} cacheKey - Clave única para esta consulta
 * @returns {Promise<Object|null>}
 */
async function getProductList(cacheKey) {
  return get(`${CACHE_PREFIX.productList}${cacheKey}`);
}

/**
 * Guarda una lista de productos en el cache
 * @param {string} cacheKey - Clave única
 * @param {Object} data - Datos (productos + metadata)
 * @returns {Promise<boolean>}
 */
async function setProductList(cacheKey, data) {
  return set(`${CACHE_PREFIX.productList}${cacheKey}`, data, CACHE_TTL.productList);
}

/**
 * Genera una clave de cache para consultas de lista
 * @param {Object} params - Parámetros de la consulta
 * @returns {string}
 */
function generateListCacheKey(params) {
  const {
    page = 1,
    limit = 20,
    category,
    sort,
    order,
    minPrice,
    maxPrice,
    search,
    featured,
  } = params;

  const parts = [
    `p${page}`,
    `l${limit}`,
    category && `c:${category}`,
    sort && `s:${sort}`,
    order && `o:${order}`,
    minPrice && `min:${minPrice}`,
    maxPrice && `max:${maxPrice}`,
    search && `q:${search.substring(0, 20)}`,
    featured && 'feat',
  ].filter(Boolean);

  return parts.join('_');
}

// ====================================================================
// FUNCIONES DE CACHE PARA CATEGORÍAS
// ====================================================================

/**
 * Obtiene categorías del cache
 * @returns {Promise<Array|null>}
 */
async function getCategories() {
  return get(`${CACHE_PREFIX.categories}all`);
}

/**
 * Guarda categorías en el cache
 * @param {Array} categories - Lista de categorías
 * @returns {Promise<boolean>}
 */
async function setCategories(categories) {
  return set(`${CACHE_PREFIX.categories}all`, categories, CACHE_TTL.categories);
}

/**
 * Invalida el cache de categorías
 * @returns {Promise<boolean>}
 */
async function invalidateCategories() {
  return del(`${CACHE_PREFIX.categories}all`);
}

// ====================================================================
// FUNCIONES DE CACHE PARA PRODUCTOS DESTACADOS
// ====================================================================

/**
 * Obtiene productos destacados del cache
 * @param {number} limit - Límite de productos
 * @returns {Promise<Array|null>}
 */
async function getFeaturedProducts(limit = 10) {
  return get(`${CACHE_PREFIX.featured}${limit}`);
}

/**
 * Guarda productos destacados en el cache
 * @param {Array} products - Lista de productos
 * @param {number} limit - Límite usado en la consulta
 * @returns {Promise<boolean>}
 */
async function setFeaturedProducts(products, limit = 10) {
  return set(`${CACHE_PREFIX.featured}${limit}`, products, CACHE_TTL.featured);
}

// ====================================================================
// FUNCIONES DE CACHE PARA BÚSQUEDAS
// ====================================================================

/**
 * Obtiene resultados de búsqueda del cache
 * @param {string} query - Término de búsqueda
 * @param {Object} filters - Filtros aplicados
 * @returns {Promise<Object|null>}
 */
async function getSearchResults(query, filters = {}) {
  const cacheKey = generateListCacheKey({ search: query, ...filters });
  return get(`${CACHE_PREFIX.search}${cacheKey}`);
}

/**
 * Guarda resultados de búsqueda en el cache
 * @param {string} query - Término de búsqueda
 * @param {Object} filters - Filtros aplicados
 * @param {Object} results - Resultados
 * @returns {Promise<boolean>}
 */
async function setSearchResults(query, filters, results) {
  const cacheKey = generateListCacheKey({ search: query, ...filters });
  return set(`${CACHE_PREFIX.search}${cacheKey}`, results, CACHE_TTL.search);
}

// ====================================================================
// MIDDLEWARE DE CACHE
// ====================================================================

/**
 * Middleware que cachea respuestas automáticamente
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Middleware de Express
 */
function cacheMiddleware(options = {}) {
  const { ttl = 300, keyGenerator, type = 'general' } = options;

  return async (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generar clave de cache
    const cacheKey =
      typeof keyGenerator === 'function' ? keyGenerator(req) : `${type}:${req.originalUrl}`;

    // Intentar obtener del cache
    const cached = await get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Interceptar res.json para cachear la respuesta
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      // Solo cachear respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await set(cacheKey, data, ttl);
        res.setHeader('X-Cache', 'MISS');
      }
      return originalJson(data);
    };

    next();
  };
}

// ====================================================================
// ESTADÍSTICAS Y UTILIDADES
// ====================================================================

/**
 * Obtiene estadísticas del cache
 * @returns {Promise<Object>}
 */
async function getStats() {
  const client = getClient();
  if (!client) {
    return { connected: false, keys: 0, memory: '0B' };
  }

  try {
    const info = await client.info('memory');
    const dbsize = await client.dbsize();

    // Parsear memoria usada
    const memMatch = info.match(/used_memory_human:(\S+)/);
    const memory = memMatch ? memMatch[1] : 'unknown';

    return {
      connected: isConnected,
      keys: dbsize,
      memory,
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Limpia todo el cache (usar con cuidado)
 * @returns {Promise<boolean>}
 */
async function flushAll() {
  const client = getClient();
  if (!client) return false;

  try {
    await client.flushdb();
    console.info('[Cache] Cache limpiado completamente');
    return true;
  } catch (error) {
    console.error('[Cache] Error limpiando cache:', error.message);
    return false;
  }
}

/**
 * Cierra la conexión a Redis
 * @returns {Promise<void>}
 */
async function close() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    console.info('[Cache] Conexión cerrada');
  }
}

// ====================================================================
// EXPORTS
// ====================================================================

module.exports = {
  // Inicialización
  initCache,
  getClient,
  close,

  // Operaciones genéricas
  get,
  set,
  del,
  delByPattern,

  // Productos
  getProduct,
  setProduct,
  invalidateProduct,
  getProductList,
  setProductList,
  generateListCacheKey,

  // Categorías
  getCategories,
  setCategories,
  invalidateCategories,

  // Featured
  getFeaturedProducts,
  setFeaturedProducts,

  // Búsquedas
  getSearchResults,
  setSearchResults,

  // Middleware
  cacheMiddleware,

  // Utilidades
  getStats,
  flushAll,

  // Constantes
  CACHE_TTL,
  CACHE_PREFIX,
};
