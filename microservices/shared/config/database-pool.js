/**
 * @fileoverview Centralized Database Connection Pool Configuration
 * @description Configuración optimizada de pools de conexión para PostgreSQL y MongoDB
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Configuración de PostgreSQL Pool
 * 
 * Fórmulas de optimización:
 * - connections = (cores * 2) + effective_spindle_count
 * - Para SSDs: spindle = 1
 * - Para Node.js single-threaded: valores conservadores
 */
const postgresPoolConfig = {
  /**
   * Obtiene configuración optimizada según el entorno
   * @param {Object} options - Opciones de configuración
   * @param {string} options.serviceName - Nombre del servicio
   * @param {string} [options.connectionString] - URI de conexión (opcional)
   * @returns {Object} Configuración del pool
   */
  getConfig(options = {}) {
    const { serviceName = 'unknown' } = options;
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

    // Tamaños de pool según entorno
    const poolSizes = {
      production: {
        max: 20,      // Máximo para alta carga
        min: 5,       // Mínimo para warm connections
      },
      development: {
        max: 10,
        min: 2,
      },
      test: {
        max: 5,
        min: 1,
      },
    };

    const env = process.env.NODE_ENV || 'development';
    const sizes = poolSizes[env] || poolSizes.development;

    const baseConfig = {
      // Tamaño del pool (configurable por env vars)
      max: Number.parseInt(process.env.DB_POOL_MAX, 10) || sizes.max,
      min: Number.parseInt(process.env.DB_POOL_MIN, 10) || sizes.min,

      // Timeouts
      idleTimeoutMillis: Number.parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
      connectionTimeoutMillis: Number.parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || (isProduction ? 60000 : 10000),
      
      // Statement timeout para evitar queries lentas
      statement_timeout: Number.parseInt(process.env.DB_STATEMENT_TIMEOUT, 10) || 30000,

      // Permitir salir cuando no hay conexiones activas
      allowExitOnIdle: true,

      // Manejo de errores
      application_name: `flores-victoria-${serviceName}`,
    };

    // Si hay DATABASE_URL, usarla
    if (process.env.DATABASE_URL) {
      const dbUrl = process.env.DATABASE_URL;
      const isInternalConnection = dbUrl.includes('.railway.internal');
      
      // SSL solo para conexiones externas
      const useSSL = process.env.DB_SSL === 'true' ? true :
                     process.env.DB_SSL === 'false' ? false :
                     !isInternalConnection;

      return {
        connectionString: dbUrl,
        ssl: useSSL ? { rejectUnauthorized: false } : false,
        ...baseConfig,
      };
    }

    // Variables individuales
    return {
      host: process.env.DB_HOST || 'localhost',
      port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'flores_victoria',
      user: process.env.DB_USER || 'flores_user',
      password: process.env.DB_PASSWORD || 'password',
      ...baseConfig,
    };
  },

  /**
   * Crea listeners para eventos del pool
   * @param {Object} pool - Instancia del pool
   * @param {Object} logger - Logger a usar
   * @param {string} serviceName - Nombre del servicio
   */
  attachEventListeners(pool, logger, serviceName) {
    pool.on('connect', () => {
      logger.debug(`[${serviceName}] Nueva conexión PostgreSQL`);
    });

    pool.on('acquire', () => {
      logger.debug(`[${serviceName}] Conexión adquirida del pool`);
    });

    pool.on('release', () => {
      logger.debug(`[${serviceName}] Conexión devuelta al pool`);
    });

    pool.on('remove', () => {
      logger.debug(`[${serviceName}] Conexión removida del pool`);
    });

    pool.on('error', (err) => {
      logger.error(`[${serviceName}] Error en pool PostgreSQL:`, err);
    });
  },
};

/**
 * Configuración de MongoDB Connection Pool
 */
