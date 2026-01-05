const { Pool } = require('pg');
const logger = require('../logger.simple');

// Configuración de conexión - Soporta DATABASE_URL o variables individuales
let poolConfig;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL si está disponible (Railway, Heroku, etc.)
  logger.info('📡 Usando DATABASE_URL para conexión a PostgreSQL');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Aumentado a 30 segundos para Railway
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
} else {
  // Usar variables individuales para desarrollo local
  logger.info('📡 Usando variables individuales para conexión a PostgreSQL');
  const config = require('./index');
  poolConfig = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // 10 segundos para local
  };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.info('✅ Conexión a PostgreSQL establecida correctamente', { service: 'user-service' });
});

pool.on('error', (err) => {
  logger.error('❌ Error inesperado en el cliente PostgreSQL', { service: 'user-service', err });
});

// Función de retry con backoff exponencial
const connectWithRetry = async (maxRetries = 5, baseDelay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`📡 Intento ${attempt}/${maxRetries} de conexión a PostgreSQL...`, { service: 'user-service' });
      const result = await pool.query('SELECT NOW()');
      logger.info('✅ Conexión a PostgreSQL establecida correctamente', {
        service: 'user-service',
        attempt,
      });
      return result;
    } catch (error) {
      const delay = baseDelay * Math.pow(2, attempt - 1); // Backoff exponencial
      logger.warn(`⚠️ Intento ${attempt}/${maxRetries} fallido: ${error.message}`, {
        service: 'user-service',
        nextRetryIn: attempt < maxRetries ? `${delay}ms` : 'N/A',
      });
      
      if (attempt === maxRetries) {
        logger.error('❌ Error E004: Todos los intentos de conexión fallaron:', {
          error: error.message,
          stack: error.stack,
        });
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Wrapper para mantener compatibilidad con código existente
const sequelize = {
  client: pool,
  connect: connectWithRetry,
  query: (...args) => pool.query(...args),
  end: () => pool.end(),
};

module.exports = sequelize;
