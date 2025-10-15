const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Configuración de la base de datos PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'flores_db',
  user: process.env.DB_USER || 'flores_user',
  password: process.env.DB_PASSWORD || 'flores_password',
};

// Crear pool de conexiones
const pool = new Pool(dbConfig);

// Función para conectar a la base de datos
const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
    
    // Inicializar base de datos
    await initializeDatabase();
    return pool;
  } catch (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    throw err;
  }
};

// Inicializar base de datos
const initializeDatabase = async () => {
  let client;
  try {
    client = await pool.connect();
    
    // Crear tabla de usuarios con campos para autenticación social si no existe
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT,
        provider VARCHAR(50),
        provider_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client.query(createUsersTable);
    console.log('✅ Tabla de usuarios verificada/creada correctamente');
    
    // Crear índices si no existen
    try {
      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      console.log('✅ Índice de email verificado/creado correctamente');
    } catch (err) {
      console.log('ℹ️  Índice de email ya existe o no se puede crear');
    }
    
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id)');
      console.log('✅ Índice de proveedor verificado/creado correctamente');
    } catch (err) {
      console.log('ℹ️  Índice de proveedor ya existe o no se puede crear');
    }
    
    client.release();
  } catch (err) {
    if (client) client.release();
    console.error('❌ Error inicializando base de datos:', err.message);
    throw err;
  }
};

// Cerrar la conexión a la base de datos
const closeDatabase = async () => {
  try {
    await pool.end();
    console.log('✅ Conexión a la base de datos cerrada correctamente');
  } catch (err) {
    console.error('❌ Error cerrando la base de datos:', err.message);
  }
};

module.exports = {
  db: pool,
  connectToDatabase,
  closeDatabase
};