const mongoPoolConfig = {
  /**
   * Obtiene configuración optimizada de MongoDB
   * @param {Object} options - Opciones
   * @param {string} options.serviceName - Nombre del servicio
   * @returns {Object} Opciones de conexión de MongoDB
   */
  getConfig(options = {}) {
    const { serviceName = 'unknown' } = options;
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      // Pool sizing
      maxPoolSize: Number.parseInt(process.env.MONGO_POOL_MAX, 10) || (isProduction ? 50 : 10),
      minPoolSize: Number.parseInt(process.env.MONGO_POOL_MIN, 10) || (isProduction ? 5 : 2),

      // Timeouts
      connectTimeoutMS: Number.parseInt(process.env.MONGO_CONNECT_TIMEOUT, 10) || 10000,
      socketTimeoutMS: Number.parseInt(process.env.MONGO_SOCKET_TIMEOUT, 10) || 45000,
      serverSelectionTimeoutMS: Number.parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT, 10) || 30000,

      // Retry
      retryWrites: true,
      retryReads: true,

      // Compresión (reduce bandwidth)
      compressors: ['zstd', 'snappy', 'zlib'],

      // Nombre de la app para monitoreo
      appName: `flores-victoria-${serviceName}`,

      // Write concern para durabilidad
      writeConcern: {
        w: isProduction ? 'majority' : 1,
        j: isProduction,
      },

      // Read concern
      readConcern: {
        level: isProduction ? 'majority' : 'local',
      },
    };
  },

  /**
   * Obtiene la URI de conexión
   * @returns {string} MongoDB URI
   */
  getUri() {
    return process.env.MONGODB_URI || 
           process.env.MONGO_URI || 
           'mongodb://localhost:27017';
  },

  /**
   * Obtiene el nombre de la base de datos
   * @returns {string} Nombre de la DB
   */
  getDbName() {
    return process.env.MONGODB_DB || 
           process.env.MONGO_DB || 
           'flores_victoria';
  },
};

/**
 * Configuración de Redis/Valkey Connection Pool
 */
const redisPoolConfig = {
  /**
   * Obtiene configuración de Redis
   * @param {Object} options - Opciones
   * @param {string} options.serviceName - Nombre del servicio
   * @returns {Object} Configuración de Redis
   */
  getConfig(options = {}) {
    const { serviceName = 'unknown' } = options;
    const isProduction = process.env.NODE_ENV === 'production';

    // Parsear REDIS_URL si existe
    const redisUrl = process.env.REDIS_URL || process.env.VALKEY_URL;
    
    if (redisUrl) {
      return {
        url: redisUrl,
        // Opciones adicionales
        socket: {
          connectTimeout: 10000,
          keepAlive: 5000,
        },
        name: `flores-victoria-${serviceName}`,
      };
    }

    return {
      socket: {
        host: process.env.REDIS_HOST || process.env.VALKEY_HOST || 'localhost',
        port: Number.parseInt(process.env.REDIS_PORT || process.env.VALKEY_PORT || '6379', 10),
        connectTimeout: 10000,
        keepAlive: 5000,
      },
      password: process.env.REDIS_PASSWORD || process.env.VALKEY_PASSWORD || undefined,
      database: Number.parseInt(process.env.REDIS_DB || '0', 10),
      name: `flores-victoria-${serviceName}`,

      // Retry strategy
      retryStrategy: (times) => {
        if (times > 10) {
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Exponential backoff, max 3s
      },
    };
  },
};

/**
 * Health check para todas las conexiones
 */
const healthChecks = {
  /**
   * Verifica conexión PostgreSQL
   * @param {Object} pool - Pool de PostgreSQL
   * @returns {Promise<Object>} Estado de salud
   */
  async postgres(pool) {
    const start = Date.now();
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      return {
        status: 'healthy',
        latency: Date.now() - start,
        poolSize: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        latency: Date.now() - start,
      };
    }
  },

  /**
   * Verifica conexión MongoDB
   * @param {Object} client - Cliente de MongoDB
   * @returns {Promise<Object>} Estado de salud
   */
  async mongo(client) {
    const start = Date.now();
    try {
      await client.db().admin().ping();
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        latency: Date.now() - start,
      };
    }
  },

  /**
   * Verifica conexión Redis
   * @param {Object} client - Cliente de Redis
   * @returns {Promise<Object>} Estado de salud
   */
  async redis(client) {
    const start = Date.now();
    try {
      await client.ping();
      return {
        status: 'healthy',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        latency: Date.now() - start,
      };
    }
  },
};

module.exports = {
  postgresPoolConfig,
  mongoPoolConfig,
  redisPoolConfig,
  healthChecks,
};
