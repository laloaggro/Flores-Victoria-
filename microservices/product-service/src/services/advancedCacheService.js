/**
 * @fileoverview Advanced Product Cache Service
 * @description Cache inteligente con productos populares, warming y estrategias avanzadas
 * 
 * @author Flores Victoria Team
 * @version 2.0.0
 */

const redis = require('redis');
const logger = require('../utils/logger');

// TTL configurables
const CACHE_TTL = {
  PRODUCT_DETAIL: 600,      // 10 minutos - producto individual
  PRODUCT_LIST: 300,        // 5 minutos - listas de productos
  POPULAR_PRODUCTS: 900,    // 15 minutos - productos populares
  FEATURED_PRODUCTS: 600,   // 10 minutos - productos destacados
  CATEGORIES: 3600,         // 1 hora - categorías
  OCCASIONS: 3600,          // 1 hora - ocasiones
  STATS: 300,               // 5 minutos - estadísticas
  SEARCH_RESULTS: 180,      // 3 minutos - resultados de búsqueda
};

// Prefijos de cache
const CACHE_PREFIX = {
  PRODUCT: 'prod',
  LIST: 'prods',
  POPULAR: 'popular',
  FEATURED: 'featured',
  CATEGORY: 'cat',
  OCCASION: 'occ',
  SEARCH: 'search',
  STATS: 'stats',
  VIEW_COUNT: 'views',
};

/**
 * Servicio de Cache Avanzado para Productos
 */
class AdvancedProductCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      latencySum: 0,
      requestCount: 0,
    };
  }

  /**
   * Conectar a Redis/Valkey
   */
  async connect() {
    if (process.env.DISABLE_CACHE === 'true') {
      logger.info('⚠️ Cache disabled', { service: 'product-cache' });
      return;
    }

    try {
      const valkeyUrl = process.env.VALKEY_URL || process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = redis.createClient({
        url: valkeyUrl,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 10) return null;
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        logger.error('Cache error', { service: 'product-cache', error: err.message });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('✅ Connected to cache', { service: 'product-cache' });
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to cache', { 
        service: 'product-cache', 
        error: error.message 
      });
      this.isConnected = false;
    }
  }

  /**
   * Verificar si el cache está disponible
   */
  isAvailable() {
    return this.isConnected && this.client !== null;
  }

  // ═══════════════════════════════════════════════════════════════
  // OPERACIONES BÁSICAS CON MÉTRICAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtener valor del cache con métricas
   */
  async get(key) {
    if (!this.isAvailable()) return null;

    const start = Date.now();
    try {
      const value = await this.client.get(key);
      this.recordLatency(start);
      
      if (value) {
        this.metrics.hits++;
        return JSON.parse(value);
      }
      
      this.metrics.misses++;
      return null;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Guardar valor en cache
   */
  async set(key, value, ttl = CACHE_TTL.PRODUCT_LIST) {
    if (!this.isAvailable()) return false;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Eliminar del cache
   */
  async del(key) {
    if (!this.isAvailable()) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache del error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Registrar latencia
   */
  recordLatency(start) {
    const latency = Date.now() - start;
    this.metrics.latencySum += latency;
    this.metrics.requestCount++;
  }

  // ═══════════════════════════════════════════════════════════════
  // CACHE DE PRODUCTOS POPULARES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Incrementar contador de vistas de producto
   * Usa ZINCRBY para mantener un ranking en tiempo real
   */
  async incrementProductView(productId) {
    if (!this.isAvailable()) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `${CACHE_PREFIX.VIEW_COUNT}:${today}`;
      
      // Incrementar contador y establecer TTL de 7 días
      await this.client.zIncrBy(key, 1, productId);
      await this.client.expire(key, 7 * 24 * 60 * 60);
    } catch (error) {
      logger.error('Error incrementing view count', { productId, error: error.message });
    }
  }

  /**
   * Obtener IDs de productos más vistos
   * @param {number} limit - Cantidad de productos
   * @param {number} days - Días a considerar
   */
  async getPopularProductIds(limit = 10, days = 7) {
    if (!this.isAvailable()) return [];

    try {
      const keys = [];
      const today = new Date();
      
      // Generar keys de los últimos N días
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        keys.push(`${CACHE_PREFIX.VIEW_COUNT}:${date.toISOString().split('T')[0]}`);
      }

      // Si hay múltiples días, unir los rankings
      if (keys.length > 1) {
        const unionKey = `${CACHE_PREFIX.POPULAR}:union:${days}d`;
        await this.client.zUnionStore(unionKey, keys);
        await this.client.expire(unionKey, CACHE_TTL.POPULAR_PRODUCTS);
        
        const results = await this.client.zRangeWithScores(unionKey, 0, limit - 1, { REV: true });
        return results.map(r => ({ productId: r.value, views: r.score }));
      }

      // Solo un día
      const results = await this.client.zRangeWithScores(keys[0], 0, limit - 1, { REV: true });
      return results.map(r => ({ productId: r.value, views: r.score }));
    } catch (error) {
      logger.error('Error getting popular products', { error: error.message });
      return [];
    }
  }

  /**
   * Cachear productos populares completos
   */
  async cachePopularProducts(products) {
    const key = `${CACHE_PREFIX.POPULAR}:list`;
    return this.set(key, products, CACHE_TTL.POPULAR_PRODUCTS);
  }

  /**
   * Obtener productos populares cacheados
   */
  async getCachedPopularProducts() {
    const key = `${CACHE_PREFIX.POPULAR}:list`;
    return this.get(key);
  }

  // ═══════════════════════════════════════════════════════════════
  // CACHE DE PRODUCTOS INDIVIDUALES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Cachear producto individual
   */
  async cacheProduct(productId, product) {
    const key = `${CACHE_PREFIX.PRODUCT}:${productId}`;
    return this.set(key, product, CACHE_TTL.PRODUCT_DETAIL);
  }

  /**
   * Obtener producto cacheado
   */
  async getCachedProduct(productId) {
    const key = `${CACHE_PREFIX.PRODUCT}:${productId}`;
    return this.get(key);
  }

  /**
   * Cachear múltiples productos (para batch loading)
   */
  async cacheProducts(products) {
    if (!this.isAvailable() || !products.length) return false;

    try {
      const pipeline = this.client.multi();
      
      for (const product of products) {
        const key = `${CACHE_PREFIX.PRODUCT}:${product._id || product.id}`;
        pipeline.setEx(key, CACHE_TTL.PRODUCT_DETAIL, JSON.stringify(product));
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Error batch caching products', { error: error.message });
      return false;
    }
  }

  /**
   * Obtener múltiples productos (MGET)
   */
  async getCachedProducts(productIds) {
    if (!this.isAvailable() || !productIds.length) return [];

    try {
      const keys = productIds.map(id => `${CACHE_PREFIX.PRODUCT}:${id}`);
      const values = await this.client.mGet(keys);
      
      const products = [];
      const missingIds = [];
      
      values.forEach((value, index) => {
        if (value) {
          products.push(JSON.parse(value));
          this.metrics.hits++;
        } else {
          missingIds.push(productIds[index]);
          this.metrics.misses++;
        }
      });
      
      return { products, missingIds };
    } catch (error) {
      logger.error('Error batch getting products', { error: error.message });
      return { products: [], missingIds: productIds };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CACHE DE LISTAS Y BÚSQUEDAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generar clave de cache para lista de productos
   */
  generateListKey(filters = {}) {
    const parts = [CACHE_PREFIX.LIST];
    
    const sortedKeys = Object.keys(filters).sort();
    for (const key of sortedKeys) {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        parts.push(`${key}:${filters[key]}`);
      }
    }
    
    return parts.join(':');
  }

  /**
   * Cachear lista de productos filtrada
   */
  async cacheProductList(filters, result) {
    const key = this.generateListKey(filters);
    const ttl = filters.search ? CACHE_TTL.SEARCH_RESULTS : CACHE_TTL.PRODUCT_LIST;
    return this.set(key, result, ttl);
  }

  /**
   * Obtener lista de productos cacheada
   */
  async getCachedProductList(filters) {
    const key = this.generateListKey(filters);
    return this.get(key);
  }

  // ═══════════════════════════════════════════════════════════════
  // CACHE DE PRODUCTOS DESTACADOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Cachear productos destacados
   */
  async cacheFeaturedProducts(products) {
    const key = `${CACHE_PREFIX.FEATURED}:list`;
    return this.set(key, products, CACHE_TTL.FEATURED_PRODUCTS);
  }

  /**
   * Obtener productos destacados
   */
  async getCachedFeaturedProducts() {
    const key = `${CACHE_PREFIX.FEATURED}:list`;
    return this.get(key);
  }

  // ═══════════════════════════════════════════════════════════════
  // CACHE DE CATEGORÍAS Y OCASIONES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Cachear categorías
   */
  async cacheCategories(categories) {
    const key = `${CACHE_PREFIX.CATEGORY}:all`;
    return this.set(key, categories, CACHE_TTL.CATEGORIES);
  }

  /**
   * Obtener categorías cacheadas
   */
  async getCachedCategories() {
    const key = `${CACHE_PREFIX.CATEGORY}:all`;
    return this.get(key);
  }

  /**
   * Cachear ocasiones
   */
  async cacheOccasions(occasions) {
    const key = `${CACHE_PREFIX.OCCASION}:all`;
    return this.set(key, occasions, CACHE_TTL.OCCASIONS);
  }

  /**
   * Obtener ocasiones cacheadas
   */
  async getCachedOccasions() {
    const key = `${CACHE_PREFIX.OCCASION}:all`;
    return this.get(key);
  }

  // ═══════════════════════════════════════════════════════════════
  // INVALIDACIÓN DE CACHE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Invalidar cache de un producto específico
   */
  async invalidateProduct(productId) {
    if (!this.isAvailable()) return;

    try {
      // Eliminar producto individual
      await this.del(`${CACHE_PREFIX.PRODUCT}:${productId}`);
      
      // Invalidar listas que podrían contener el producto
      await this.invalidateProductLists();
      
      logger.info('Product cache invalidated', { productId });
    } catch (error) {
      logger.error('Error invalidating product cache', { productId, error: error.message });
    }
  }

  /**
   * Invalidar todas las listas de productos
   */
  async invalidateProductLists() {
    if (!this.isAvailable()) return;

    try {
      // Buscar y eliminar todas las listas
      const listKeys = await this.client.keys(`${CACHE_PREFIX.LIST}:*`);
      const popularKeys = await this.client.keys(`${CACHE_PREFIX.POPULAR}:*`);
      const featuredKeys = await this.client.keys(`${CACHE_PREFIX.FEATURED}:*`);
      
      const allKeys = [...listKeys, ...popularKeys, ...featuredKeys];
      
      if (allKeys.length > 0) {
        await this.client.del(allKeys);
        logger.info('Product lists cache invalidated', { count: allKeys.length });
      }
    } catch (error) {
      logger.error('Error invalidating product lists', { error: error.message });
    }
  }

  /**
   * Invalidar todo el cache de productos
   */
  async invalidateAll() {
    if (!this.isAvailable()) return;

    try {
      const keys = await this.client.keys(`${CACHE_PREFIX.PRODUCT}:*`);
      const listKeys = await this.client.keys(`${CACHE_PREFIX.LIST}:*`);
      const popularKeys = await this.client.keys(`${CACHE_PREFIX.POPULAR}:*`);
      const featuredKeys = await this.client.keys(`${CACHE_PREFIX.FEATURED}:*`);
      const catKeys = await this.client.keys(`${CACHE_PREFIX.CATEGORY}:*`);
      const occKeys = await this.client.keys(`${CACHE_PREFIX.OCCASION}:*`);
      
      const allKeys = [...keys, ...listKeys, ...popularKeys, ...featuredKeys, ...catKeys, ...occKeys];
      
      if (allKeys.length > 0) {
        await this.client.del(allKeys);
        logger.info('All product cache invalidated', { count: allKeys.length });
      }
    } catch (error) {
      logger.error('Error invalidating all cache', { error: error.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CACHE WARMING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Precalentar cache con datos frecuentes
   * Llamar al inicio del servicio o después de un deploy
   */
  async warmCache(dataLoader) {
    if (!this.isAvailable()) return;

    logger.info('🔥 Starting cache warming...', { service: 'product-cache' });

    try {
      // Cargar categorías
      if (dataLoader.getCategories) {
        const categories = await dataLoader.getCategories();
        await this.cacheCategories(categories);
      }

      // Cargar ocasiones
      if (dataLoader.getOccasions) {
        const occasions = await dataLoader.getOccasions();
        await this.cacheOccasions(occasions);
      }

      // Cargar productos destacados
      if (dataLoader.getFeaturedProducts) {
        const featured = await dataLoader.getFeaturedProducts();
        await this.cacheFeaturedProducts(featured);
        await this.cacheProducts(featured);
      }

      // Cargar productos populares (top 20)
      if (dataLoader.getPopularProducts) {
        const popular = await dataLoader.getPopularProducts(20);
        await this.cachePopularProducts(popular);
        await this.cacheProducts(popular);
      }

      logger.info('✅ Cache warming completed', { service: 'product-cache' });
    } catch (error) {
      logger.error('Cache warming failed', { error: error.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTRICAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? ((this.metrics.hits / total) * 100).toFixed(2) : 0;
    const avgLatency = this.metrics.requestCount > 0 
      ? (this.metrics.latencySum / this.metrics.requestCount).toFixed(2)
      : 0;

    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      errors: this.metrics.errors,
      hitRate: `${hitRate}%`,
      avgLatencyMs: avgLatency,
      totalRequests: total,
      isConnected: this.isConnected,
    };
  }

  /**
   * Resetear métricas
   */
  resetStats() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      latencySum: 0,
      requestCount: 0,
    };
  }

  /**
   * Desconectar del cache
   */
  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from cache', { service: 'product-cache' });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE CACHE
// ═══════════════════════════════════════════════════════════════

/**
 * Middleware de cache para endpoints de productos
 */
const createCacheMiddleware = (cache, ttl = CACHE_TTL.PRODUCT_LIST) => {
  return async (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = cache.generateListKey(req.query);
    const cached = await cache.get(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Key', key);
      return res.json(cached);
    }

    res.setHeader('X-Cache', 'MISS');

    // Interceptar respuesta para cachear
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        cache.set(key, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware para tracking de vistas de producto
 */
const createViewTrackingMiddleware = (cache) => {
  return async (req, res, next) => {
    // Ejecutar después de la respuesta
    res.on('finish', () => {
      if (res.statusCode === 200 && req.params.id) {
        cache.incrementProductView(req.params.id);
      }
    });
    next();
  };
};

// Instancia singleton
const advancedProductCache = new AdvancedProductCache();

module.exports = {
  advancedProductCache,
  createCacheMiddleware,
  createViewTrackingMiddleware,
  CACHE_TTL,
  CACHE_PREFIX,
};
