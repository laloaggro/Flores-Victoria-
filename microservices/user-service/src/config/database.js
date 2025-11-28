const { Pool } = require('pg');
const logger = require('../logger');

// Configuración de conexión - Soporta DATABASE_URL o variables individuales
let poolConfig;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL si está disponible (Railway, Heroku, etc.)
  logger.info('📡 Usando DATABASE_URL para conexión a PostgreSQL');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
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
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  logger.info('✅ Conexión a PostgreSQL establecida correctamente');
});

pool.on('error', (err) => {
  logger.error('❌ Error inesperado en el cliente PostgreSQL', { err });
});

module.exports = pool;
