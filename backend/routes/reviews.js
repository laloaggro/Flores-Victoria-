const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Importar middleware de validación
const { validateId } = require('../middleware/validation');

// Middleware para validar que el ID proporcionado en los parámetros sea un número entero válido
const validateIdReviews = (req, res, next) => {
  const id = parseInt(req.params.id);
  
  // Validar que el ID sea un número
  if (isNaN(id)) {
    return res.status(400).json({ 
      error: 'ID inválido. Debe ser un número.' 
    });
  }
  
  // Validar que el ID sea positivo
  if (id <= 0) {
    return res.status(400).json({ 
      error: 'ID inválido. Debe ser un número positivo.' 
    });
  }
  
  next();
};

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

/**
 * @swagger
 * tags:
 *   name: Reseñas
 *   description: Operaciones con reseñas de productos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - product_id
 *         - user_id
 *         - rating
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la reseña
 *         product_id:
 *           type: integer
 *           description: ID del producto
 *         user_id:
 *           type: integer
 *           description: ID del usuario
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Calificación del producto (1-5)
 *         comment:
 *           type: string
 *           description: Comentario de la reseña
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *       example:
 *         id: 1
 *         product_id: 1
 *         user_id: 1
 *         rating: 5
 *         comment: "Excelente producto, muy recomendado"
 *         created_at: "2023-01-01T00:00:00.000Z"
 */

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

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Obtiene todas las reseñas de un producto
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de reseñas por página
 *     responses:
 *       200:
 *         description: Lista de reseñas del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalReviews:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       500:
 *         description: Error interno del servidor
 */
// Obtener todas las reseñas de un producto
router.get('/product/:productId', validateId, (req, res) => {
  const productId = parseInt(req.params.productId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Obtener reseñas con información del usuario
  const query = `
    SELECT r.*, u.username as user_name
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

// Middleware para validar datos de reseña
const validateReview = (req, res, next) => {
  const { productId, rating, comment } = req.body;
  
  // Validar campos requeridos
  if (productId === undefined || rating === undefined) {
    return res.status(400).json({ error: 'Producto ID y calificación son obligatorios' });
  }
  
  // Validar tipos de datos
  if (typeof productId !== 'number' || !Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Producto ID debe ser un número entero positivo' });
  }
  
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'La calificación debe ser un número entero entre 1 y 5' });
  }
  
  // Validar comentario si se proporciona
  if (comment !== undefined && (typeof comment !== 'string' || comment.trim().length === 0)) {
    return res.status(400).json({ error: 'El comentario debe ser una cadena no vacía' });
  }
  
  next();
};

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Crea una nueva reseña
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - rating
 *             properties:
 *               productId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *             example:
 *               productId: 1
 *               rating: 5
 *               comment: "Excelente producto, muy recomendado"
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 *       500:
 *         description: Error interno del servidor
 */
// Crear una nueva reseña
router.post('/', authenticateToken, validateReview, (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

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
    stmt.run([productId, userId, rating, comment || null], function(err) {
      if (err) {
        console.error('Error al crear reseña:', err.message);
        return res.status(500).json({ error: 'Error al crear reseña' });
      }

      res.status(201).json({
        id: this.lastID,
        product_id: productId,
        user_id: userId,
        rating: rating,
        comment: comment || null,
        message: 'Reseña creada exitosamente'
      });
    });
    stmt.finalize();
  });
});

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Actualiza una reseña (solo el propietario puede actualizarla)
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *             example:
 *               rating: 4
 *               comment: "Buena calidad, pero el envío fue lento"
 *     responses:
 *       200:
 *         description: Reseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// Actualizar una reseña (solo el propietario puede actualizarla)
router.put('/:id', authenticateToken, validateId, (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  // Validar rango de calificación si se proporciona
  if (rating !== undefined) {
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La calificación debe ser un número entero entre 1 y 5' });
    }
  }

  // Validar comentario si se proporciona
  if (comment !== undefined && (typeof comment !== 'string' || comment.trim().length === 0)) {
    return res.status(400).json({ error: 'El comentario debe ser una cadena no vacía' });
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

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Elimina una reseña (solo el propietario puede eliminarla)
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Reseña eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// Eliminar una reseña (solo el propietario puede eliminarla)
router.delete('/:id', authenticateToken, validateId, (req, res) => {
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

/**
 * @swagger
 * /reviews/product/{productId}/stats:
 *   get:
 *     summary: Obtiene estadísticas de reseñas para un producto
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Estadísticas de reseñas del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_reviews:
 *                   type: integer
 *                 average_rating:
 *                   type: number
 *                   format: float
 *                 rating_distribution:
 *                   type: object
 *                   properties:
 *                     five_star:
 *                       type: integer
 *                     four_star:
 *                       type: integer
 *                     three_star:
 *                       type: integer
 *                     two_star:
 *                       type: integer
 *                     one_star:
 *                       type: integer
 *       500:
 *         description: Error interno del servidor
 */
// Obtener estadísticas de reseñas para un producto
router.get('/product/:productId/stats', validateId, (req, res) => {
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