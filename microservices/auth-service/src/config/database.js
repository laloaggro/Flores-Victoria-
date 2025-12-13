const { Pool } = require('pg');
require('dotenv').config();

const logger = require('../logger.simple');

// ====================================================================
// CONFIGURACIÓN OPTIMIZADA DE CONNECTION POOL
// ====================================================================

/**
 * Determina el número óptimo de conexiones basado en el entorno
 * Fórmula: (núcleos * 2) + spindle_count (para SSDs, spindle = 1)
 * Para Node.js single-threaded, usamos valores conservadores
 */
const getOptimalPoolSize = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  // En producción, más conexiones para manejar carga
  // En desarrollo, menos para no agotar recursos
  return isProduction ? 20 : 10;
};

/**
 * Configuración del pool con valores optimizados
 */
const getPoolConfig = () => {
  const baseConfig = {
    // Tamaño del pool
    max: parseInt(process.env.DB_POOL_MAX, 10) || getOptimalPoolSize(),
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,

    // Timeouts optimizados
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 5000,

    // Configuración de statements (mejora rendimiento)
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT, 10) || 30000,

    // Permitir exit sin connections activas
    allowExitOnIdle: true,
  };

  // Railway/Cloud: usar DATABASE_URL
  if (process.env.DATABASE_URL) {
    logger.info('📡 Usando DATABASE_URL para conexión a PostgreSQL', { service: 'auth-service' });
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      ...baseConfig,
    };
  }

  // Desarrollo local: usar variables individuales
  logger.info('📡 Usando variables individuales para conexión a PostgreSQL', {
    service: 'auth-service',
  });
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'flores_victoria',
    user: process.env.DB_USER || 'flores_user',
    password: process.env.DB_PASSWORD || 'tu_password_segura',
    ...baseConfig,
  };
};

const poolConfig = getPoolConfig();
const pool = new Pool(poolConfig);

// ====================================================================
// EVENT HANDLERS
// ====================================================================

// Verificar conexión
pool.on('connect', (client) => {
  logger.info('✅ Nueva conexión PostgreSQL establecida', {
    service: 'auth-service',
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  });

  // Configurar cliente individual con timeout de statement
  client.query(`SET statement_timeout = ${poolConfig.statement_timeout || 30000}`);
});

pool.on('acquire', () => {
  logger.debug('📥 Conexión adquirida del pool', {
    service: 'auth-service',
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  });
});

pool.on('release', () => {
  logger.debug('📤 Conexión liberada al pool', {
    service: 'auth-service',
    idleCount: pool.idleCount,
  });
});

pool.on('error', (err, client) => {
  logger.error('❌ Error inesperado en el cliente PostgreSQL', {
    service: 'auth-service',
    err: err.message,
    stack: err.stack,
  });
});

pool.on('remove', () => {
  logger.debug('🗑️ Conexión removida del pool', {
    service: 'auth-service',
    totalCount: pool.totalCount,
  });
});

// ====================================================================
// FUNCIONES DE CONEXIÓN
// ====================================================================

const connectToDatabase = async () => {
  try {
    logger.info('🔧 Verificando conexión a PostgreSQL...', { service: 'auth-service' });
    const client = await pool.connect();
    logger.info('✅ PostgreSQL client conectado, verificando tabla auth_users...', {
      service: 'auth-service',
    });

    // Verificar que la tabla existe
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'auth_users'
    `);

    if (result.rows.length > 0) {
      logger.info('✅ Tabla auth_users verificada correctamente', { service: 'auth-service' });
    } else {
      logger.warn('⚠️ Tabla auth_users no encontrada - puede causar errores', {
        service: 'auth-service',
      });
    }

    client.release();
    logger.info('✅ Base de datos PostgreSQL inicializada correctamente', {
      service: 'auth-service',
      poolSize: pool.totalCount,
    });
    return pool;
  } catch (err) {
    logger.error('❌ Error conectando a PostgreSQL', { service: 'auth-service', err: err.message });
    throw err;
  }
};

/**
 * Obtiene estadísticas del pool de conexiones
 * @returns {Object} Estadísticas del pool
 */
const getPoolStats = () => ({
  total: pool.totalCount,
  idle: pool.idleCount,
  waiting: pool.waitingCount,
  max: poolConfig.max,
  min: poolConfig.min,
});

/**
 * Cierra todas las conexiones del pool (para shutdown graceful)
 */
const closePool = async () => {
  logger.info('🔌 Cerrando pool de conexiones PostgreSQL...', { service: 'auth-service' });
  await pool.end();
  logger.info('✅ Pool de conexiones cerrado', { service: 'auth-service' });
};

// Exportar pool para queries
module.exports = {
  pool,
  db: pool, // Alias para compatibilidad
  connectToDatabase,
  getPoolStats,
  closePool,

  // Helper functions para queries comunes
  query: (text, params) => pool.query(text, params),

  getClient: () => pool.connect(),
};
