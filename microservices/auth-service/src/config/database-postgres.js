const { Pool } = require('pg');
require('dotenv').config();

const logger = require('../logger');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'flores_victoria',
  user: process.env.DB_USER || 'flores_user',
  password: process.env.DB_PASSWORD || 'tu_password_segura',
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificar conexión
pool.on('connect', () => {
  logger.info({ service: 'auth-service' }, '✅ Conexión a PostgreSQL establecida correctamente');
});

pool.on('error', (err) => {
  logger.error({ service: 'auth-service', err }, '❌ Error inesperado en el cliente PostgreSQL');
});

// Función para conectar a la base de datos
const connectToDatabase = async () => {
  try {
    logger.info({ service: 'auth-service' }, '🔧 Verificando conexión a PostgreSQL...');
    const client = await pool.connect();
    logger.info({ service: 'auth-service' }, '✅ PostgreSQL client conectado, verificando tabla auth_users...');
    
    // Verificar que la tabla existe
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'auth_users'
    `);
    
    if (result.rows.length > 0) {
      logger.info({ service: 'auth-service' }, '✅ Tabla auth_users verificada correctamente');
    } else {
      logger.warn({ service: 'auth-service' }, '⚠️ Tabla auth_users no encontrada - puede causar errores');
    }
    
    client.release();
    logger.info({ service: 'auth-service' }, '✅ Base de datos PostgreSQL inicializada correctamente');
    return pool;
  } catch (err) {
    logger.error({ service: 'auth-service', err: err.message }, '❌ Error conectando a PostgreSQL');
    throw err;
  }
};

// Exportar pool para queries
module.exports = {
  pool,
  db: pool, // Alias para compatibilidad
  connectToDatabase,
  
  // Helper functions para queries comunes
  query: (text, params) => pool.query(text, params),
  
  getClient: () => pool.connect(),
};
