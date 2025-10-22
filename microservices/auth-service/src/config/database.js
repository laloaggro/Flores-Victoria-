const fs = require('fs');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Crear directorio para la base de datos si no existe
const dbDir = path.resolve(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Configuración de la base de datos SQLite
const dbPath = path.resolve(__dirname, '../../db/auth.db');

// Crear base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error abriendo la base de datos:', err.message);
  } else {
    console.log('✅ Conexión a SQLite establecida correctamente');
  }
});

// Función para conectar a la base de datos
const connectToDatabase = async () =>
  new Promise((resolve, reject) => {
    // Crear tablas si no existen
    initializeDatabase()
      .then(() => {
        console.log('✅ Base de datos inicializada correctamente');
        resolve(db);
      })
      .catch(reject);
  });

// Inicializar base de datos
const initializeDatabase = async () =>
  new Promise((resolve, reject) => {
    // Crear tabla de usuarios con campos para autenticación social
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createUsersTable, (err) => {
      if (err) {
        console.error('❌ Error creando tabla de usuarios:', err.message);
        reject(err);
      } else {
        console.log('✅ Tabla de usuarios verificada/creada correctamente');

        // Add columns sequentially and then create indexes
        addProviderColumn()
          .then(() => addProviderIdColumn())
          .then(() => addUpdatedAtColumn())
          .then(() => createEmailIndex())
          .then(() => createProviderIndex())
          .then(() => resolve())
          .catch((error) => {
            console.error('Error en inicialización de base de datos:', error);
            reject(error);
          });
      }
    });
  });

// Add provider column
const addProviderColumn = () =>
  new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(users)', [], (err, columns) => {
      if (err) {
        reject(err);
        return;
      }

      const columnNames = columns.map((col) => col.name);
      if (!columnNames.includes('provider')) {
        const addColumnQuery = `ALTER TABLE users ADD COLUMN provider TEXT`;
        db.run(addColumnQuery, (err) => {
          if (err) {
            console.error('❌ Error añadiendo columna provider:', err.message);
            reject(err);
          } else {
            console.log('✅ Columna provider añadida correctamente');
            resolve();
          }
        });
      } else {
        console.log('✅ Columna provider ya existe');
        resolve();
      }
    });
  });

// Add provider_id column
const addProviderIdColumn = () =>
  new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(users)', [], (err, columns) => {
      if (err) {
        reject(err);
        return;
      }

      const columnNames = columns.map((col) => col.name);
      if (!columnNames.includes('provider_id')) {
        const addColumnQuery = `ALTER TABLE users ADD COLUMN provider_id TEXT`;
        db.run(addColumnQuery, (err) => {
          if (err) {
            console.error('❌ Error añadiendo columna provider_id:', err.message);
            reject(err);
          } else {
            console.log('✅ Columna provider_id añadida correctamente');
            resolve();
          }
        });
      } else {
        console.log('✅ Columna provider_id ya existe');
        resolve();
      }
    });
  });

// Add updated_at column
const addUpdatedAtColumn = () =>
  new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(users)', [], (err, columns) => {
      if (err) {
        reject(err);
        return;
      }

      const columnNames = columns.map((col) => col.name);
      if (!columnNames.includes('updated_at')) {
        const addColumnQuery = `ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`;
        db.run(addColumnQuery, (err) => {
          if (err) {
            console.error('❌ Error añadiendo columna updated_at:', err.message);
            reject(err);
          } else {
            console.log('✅ Columna updated_at añadida correctamente');
            resolve();
          }
        });
      } else {
        console.log('✅ Columna updated_at ya existe');
        resolve();
      }
    });
  });

// Create email index
const createEmailIndex = () =>
  new Promise((resolve, reject) => {
    const createEmailIndexQuery =
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)';

    db.run(createEmailIndexQuery, (err) => {
      if (err) {
        console.error('❌ Error creando índice de email:', err.message);
        reject(err);
      } else {
        console.log('✅ Índice de email verificado/creado correctamente');
        resolve();
      }
    });
  });

// Create provider index
const createProviderIndex = () =>
  new Promise((resolve, reject) => {
    // Check if provider column exists before creating index
    db.all('PRAGMA table_info(users)', [], (err, columns) => {
      if (err) {
        console.error('❌ Error obteniendo información de tabla:', err.message);
        reject(err);
        return;
      }

      const columnNames = columns.map((col) => col.name);
      if (columnNames.includes('provider')) {
        const createProviderIndexQuery =
          'CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id)';

        db.run(createProviderIndexQuery, (err) => {
          if (err) {
            console.error('❌ Error creando índice de proveedor:', err.message);
            reject(err);
          } else {
            console.log('✅ Índice de proveedor verificado/creado correctamente');
            resolve();
          }
        });
      } else {
        console.log('⚠️ Columna provider no encontrada, omitiendo creación de índice');
        resolve();
      }
    });
  });

// Cerrar la conexión a la base de datos
const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error cerrando la base de datos:', err.message);
    } else {
      console.log('✅ Conexión a la base de datos cerrada correctamente');
    }
  });
};

module.exports = {
  db,
  connectToDatabase,
  closeDatabase,
};
