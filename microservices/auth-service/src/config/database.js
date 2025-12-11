const { Pool } = require('pg');
require('dotenv').config();

const logger = require('../logger.simple');

// Configuración de la conexión a PostgreSQL
// Prioridad: DATABASE_URL (Railway/Cloud) > Variables individuales > Defaults locales
let poolConfig;

if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL si está disponible (Railway, Heroku, etc.)
  logger.info('📡 Usando DATABASE_URL para conexión a PostgreSQL', { service: 'auth-service' });
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Usar variables individuales para desarrollo local
  logger.info('📡 Usando variables individuales para conexión a PostgreSQL', {
    service: 'auth-service',
  });
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'flores_victoria',
    user: process.env.DB_USER || 'flores_user',
    password: process.env.DB_PASSWORD || 'tu_password_segura',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

// Verificar conexión
pool.on('connect', () => {
  logger.info('✅ Conexión a PostgreSQL establecida correctamente', { service: 'auth-service' });
});

pool.on('error', (err) => {
  logger.error('❌ Error inesperado en el cliente PostgreSQL', { service: 'auth-service', err });
});

// Función para conectar a la base de datos
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
    });
    return pool;
  } catch (err) {
    logger.error('❌ Error conectando a PostgreSQL', { service: 'auth-service', err: err.message });
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
