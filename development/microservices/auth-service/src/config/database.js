const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Crear directorio para la base de datos si no existe
const dbDir = path.resolve(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Directorio de base de datos creado:', dbDir);
  } catch (err) {
    console.error('Error creando directorio de base de datos:', err);
  }
}

// Configuración de la base de datos SQLite
const dbPath = path.resolve(__dirname, '../../db/auth.db');

// Variable para almacenar la instancia de la base de datos
let dbInstance = null;

// Función para obtener la instancia de la base de datos
const getDatabaseInstance = () => {
  if (!dbInstance) {
    try {
      // Usar modo verbose para mejor manejo de errores
      dbInstance = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          console.error('❌ Error abriendo la base de datos:', err.message);
        } else {
          console.log('✅ Conexión a SQLite establecida correctamente');
          // Configurar cierre automático cuando el proceso se detenga
          process.on('exit', () => {
            if (dbInstance) {
              dbInstance.close();
            }
          });
        }
      });
      
      // Manejar señales para cerrar la base de datos correctamente
      process.on('SIGINT', () => {
        if (dbInstance) {
          dbInstance.close(() => {
            console.log('Base de datos cerrada correctamente por SIGINT');
            process.exit(0);
          });
        }
      });
      
      process.on('SIGTERM', () => {
        if (dbInstance) {
          dbInstance.close(() => {
            console.log('Base de datos cerrada correctamente por SIGTERM');
            process.exit(0);
          });
        }
      });
    } catch (err) {
      console.error('❌ Error creando instancia de base de datos:', err.message);
      return null;
    }
  }
  return dbInstance;
};

// Función para conectar a la base de datos
const connectToDatabase = async () => {
  return new Promise((resolve, reject) => {
    const db = getDatabaseInstance();
    
    if (db) {
      // Crear tablas si no existen
      initializeDatabase(db)
        .then(() => {
          console.log('✅ Base de datos inicializada correctamente');
          resolve(db);
        })
        .catch((err) => {
          console.error('❌ Error inicializando base de datos:', err);
          reject(err);
        });
    } else {
      reject(new Error('No se pudo establecer conexión con la base de datos'));
    }
  });
};

// Inicializar base de datos
const initializeDatabase = async (db) => {
  return new Promise((resolve, reject) => {
    // Crear tabla de usuarios con campos para autenticación social
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        provider TEXT,
        provider_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createUsersTable, (err) => {
      if (err) {
        console.error('❌ Error creando tabla de usuarios:', err.message);
        reject(err);
      } else {
        console.log('✅ Tabla de usuarios verificada/creada correctamente');
        
        // Crear índices
        const createEmailIndex = 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)';
        const createProviderIndex = 'CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id)';
        
        db.run(createEmailIndex, (err) => {
          if (err) {
            console.error('❌ Error creando índice de email:', err.message);
            // No rechazar la promesa por errores en índices
            console.log('⚠️  Continuando sin índice de email');
          }
          
          db.run(createProviderIndex, (err) => {
            if (err) {
              console.error('❌ Error creando índice de proveedor:', err.message);
              // No rechazar la promesa por errores en índices
              console.log('⚠️  Continuando sin índice de proveedor');
            }
            
            console.log('✅ Base de datos inicializada correctamente');
            resolve();
          });
        });
      }
    });
  });
};

// Función para cerrar la base de datos
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      dbInstance.close((err) => {
        if (err) {
          console.error('❌ Error cerrando la base de datos:', err.message);
          reject(err);
        } else {
          console.log('✅ Base de datos cerrada correctamente');
          dbInstance = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

// Exportar la instancia de la base de datos y funciones
const db = getDatabaseInstance();

module.exports = {
  db,
  connectToDatabase,
  getDatabaseInstance,
  closeDatabase
};