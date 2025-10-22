const redis = require('redis');

/**
 * Sistema de caching con Redis
 */
class CacheManager {
  constructor(redisConfig) {
    const redisUrl = process.env.REDIS_URL || `redis://${redisConfig.host}:${redisConfig.port}`;
    this.redisClient = redis.createClient({ url: redisUrl });

    this.redisClient.on('error', (err) => {
      console.error('Error de conexión a Redis (cache):', err);
    });

    this.redisClient
      .connect()
      .then(() => {
        console.log('Conexión a Redis (cache) establecida correctamente');
      })
      .catch((err) => {
        console.error('Error conectando a Redis (cache):', err);
      });
  }

  /**
   * Obtener valor del cache
   * @param {string} key - Clave del cache
   * @returns {any} Valor del cache o null
   */
  async get(key) {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error obteniendo valor del cache para clave ${key}:`, error);
      return null;
    }
  }

  /**
   * Guardar valor en el cache
   * @param {string} key - Clave del cache
   * @param {any} value - Valor a guardar
   * @param {number} ttl - Tiempo de vida en segundos (opcional)
   */
  async set(key, value, ttl = 3600) {
    try {
      const valueString = JSON.stringify(value);
      if (ttl) {
        await this.redisClient.set(key, valueString, { EX: ttl });
      } else {
        await this.redisClient.set(key, valueString);
      }
    } catch (error) {
      console.error(`Error guardando valor en cache para clave ${key}:`, error);
    }
  }

  /**
   * Eliminar valor del cache
   * @param {string} key - Clave del cache
   */
  async delete(key) {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error(`Error eliminando valor del cache para clave ${key}:`, error);
    }
  }

  /**
   * Limpiar todas las claves que coincidan con un patrón
   * @param {string} pattern - Patrón de claves a limpiar
   */
  async clearPattern(pattern) {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Error limpiando claves con patrón ${pattern}:`, error);
    }
  }

  /**
   * Crear middleware de caching para Express
   * @param {string} keyGenerator - Función para generar clave de cache
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {function} Middleware de Express
   */
  createMiddleware(keyGenerator, ttl = 3600) {
    return async (req, res, next) => {
      try {
        // Generar clave de cache
        const key =
          typeof keyGenerator === 'function'
            ? keyGenerator(req)
            : `${req.method}:${req.originalUrl}`;

        // Intentar obtener del cache
        const cachedValue = await this.get(key);

        if (cachedValue) {
          // Devolver valor del cache
          return res.status(200).json(cachedValue);
        }

        // Sobreescribir res.json para guardar en cache
        const originalJson = res.json;
        res.json = (body) => {
          // Guardar en cache
          this.set(key, body, ttl);
          // Llamar al método original
          return originalJson.call(res, body);
        };

        next();
      } catch (error) {
        console.error('Error en middleware de cache:', error);
        next();
      }
    };
  }

  /**
   * Cerrar conexión a Redis
   */
  async close() {
    try {
      await this.redisClient.quit();
      console.log('Conexión a Redis (cache) cerrada');
    } catch (error) {
      console.error('Error cerrando conexión a Redis (cache):', error);
    }
  }
}

module.exports = CacheManager;
