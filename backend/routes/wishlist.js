const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Conectar a la base de datos de usuarios
const dbPath = path.join(__dirname, '..', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos de usuarios:', err.message);
  } else {
    console.log('Conectado a la base de datos de usuarios para lista de deseos');
  }
});

// Crear tabla de lista de deseos si no existe
db.serialize(() => {
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
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Obtener todos los productos en la lista de deseos del usuario
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT w.*, p.name as product_name, p.description as product_description, 
           p.price as product_price, p.image_url as product_image, p.category as product_category
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.added_at DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error al obtener lista de deseos:', err.message);
      return res.status(500).json({ error: 'Error al obtener lista de deseos' });
    }

    res.json({
      wishlist: rows,
      count: rows.length
    });
  });
});

// Agregar un producto a la lista de deseos
router.post('/', authenticateToken, (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  // Validar campos requeridos
  if (!productId) {
    return res.status(400).json({ error: 'ID de producto es obligatorio' });
  }

  // Verificar si el producto ya está en la lista de deseos
  db.get(`SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?`, [userId, productId], (err, row) => {
    if (err) {
      console.error('Error al verificar producto en lista de deseos:', err.message);
      return res.status(500).json({ error: 'Error al verificar producto en lista de deseos' });
    }

    if (row) {
      return res.status(400).json({ error: 'El producto ya está en tu lista de deseos' });
    }

    // Verificar que el producto exista en la base de datos de productos
    const productDbPath = path.join(__dirname, '..', 'products.db');
    const productDb = new sqlite3.Database(productDbPath, (err) => {
      if (err) {
        console.error('Error al conectar con la base de datos de productos:', err.message);
        return res.status(500).json({ error: 'Error al verificar el producto' });
      }
      
      productDb.get(`SELECT id FROM products WHERE id = ?`, [productId], (err, productRow) => {
        productDb.close();
        
        if (err) {
          console.error('Error al verificar producto:', err.message);
          return res.status(500).json({ error: 'Error al verificar el producto' });
        }
        
        if (!productRow) {
          return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Insertar en la lista de deseos
        const stmt = db.prepare(`INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)`);
        stmt.run([userId, productId], function(err) {
          if (err) {
            console.error('Error al agregar producto a lista de deseos:', err.message);
            return res.status(500).json({ error: 'Error al agregar producto a lista de deseos' });
          }

          res.status(201).json({
            id: this.lastID,
            user_id: userId,
            product_id: productId,
            message: 'Producto agregado a la lista de deseos'
          });
        });
        stmt.finalize();
      });
    });
  });
});

// Verificar si un producto está en la lista de deseos
router.get('/check/:productId', authenticateToken, (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  db.get(`SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?`, [userId, productId], (err, row) => {
    if (err) {
      console.error('Error al verificar producto en lista de deseos:', err.message);
      return res.status(500).json({ error: 'Error al verificar producto en lista de deseos' });
    }

    res.json({
      inWishlist: !!row,
      productId: productId
    });
  });
});

// Eliminar un producto de la lista de deseos
router.delete('/:productId', authenticateToken, (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  // Eliminar de la lista de deseos
  db.run(`DELETE FROM wishlist WHERE user_id = ? AND product_id = ?`, [userId, productId], function(err) {
    if (err) {
      console.error('Error al eliminar producto de lista de deseos:', err.message);
      return res.status(500).json({ error: 'Error al eliminar producto de lista de deseos' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en la lista de deseos' });
    }

    res.json({ message: 'Producto eliminado de la lista de deseos' });
  });
});

// Limpiar toda la lista de deseos
router.delete('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.run(`DELETE FROM wishlist WHERE user_id = ?`, [userId], function(err) {
    if (err) {
      console.error('Error al limpiar lista de deseos:', err.message);
      return res.status(500).json({ error: 'Error al limpiar lista de deseos' });
    }

    res.json({ 
      message: `Lista de deseos limpiada. ${this.changes} productos eliminados`,
      deletedCount: this.changes
    });
  });
});

module.exports = router;