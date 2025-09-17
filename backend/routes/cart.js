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
    console.log('Conectado a la base de datos de usuarios para carrito de compras');
  }
});

// Crear tabla de carrito si no existe
db.serialize(() => {
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

// Obtener todos los productos en el carrito del usuario
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  const query = `
    SELECT c.*, p.name as product_name, p.description as product_description, 
           p.price as product_price, p.image_url as product_image, p.category as product_category
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.added_at DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error al obtener carrito:', err.message);
      return res.status(500).json({ error: 'Error al obtener carrito' });
    }

    // Calcular el total del carrito
    const total = rows.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

    res.json({
      cart: rows,
      count: rows.length,
      total: Math.round(total * 100) / 100 // Redondear a 2 decimales
    });
  });
});

// Agregar un producto al carrito
router.post('/', authenticateToken, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.id;

  // Validar campos requeridos
  if (!productId) {
    return res.status(400).json({ error: 'ID de producto es obligatorio' });
  }

  // Validar cantidad
  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
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

      // Verificar si el producto ya está en el carrito
      db.get(`SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?`, [userId, productId], (err, row) => {
        if (err) {
          console.error('Error al verificar producto en carrito:', err.message);
          return res.status(500).json({ error: 'Error al verificar producto en carrito' });
        }

        if (row) {
          // Si el producto ya está en el carrito, actualizar la cantidad
          const newQuantity = row.quantity + qty;
          db.run(`UPDATE cart SET quantity = ? WHERE id = ?`, [newQuantity, row.id], function(err) {
            if (err) {
              console.error('Error al actualizar cantidad en carrito:', err.message);
              return res.status(500).json({ error: 'Error al actualizar cantidad en carrito' });
            }

            res.json({
              message: 'Cantidad actualizada en el carrito',
              productId: productId,
              quantity: newQuantity
            });
          });
        } else {
          // Si el producto no está en el carrito, agregarlo
          const stmt = db.prepare(`INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`);
          stmt.run([userId, productId, qty], function(err) {
            if (err) {
              console.error('Error al agregar producto al carrito:', err.message);
              return res.status(500).json({ error: 'Error al agregar producto al carrito' });
            }

            res.status(201).json({
              id: this.lastID,
              user_id: userId,
              product_id: productId,
              quantity: qty,
              message: 'Producto agregado al carrito'
            });
          });
          stmt.finalize();
        }
      });
    });
  });
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:productId', authenticateToken, (req, res) => {
  const productId = req.params.productId;
  const { quantity } = req.body;
  const userId = req.user.id;

  // Validar cantidad
  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
  }

  // Verificar que el producto exista en el carrito
  db.get(`SELECT id FROM cart WHERE user_id = ? AND product_id = ?`, [userId, productId], (err, row) => {
    if (err) {
      console.error('Error al verificar producto en carrito:', err.message);
      return res.status(500).json({ error: 'Error al verificar producto en carrito' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    // Actualizar la cantidad
    db.run(`UPDATE cart SET quantity = ? WHERE id = ?`, [qty, row.id], function(err) {
      if (err) {
        console.error('Error al actualizar cantidad en carrito:', err.message);
        return res.status(500).json({ error: 'Error al actualizar cantidad en carrito' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      }

      res.json({
        message: 'Cantidad actualizada en el carrito',
        productId: productId,
        quantity: qty
      });
    });
  });
});

// Eliminar un producto del carrito
router.delete('/:productId', authenticateToken, (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  // Eliminar del carrito
  db.run(`DELETE FROM cart WHERE user_id = ? AND product_id = ?`, [userId, productId], function(err) {
    if (err) {
      console.error('Error al eliminar producto del carrito:', err.message);
      return res.status(500).json({ error: 'Error al eliminar producto del carrito' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.json({ message: 'Producto eliminado del carrito' });
  });
});

// Limpiar todo el carrito
router.delete('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.run(`DELETE FROM cart WHERE user_id = ?`, [userId], function(err) {
    if (err) {
      console.error('Error al limpiar carrito:', err.message);
      return res.status(500).json({ error: 'Error al limpiar carrito' });
    }

    res.json({ 
      message: `Carrito limpiado. ${this.changes} productos eliminados`,
      deletedCount: this.changes
    });
  });
});

module.exports = router;