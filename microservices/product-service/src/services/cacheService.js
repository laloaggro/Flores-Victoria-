const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connect();
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
      
      this.client = redis.createClient({
        url: redisUrl,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('❌ Redis server no disponible');
            return new Error('Redis server no disponible');
          }
          
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Tiempo de reintento agotado');
          }
          
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ Error de Redis:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔗 Conectado a Redis');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Error conectando a Redis:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`❌ Error obteniendo cache ${key}:`, error.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`❌ Error guardando cache ${key}:`, error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`❌ Error eliminando cache ${key}:`, error.message);
      return false;
    }
  }

  async flush() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushAll();
      console.log('✅ Cache completamente limpiado');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando cache:', error.message);
      return false;
    }
  }

  // Generar clave de cache para productos
  generateProductKey(filters = {}) {
    const { occasion, category, color, minPrice, maxPrice, search, featured, limit, page } = filters;
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
        console.log(`✅ Cache de productos invalidado: ${keys.length} claves eliminadas`);
      }
      
      // También invalidar estadísticas y categorías
      await this.del('stats');
      await this.del('categories');
      await this.del('occasions');
      
      return true;
    } catch (error) {
      console.error('❌ Error invalidando cache de productos:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('✅ Desconectado de Redis');
    }
  }
}

// Middleware de cache para productos
const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = cacheService.generateProductKey(req.query);
    const cachedData = await cacheService.get(cacheKey);

    if (cachedData) {
      console.log(`🚀 Cache hit: ${cacheKey}`);
      return res.status(200).json(cachedData);
    }

    // Interceptar el método json de la respuesta
    const originalJson = res.json;
    res.json = function(data) {
      // Guardar en cache solo si es una respuesta exitosa
      if (res.statusCode === 200) {
        cacheService.set(cacheKey, data, ttlSeconds);
        console.log(`💾 Guardado en cache: ${cacheKey}`);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

// Instancia singleton del servicio de cache
const cacheService = new CacheService();

module.exports = {
  cacheService,
  cacheMiddleware
};