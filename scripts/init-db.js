const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos de usuarios
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos de usuarios');
  }
});

// Crear la tabla de usuarios si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    google_id TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla de usuarios:', err.message);
    } else {
      console.log('Tabla de usuarios verificada o creada');
    }
  });
  
  // Crear la tabla de registros de inicio de sesión
  db.run(`CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    login_method TEXT NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla de registros de inicio de sesión:', err.message);
    } else {
      console.log('Tabla de registros de inicio de sesión verificada o creada');
    }
  });
  
  // Crear la tabla de carrito
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla de carrito:', err.message);
    } else {
      console.log('Tabla de carrito verificada o creada');
    }
  });
  
  // Crear la tabla de lista de deseos
  db.run(`CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla de lista de deseos:', err.message);
    } else {
      console.log('Tabla de lista de deseos verificada o creada');
    }
  });
  
  // Crear un usuario administrador por defecto si no existe ninguno
  db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
    if (!err && row.count === 0) {
      const bcrypt = require('bcrypt');
      const defaultAdminPassword = 'admin123';
      bcrypt.hash(defaultAdminPassword, 10, (err, hashedPassword) => {
        if (!err) {
          db.run(`INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
            ['Administrador', 'admin@arreglosvictoria.com', '+56963603177', hashedPassword, 'admin'],
            (err) => {
              if (err) {
                console.error('Error al crear usuario administrador:', err.message);
              } else {
                console.log('Usuario administrador creado por defecto');
              }
            }
          );
        }
      });
    }
  });
});

// Conectar a la base de datos de productos
const productsDbPath = path.join(__dirname, 'products.db');
const productsDb = new sqlite3.Database(productsDbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos de productos:', err.message);
  } else {
    console.log('Conectado a la base de datos de productos');
  }
});

// Crear la tabla de productos si no existe
productsDb.serialize(() => {
  productsDb.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla de productos:', err.message);
    } else {
      console.log('Tabla de productos verificada o creada');
    }
  });
  
  // Crear la tabla de reseñas
  productsDb.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla de reseñas:', err.message);
    } else {
      console.log('Tabla de reseñas verificada o creada');
    }
  });
});

// Cerrar las conexiones a las bases de datos
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos de usuarios:', err.message);
    } else {
      console.log('Base de datos de usuarios cerrada');
    }
  });
  
  productsDb.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos de productos:', err.message);
    } else {
      console.log('Base de datos de productos cerrada');
    }
  });
}, 1000);