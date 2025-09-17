
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Para modificar una tabla en SQLite, necesitamos recrearla
db.serialize(() => {
  // Crear una tabla temporal
  db.run(`CREATE TABLE users_temp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT,
    google_id TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error al crear tabla temporal:', err.message);
      return;
    }
    
    // Copiar datos de la tabla original a la temporal
    db.run(`INSERT INTO users_temp (id, name, email, phone, password, role, created_at)
             SELECT id, name, email, phone, password, role, created_at FROM users`, (err) => {
      if (err) {
        console.error('Error al copiar datos:', err.message);
        return;
      }
      
      // Eliminar la tabla original
      db.run('DROP TABLE users', (err) => {
        if (err) {
          console.error('Error al eliminar tabla original:', err.message);
          return;
        }
        
        // Renombrar la tabla temporal
        db.run('ALTER TABLE users_temp RENAME TO users', (err) => {
          if (err) {
            console.error('Error al renombrar tabla:', err.message);
            return;
          }
          
          console.log('Tabla de usuarios actualizada exitosamente');
        });
      });
    });
  });
});

// Cerrar la conexión
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos:', err.message);
    } else {
      console.log('Base de datos cerrada correctamente');
    }
  });
}, 1000);

