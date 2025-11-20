const { Pool } = require('pg');
require('dotenv').config();

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
  console.log('✅ Conexión a PostgreSQL establecida correctamente');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente PostgreSQL:', err);
});

// Función para conectar a la base de datos
const connectToDatabase = async () => {
  try {
    console.log('🔧 Verificando conexión a PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ PostgreSQL client conectado, verificando tabla auth_users...');
    
    // Verificar que la tabla existe
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'auth_users'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Tabla auth_users verificada correctamente');
    } else {
      console.warn('⚠️ Tabla auth_users no encontrada - puede causar errores');
    }
    
    client.release();
    console.log('✅ Base de datos PostgreSQL inicializada correctamente');
    return pool;
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
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
