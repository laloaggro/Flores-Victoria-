const redis = require('redis');
const { CACHE_TTL, CacheMetrics } = require('../../shared/cache/config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.metrics = new CacheMetrics();
    this.connect();
  }

  async connect() {
    try {
      // Log environment variables for debugging
      logger.info('🔧 Cache initialization', {
        service: 'product-service',
        DISABLE_CACHE: process.env.DISABLE_CACHE,
        REDIS_URL_SET: !!process.env.REDIS_URL,
      });

      // Skip Redis connection if DISABLE_CACHE is set (for dev environments without Redis)
      if (process.env.DISABLE_CACHE === 'true') {
        logger.info('⚠️ Cache disabled - DISABLE_CACHE=true', { service: 'product-service' });
        this.isConnected = false;
        return;
      }

      const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
      logger.info('📡 Connecting to Redis...', {
        service: 'product-service',
        redisUrl: redisUrl.replace(/:[^:@]+@/, ':***@'), // Hide password
      });

      this.client = redis.createClient({
        url: redisUrl,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.warn('❌ Redis server no disponible', { service: 'product-service' });
            return new Error('Redis server no disponible');
          }

          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Tiempo de reintento agotado');
          }

          return Math.min(options.attempt * 100, 3000);
        },
      });

      this.client.on('error', (err) => {
        logger.error('❌ Error de Redis', { service: 'product-service', err: err.message });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('🔗 Conectado a Redis', { service: 'product-service' });
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('❌ Error conectando a Redis', {
        service: 'product-service',
        error: error.message,
      });
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value) {
        this.metrics.recordHit();
        return JSON.parse(value);
      } else {
        this.metrics.recordMiss();
        return null;
      }
    } catch (error) {
      this.metrics.recordError();
      logger.error(
        { service: 'product-service', key, error: error.message },
        '❌ Error obteniendo cache'
      );
      return null;
    }
  }

  async set(key, value, ttlSeconds = CACHE_TTL.PRODUCT_LIST) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      this.metrics.recordError();
      logger.error(
        { service: 'product-service', key, error: error.message },
        '❌ Error guardando cache'
      );
      return false;
    }
  }

  // Obtener métricas de rendimiento del cache
  getMetrics() {
    return this.metrics.getStats();
  }

  // Reiniciar métricas
  resetMetrics() {
    this.metrics.reset();
  }

  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(
        { service: 'product-service', key, error: error.message },
        '❌ Error eliminando cache'
      );
      return false;
    }
  }

  async flush() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushAll();
      logger.info('✅ Cache completamente limpiado', { service: 'product-service' });
      return true;
    } catch (error) {
      logger.error('❌ Error limpiando cache', {
        service: 'product-service',
        error: error.message,
      });
      return false;
    }
  }

  // Generar clave de cache para productos
  generateProductKey(filters = {}) {
    const { occasion, category, color, minPrice, maxPrice, search, featured, limit, page } =
      filters;
    const keyParts = ['products'];

    if (category) keyParts.push(`cat:${category}`);
    if (occasion) keyParts.push(`occ:${occasion}`);
    if (color) keyParts.push(`col:${color}`);
    if (minPrice) keyParts.push(`min:${minPrice}`);
    if (maxPrice) keyParts.push(`max:${maxPrice}`);
    if (search) keyParts.push(`q:${search}`);
    if (featured) keyParts.push(`feat:${featured}`);
    if (limit) keyParts.push(`lim:${limit}`);
    if (page) keyParts.push(`p:${page}`);

    return keyParts.join('_');
  }

  // Invalidar cache relacionado con productos
  async invalidateProductCache() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys('products_*');
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(
          { service: 'product-service', count: keys.length },
          'Cache de productos invalidado'
        );
      }

      // También invalidar estadísticas y categorías
      await this.del('stats');
      await this.del('categories');
      await this.del('occasions');

      return true;
    } catch (error) {
      logger.error(
        { service: 'product-service', error: error.message },
        'Error invalidando cache de productos'
      );
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      logger.info('Desconectado de Redis', { service: 'product-service' });
    }
  }
}

// Middleware de cache para productos con TTL optimizado
const cacheMiddleware =
  (ttlSeconds = CACHE_TTL.PRODUCT_LIST) =>
  async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = cacheService.generateProductKey(req.query);
    const cachedData = await cacheService.get(cacheKey);

    if (cachedData) {
      logger.debug({ service: 'product-service', cacheKey }, 'Cache hit');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    res.setHeader('X-Cache', 'MISS');

    // Interceptar el método json de la respuesta
    const originalJson = res.json;
    res.json = function (data) {
      // Guardar en cache solo si es una respuesta exitosa
      if (res.statusCode === 200) {
        cacheService.set(cacheKey, data, ttlSeconds);
        logger.debug(
          { service: 'product-service', cacheKey, ttl: ttlSeconds },
          'Guardado en cache'
        );
      }

      return originalJson.call(this, data);
    };

    next();
  };

// Instancia singleton del servicio de cache
const cacheService = new CacheService();

module.exports = {
  cacheService,
  cacheMiddleware,
};
