/**
 * @fileoverview Redis Connection Pool Singleton
 * @description Gestión centralizada de conexiones Redis
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const Redis = require('ioredis');

/**
 * Singleton para gestión de conexiones Redis
 */
class RedisPool {
  static instance = null;
  static connectionPromise = null;

  /**
   * Obtiene la instancia singleton del cliente Redis
   * @param {Object} options - Opciones adicionales de configuración
   * @returns {Redis|null} Cliente Redis o null si está deshabilitado
   */
  static getInstance(options = {}) {
    // Si Redis está explícitamente deshabilitado
    if (process.env.DISABLE_REDIS === 'true' || process.env.USE_REDIS === 'false') {
      return null;
    }

    // Retornar instancia existente si está lista
    if (RedisPool.instance && RedisPool.instance.status === 'ready') {
      return RedisPool.instance;
    }

    // Crear nueva instancia si no existe
    if (!RedisPool.instance) {
      RedisPool.instance = RedisPool.createClient(options);
    }

    return RedisPool.instance;
  }

  /**
   * Crea un nuevo cliente Valkey con configuración optimizada
   * @param {Object} options - Opciones de configuración
   * @returns {Redis} Cliente Valkey configurado
   */
  static createClient(options = {}) {
    let client;

    // Railway proporciona VALKEY_URL
    const cacheUrl = process.env.VALKEY_URL;
    if (cacheUrl) {
      client = new Redis(cacheUrl, {
        ...RedisPool.getDefaultConfig(),
        ...options,
      });
    } else {
      // Configuración tradicional
      client = new Redis({
        host: options.host || process.env.VALKEY_HOST || 'localhost',
        port: options.port || process.env.VALKEY_PORT || 6379,
        password: options.password || process.env.VALKEY_PASSWORD,
        db: options.db || process.env.VALKEY_DB || 0,
        ...RedisPool.getDefaultConfig(),
        ...options,
      });
    }

    // Event handlers
    let errorLogged = false;

    client.on('connect', () => {
      console.info('[ValkeyPool] Connected successfully');
      errorLogged = false;
    });

    client.on('ready', () => {
      console.info('[ValkeyPool] Ready to accept commands');
    });

    client.on('error', (err) => {
      if (!errorLogged) {
        console.error('[RedisPool] Connection error:', err.message);
        errorLogged = true;
      }
    });

    client.on('close', () => {
      console.warn('[RedisPool] Connection closed');
    });

    client.on('reconnecting', (delay) => {
      console.info(`[RedisPool] Reconnecting in ${delay}ms`);
    });

    return client;
  }

  /**
   * Configuración por defecto optimizada para microservicios
   * @returns {Object} Configuración
   */
  static getDefaultConfig() {
    return {
      // Reconexión
      retryStrategy: (times) => {
        if (times > 10) {
          console.error('[RedisPool] Max retries reached, giving up');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      maxRetriesPerRequest: 3,

      // Connection pooling
      lazyConnect: true,
      keepAlive: 10000,
      connectTimeout: 10000,
      family: 4,

      // Performance
      enableReadyCheck: true,
      enableOfflineQueue: true,
      autoResubscribe: true,
      autoResendUnfulfilledCommands: true,

      // Comandos
      commandTimeout: 5000,
    };
  }

  /**
   * Conecta el cliente (lazy connection)
   * @returns {Promise<Redis>}
   */
  static async connect() {
    const client = RedisPool.getInstance();
    if (!client) {
      return null;
    }

    if (client.status === 'ready') {
      return client;
    }

    if (!RedisPool.connectionPromise) {
      RedisPool.connectionPromise = client.connect().catch((err) => {
        console.error('[RedisPool] Failed to connect:', err.message);
        RedisPool.connectionPromise = null;
        return null;
      });
    }

    return RedisPool.connectionPromise;
  }

  /**
   * Desconecta el cliente
   * @returns {Promise<void>}
   */
  static async disconnect() {
    if (RedisPool.instance) {
      await RedisPool.instance.quit();
      RedisPool.instance = null;
      RedisPool.connectionPromise = null;
      console.info('[RedisPool] Disconnected');
    }
  }

  /**
   * Verifica si Redis está conectado y funcional
   * @returns {Promise<boolean>}
   */
  static async isHealthy() {
    try {
      const client = RedisPool.getInstance();
      if (!client || client.status !== 'ready') {
        return false;
      }
      const pong = await client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Obtiene métricas del cliente
   * @returns {Object} Métricas de conexión
   */
  static getMetrics() {
    const client = RedisPool.instance;
    if (!client) {
      return { connected: false };
    }

    return {
      connected: client.status === 'ready',
      status: client.status,
      commandQueueLength: client.commandQueue?.length || 0,
      offlineQueueLength: client.offlineQueue?.length || 0,
    };
  }

  /**
   * Wrapper para operaciones con fallback
   * @param {Function} operation - Operación Redis async
   * @param {*} fallback - Valor de fallback
   * @returns {Promise<*>}
   */
  static async withFallback(operation, fallback = null) {
    try {
      const client = RedisPool.getInstance();
      if (!client || client.status !== 'ready') {
        return fallback;
      }
      return await operation(client);
    } catch (error) {
      console.warn('[RedisPool] Operation failed, using fallback:', error.message);
      return fallback;
    }
  }
}

// Cache helper usando el pool
const cacheHelper = {
  /**
   * Obtiene un valor de cache
   * @param {string} key - Clave
   * @returns {Promise<*>}
   */
  async get(key) {
    return RedisPool.withFallback(async (client) => {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    }, null);
  },

  /**
   * Guarda un valor en cache
   * @param {string} key - Clave
   * @param {*} value - Valor
   * @param {number} ttlSeconds - TTL en segundos
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttlSeconds = 300) {
    return RedisPool.withFallback(async (client) => {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    }, false);
  },

  /**
   * Elimina una clave
   * @param {string} key - Clave
   * @returns {Promise<boolean>}
   */
  async del(key) {
    return RedisPool.withFallback(async (client) => {
      await client.del(key);
      return true;
    }, false);
  },

  /**
   * Elimina claves por patrón
   * @param {string} pattern - Patrón (ej: "products:*")
   * @returns {Promise<number>} Número de claves eliminadas
   */
  async delByPattern(pattern) {
    return RedisPool.withFallback(async (client) => {
      const keys = await client.keys(pattern);
      if (keys.length === 0) return 0;
      return await client.del(...keys);
    }, 0);
  },

  /**
   * Incrementa un contador
   * @param {string} key - Clave
   * @param {number} ttlSeconds - TTL opcional
   * @returns {Promise<number>}
   */
  async incr(key, ttlSeconds = null) {
    return RedisPool.withFallback(async (client) => {
      const value = await client.incr(key);
      if (ttlSeconds && value === 1) {
        await client.expire(key, ttlSeconds);
      }
      return value;
    }, 0);
  },
};

module.exports = {
  RedisPool,
  cacheHelper,
};
