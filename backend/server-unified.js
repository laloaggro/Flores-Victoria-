const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './flores-victoria.db';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar base de datos SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error conectando a SQLite:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a SQLite:', DB_PATH);
  initializeDatabase();
});

// Inicializar esquema de base de datos
function initializeDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      delivery_address TEXT,
      delivery_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  db.exec(schema, (err) => {
    if (err) {
      console.error('❌ Error creando esquema:', err);
    } else {
      console.log('✅ Esquema de base de datos inicializado');
      seedDatabase();
    }
  });
}

// Seed inicial de datos
function seedDatabase() {
  db.get('SELECT COUNT(*) as count FROM products', async (err, row) => {
    if (err || row.count > 0) return;

    console.log('🌱 Insertando datos de ejemplo...');

    // Hash password para admin
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Insertar usuario admin
    db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [
      'admin@flores-victoria.cl',
      adminPassword,
      'Admin',
      'admin',
    ]);

    // Insertar productos de ejemplo
    const products = [
      [
        'Ramo de Rosas Rojas',
        'Hermoso ramo de 12 rosas rojas frescas',
        25990,
        'ramos',
        '/images/products/rosas-rojas.jpg',
        15,
        1,
      ],
      [
        'Bouquet Romántico',
        'Arreglo especial para ocasiones románticas',
        32990,
        'bouquets',
        '/images/products/bouquet-romantico.jpg',
        10,
        1,
      ],
      [
        'Ramo de Tulipanes',
        'Elegante ramo de tulipanes variados',
        28990,
        'ramos',
        '/images/products/tulipanes.jpg',
        12,
        1,
      ],
      [
        'Arreglo Primaveral',
        'Mezcla de flores de temporada',
        35990,
        'arreglos',
        '/images/products/primaveral.jpg',
        8,
        1,
      ],
      [
        'Orquídeas Premium',
        'Exóticas orquídeas en maceta',
        42990,
        'plantas',
        '/images/products/orquideas.jpg',
        5,
        0,
      ],
    ];

    const stmt = db.prepare(
      'INSERT INTO products (name, description, price, category, image_url, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    products.forEach((p) => stmt.run(p));
    stmt.finalize();

    console.log('✅ Datos de ejemplo insertados');
  });
}

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ========== RUTAS ==========

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== AUTH =====
app.post('/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role && ['admin','owner','trabajador','contador','customer','cliente'].includes(role) ? role : 'customer';

    db.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, userRole],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Email ya registrado' });
          }
          return res.status(500).json({ error: 'Error al registrar usuario' });
        }

        const token = jwt.sign({ id: this.lastID, email, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: this.lastID, email, name, role: userRole } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar registro' });
  }
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });
});

// ===== PRODUCTS =====

// Actualizar stock de producto (solo worker o admin)
app.put('/products/:id/stock', authenticateToken, (req, res) => {
  const { newStock } = req.body;
  if (!Number.isInteger(newStock) || newStock < 0) {
    return res.status(400).json({ error: 'Stock inválido' });
  }
  const allowedRoles = ['admin', 'worker', 'trabajador'];
  const userRole = req.user.role;
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'No autorizado: solo trabajadores o administradores pueden modificar el stock.' });
  }
  db.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar stock' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ id: req.params.id, stock: newStock });
  });
});
app.get('/products', (req, res) => {
  const { category, featured } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (featured === 'true') {
    query += ' AND featured = 1';
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(products);
  });
});

app.get('/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err || !product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  });
});

app.post('/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { name, description, price, category, image_url, stock, featured } = req.body;

  db.run(
    'INSERT INTO products (name, description, price, category, image_url, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, price, category, image_url, stock || 0, featured || 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear producto' });
      }
      res.status(201).json({ id: this.lastID, name, price });
    }
  );
});

// ===== ORDERS =====
app.post('/orders', authenticateToken, (req, res) => {
  const { items, total, delivery_address, delivery_date, notes } = req.body;

  db.run(
    'INSERT INTO orders (user_id, total, delivery_address, delivery_date, notes) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, total, delivery_address, delivery_date, notes],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear orden' });
      }

      const orderId = this.lastID;
      const stmt = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      );

      items.forEach((item) => {
        stmt.run([orderId, item.product_id, item.quantity, item.price]);
      });

      stmt.finalize();
      res.status(201).json({ id: orderId, status: 'pending' });
    }
  );
});

app.get('/orders', authenticateToken, (req, res) => {
  const query =
    req.user.role === 'admin'
      ? 'SELECT * FROM orders ORDER BY created_at DESC'
      : 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';

  const params = req.user.role === 'admin' ? [] : [req.user.id];

  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener órdenes' });
    }
    res.json(orders);
  });
});

// ===== CONTACT =====
app.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body;

  db.run(
    'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
    [name, email, phone, message],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al enviar mensaje' });
      }
      res.status(201).json({ id: this.lastID, message: 'Mensaje enviado correctamente' });
    }
  );
});

// ===== REVIEWS =====
app.get('/reviews/product/:productId', (req, res) => {
  db.all(
    'SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC',
    [req.params.productId],
    (err, reviews) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener reseñas' });
      }
      res.json(reviews);
    }
  );
});

app.post('/reviews', authenticateToken, (req, res) => {
  const { product_id, rating, comment } = req.body;

  db.run(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [product_id, req.user.id, rating, comment],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear reseña' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API unificada corriendo en puerto ${PORT}`);
  console.log(`📊 Base de datos: ${DB_PATH}`);
  console.log(`🔐 JWT Secret configurado: ${JWT_SECRET ? 'Sí' : 'No'}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  db.close((err) => {
    if (err) {
      console.error('Error cerrando DB:', err);
    }
    process.exit(0);
  });
});
