/**
 * @fileoverview PostgreSQL Connection Pool Avanzado
 * @description Pool de conexiones con health checks, retry y métricas
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { Pool } = require('pg');
const { TIMEOUTS, LIMITS } = require('../constants');

/**
 * Estados del pool
 */
const POOL_STATE = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR',
  DRAINING: 'DRAINING',
};

/**
 * Singleton para pool de PostgreSQL
 */
class PostgresPool {
  static instance = null;
  static connectionPromise = null;

  /**
   * @param {Object} options - Opciones de configuración
   */
  constructor(options = {}) {
    this.options = {
      host: options.host || process.env.POSTGRES_HOST || 'localhost',
      port: Number.parseInt(options.port || process.env.POSTGRES_PORT || '5432', 10),
      database: options.database || process.env.POSTGRES_DB || 'flores_victoria',
      user: options.user || process.env.POSTGRES_USER || 'postgres',
      password: options.password || process.env.POSTGRES_PASSWORD,
      min: options.min || LIMITS.DB_POOL_MIN,
      max: options.max || LIMITS.DB_POOL_MAX,
      idleTimeoutMillis: options.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: options.connectionTimeoutMillis || TIMEOUTS.DATABASE_CONNECTION,
      statement_timeout: options.statementTimeout || TIMEOUTS.DATABASE_QUERY,
      application_name: options.applicationName || process.env.SERVICE_NAME || 'flores-victoria',
    };

    this.pool = null;
    this.state = POOL_STATE.DISCONNECTED;
    this.healthCheckInterval = null;
    this.retryAttempts = 0;
    this.maxRetries = options.maxRetries || 5;
    this.retryDelay = options.retryDelay || 2000;

    // Métricas
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      successfulQueries: 0,
      failedQueries: 0,
      healthChecksPassed: 0,
      healthChecksFailed: 0,
      lastHealthCheck: null,
      lastError: null,
    };
  }

  /**
   * Obtiene la instancia singleton
   * @param {Object} options - Opciones de configuración
   * @returns {PostgresPool}
   */
  static getInstance(options = {}) {
    if (!PostgresPool.instance) {
      PostgresPool.instance = new PostgresPool(options);
    }
    return PostgresPool.instance;
  }

  /**
   * Conecta al pool de PostgreSQL
   * @returns {Promise<Pool>}
   */
  async connect() {
    if (this.state === POOL_STATE.CONNECTED && this.pool) {
      return this.pool;
    }

    if (PostgresPool.connectionPromise) {
      return PostgresPool.connectionPromise;
    }

    PostgresPool.connectionPromise = this._createPool();
    return PostgresPool.connectionPromise;
  }

  /**
   * Crea el pool de conexiones
   * @private
   */
  async _createPool() {
    this.state = POOL_STATE.CONNECTING;

    try {
      this.pool = new Pool(this.options);

      // Event handlers
      this.pool.on('connect', (client) => {
        this.metrics.totalConnections++;
        console.info('[PostgresPool] Client connected');
      });

      this.pool.on('acquire', () => {
        this.metrics.activeConnections++;
        this._updatePoolMetrics();
      });

      this.pool.on('release', () => {
        this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
        this._updatePoolMetrics();
      });

      this.pool.on('error', (err, client) => {
        this.metrics.lastError = err.message;
        console.error('[PostgresPool] Unexpected error:', err.message);
      });

      this.pool.on('remove', () => {
        this.metrics.totalConnections = Math.max(0, this.metrics.totalConnections - 1);
      });

      // Verificar conexión inicial
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      this.state = POOL_STATE.CONNECTED;
      this.retryAttempts = 0;
      console.info('[PostgresPool] Connected successfully');

      // Iniciar health checks
      this._startHealthChecks();

      return this.pool;
    } catch (error) {
      this.state = POOL_STATE.ERROR;
      this.metrics.lastError = error.message;
      console.error('[PostgresPool] Connection failed:', error.message);

      // Retry logic
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        console.info(
          `[PostgresPool] Retrying connection (${this.retryAttempts}/${this.maxRetries})...`
        );
        await this._delay(this.retryDelay * this.retryAttempts);
        PostgresPool.connectionPromise = null;
        return this.connect();
      }

      throw error;
    }
  }

  /**
   * Ejecuta una query con reintentos
   * @param {string} text - Query SQL
   * @param {Array} params - Parámetros
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>}
   */
  async query(text, params = [], options = {}) {
    const pool = await this.connect();
    const maxRetries = options.retries || 1;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const start = Date.now();
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        this.metrics.successfulQueries++;

        // Log queries lentas
        if (duration > 1000) {
          console.warn(`[PostgresPool] Slow query (${duration}ms):`, text.substring(0, 100));
        }

        return result;
      } catch (error) {
        lastError = error;
        this.metrics.failedQueries++;
        this.metrics.lastError = error.message;

        // Determinar si es recuperable
        if (this._isRecoverableError(error) && attempt < maxRetries) {
          console.warn(
            `[PostgresPool] Query failed, retrying (${attempt}/${maxRetries}):`,
            error.message
          );
          await this._delay(100 * attempt);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Ejecuta una transacción
   * @param {Function} callback - Función que recibe el client
   * @returns {Promise<*>}
   */
  async transaction(callback) {
    const pool = await this.connect();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verifica si un error es recuperable
   * @private
   */
  _isRecoverableError(error) {
    const recoverableCodes = [
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      '40001', // serialization_failure
      '40P01', // deadlock_detected
    ];
    return recoverableCodes.includes(error.code);
  }

  /**
   * Inicia health checks periódicos
   * @private
   */
  _startHealthChecks() {
    if (this.healthCheckInterval) {
      return;
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.healthCheck();
    }, TIMEOUTS.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Ejecuta un health check
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    try {
      const start = Date.now();
      await this.query('SELECT 1', [], { retries: 1 });
      const latency = Date.now() - start;

      this.metrics.healthChecksPassed++;
      this.metrics.lastHealthCheck = {
        status: 'healthy',
        latency,
        timestamp: new Date().toISOString(),
      };

      return { healthy: true, latency };
    } catch (error) {
      this.metrics.healthChecksFailed++;
      this.metrics.lastHealthCheck = {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      console.error('[PostgresPool] Health check failed:', error.message);
      return { healthy: false, error: error.message };
    }
  }

  /**
   * Actualiza métricas del pool
   * @private
   */
  _updatePoolMetrics() {
    if (this.pool) {
      this.metrics.idleConnections = this.pool.idleCount || 0;
      this.metrics.waitingRequests = this.pool.waitingCount || 0;
    }
  }

  /**
   * Cierra el pool de conexiones
   * @returns {Promise<void>}
   */
  async close() {
    this.state = POOL_STATE.DRAINING;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }

    this.state = POOL_STATE.DISCONNECTED;
    PostgresPool.instance = null;
    PostgresPool.connectionPromise = null;

    console.info('[PostgresPool] Pool closed');
  }

  /**
   * Obtiene métricas del pool
   * @returns {Object}
   */
  getMetrics() {
    this._updatePoolMetrics();
    return {
      ...this.metrics,
      state: this.state,
      poolSize: this.pool?.totalCount || 0,
    };
  }

  /**
   * Verifica si está conectado
   * @returns {boolean}
   */
  isConnected() {
    return this.state === POOL_STATE.CONNECTED;
  }

  /**
   * Helper para delay
   * @private
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Wrapper para compatibilidad con código existente
 */
const db = {
  async query(text, params = []) {
    return PostgresPool.getInstance().query(text, params);
  },

  async transaction(callback) {
    return PostgresPool.getInstance().transaction(callback);
  },

  async connect() {
    return PostgresPool.getInstance().connect();
  },

  async close() {
    return PostgresPool.getInstance().close();
  },

  getPool() {
    return PostgresPool.getInstance();
  },
};

module.exports = {
  PostgresPool,
  db,
  POOL_STATE,
};
