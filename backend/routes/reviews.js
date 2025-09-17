const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Conectar a la base de datos de productos (donde también almacenaremos las reseñas)
const dbPath = path.join(__dirname, '..', 'products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos de productos:', err.message);
  } else {
    console.log('Conectado a la base de datos de productos para reseñas');
  }
});

// Crear tabla de reseñas si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reviews (
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

// Obtener todas las reseñas de un producto
router.get('/product/:productId', (req, res) => {
  const productId = req.params.productId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Obtener reseñas con información del usuario
  const query = `
    SELECT r.*, u.name as user_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [productId, limit, offset], (err, rows) => {
    if (err) {
      console.error('Error al obtener reseñas:', err.message);
      return res.status(500).json({ error: 'Error al obtener reseñas' });
    }

    // Contar el total de reseñas para este producto
    db.get(`SELECT COUNT(*) as total FROM reviews WHERE product_id = ?`, [productId], (err, countRow) => {
      if (err) {
        console.error('Error al contar reseñas:', err.message);
        return res.status(500).json({ error: 'Error al contar reseñas' });
      }

      const total = countRow.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        reviews: rows,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalReviews: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

// Crear una nueva reseña
router.post('/', authenticateToken, (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  // Validar campos requeridos
  if (!productId || !rating) {
    return res.status(400).json({ error: 'Producto ID y calificación son obligatorios' });
  }

  // Validar rango de calificación
  const ratingValue = parseInt(rating);
  if (ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
  }

  // Verificar si el usuario ya ha dejado una reseña para este producto
  db.get(`SELECT id FROM reviews WHERE product_id = ? AND user_id = ?`, [productId, userId], (err, row) => {
    if (err) {
      console.error('Error al verificar reseña existente:', err.message);
      return res.status(500).json({ error: 'Error al verificar reseña existente' });
    }

    if (row) {
      return res.status(400).json({ error: 'Ya has dejado una reseña para este producto' });
    }

    // Insertar nueva reseña
    const stmt = db.prepare(`INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`);
    stmt.run([productId, userId, ratingValue, comment || null], function(err) {
      if (err) {
        console.error('Error al crear reseña:', err.message);
        return res.status(500).json({ error: 'Error al crear reseña' });
      }

      res.status(201).json({
        id: this.lastID,
        product_id: productId,
        user_id: userId,
        rating: ratingValue,
        comment: comment || null,
        message: 'Reseña creada exitosamente'
      });
    });
    stmt.finalize();
  });
});

// Actualizar una reseña (solo el propietario puede actualizarla)
router.put('/:id', authenticateToken, (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  // Validar rango de calificación si se proporciona
  if (rating) {
    const ratingValue = parseInt(rating);
    if (ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }
  }

  // Verificar si la reseña existe y pertenece al usuario
  db.get(`SELECT id FROM reviews WHERE id = ? AND user_id = ?`, [reviewId, userId], (err, row) => {
    if (err) {
      console.error('Error al verificar reseña:', err.message);
      return res.status(500).json({ error: 'Error al verificar reseña' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Reseña no encontrada o no tienes permiso para actualizarla' });
    }

    // Construir consulta de actualización dinámica
    let query = 'UPDATE reviews SET ';
    const params = [];
    const updates = [];

    if (rating !== undefined) {
      updates.push('rating = ?');
      params.push(rating);
    }

    if (comment !== undefined) {
      updates.push('comment = ?');
      params.push(comment);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(reviewId);

    // Actualizar la reseña
    db.run(query, params, function(err) {
      if (err) {
        console.error('Error al actualizar reseña:', err.message);
        return res.status(500).json({ error: 'Error al actualizar reseña' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
      }

      res.json({ message: 'Reseña actualizada exitosamente' });
    });
  });
});

// Eliminar una reseña (solo el propietario puede eliminarla)
router.delete('/:id', authenticateToken, (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  // Verificar si la reseña existe y pertenece al usuario
  db.get(`SELECT id FROM reviews WHERE id = ? AND user_id = ?`, [reviewId, userId], (err, row) => {
    if (err) {
      console.error('Error al verificar reseña:', err.message);
      return res.status(500).json({ error: 'Error al verificar reseña' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Reseña no encontrada o no tienes permiso para eliminarla' });
    }

    // Eliminar la reseña
    db.run(`DELETE FROM reviews WHERE id = ?`, [reviewId], function(err) {
      if (err) {
        console.error('Error al eliminar reseña:', err.message);
        return res.status(500).json({ error: 'Error al eliminar reseña' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
      }

      res.json({ message: 'Reseña eliminada exitosamente' });
    });
  });
});

// Obtener estadísticas de reseñas para un producto
router.get('/product/:productId/stats', (req, res) => {
  const productId = req.params.productId;

  const query = `
    SELECT 
      COUNT(*) as total_reviews,
      AVG(rating) as average_rating,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
    FROM reviews 
    WHERE product_id = ?
  `;

  db.get(query, [productId], (err, row) => {
    if (err) {
      console.error('Error al obtener estadísticas de reseñas:', err.message);
      return res.status(500).json({ error: 'Error al obtener estadísticas de reseñas' });
    }

    if (!row.total_reviews) {
      return res.json({
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: {
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0
        }
      });
    }

    res.json({
      total_reviews: row.total_reviews,
      average_rating: Math.round(row.average_rating * 100) / 100, // Redondear a 2 decimales
      rating_distribution: {
        five_star: row.five_star,
        four_star: row.four_star,
        three_star: row.three_star,
        two_star: row.two_star,
        one_star: row.one_star
      }
    });
  });
});

module.exports = router;