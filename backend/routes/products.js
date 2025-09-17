const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const fs = require('fs');

// Conectar a la base de datos
const dbPath = path.join(__dirname, '..', 'products.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos de productos');
  }
});

// Middleware para verificar el token y el rol de administrador
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');
    
    // Verificar si el usuario es administrador
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(500).json({ error: 'Error al verificar el token' });
  }
};

// Ruta para obtener todas las categorías únicas
router.get('/categories', (req, res) => {
  // Obtener categorías únicas
  db.all(`SELECT DISTINCT category FROM products ORDER BY category`, (err, rows) => {
    if (err) {
      console.error('Error al obtener categorías:', err.message);
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }
    
    const categories = rows.map(row => row.category);
    res.json({ categories });
  });
});

// Ruta para obtener estadísticas (solo para administradores)
router.get('/stats', (req, res) => {
  try {
    // Obtener total de productos
    db.get(`SELECT COUNT(*) as totalProducts FROM products`, (err, productsRow) => {
      if (err) {
        console.error('Error al obtener total de productos:', err.message);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }
      
      // Obtener total de usuarios
      const dbPathUsers = path.join(__dirname, '..', 'users.db');
      const dbUsers = new sqlite3.Database(dbPathUsers, (err) => {
        if (err) {
          console.error('Error al conectar con la base de datos de usuarios:', err.message);
          return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
        
        dbUsers.get(`SELECT COUNT(*) as totalUsers FROM users`, (err, usersRow) => {
          if (err) {
            console.error('Error al obtener total de usuarios:', err.message);
            dbUsers.close();
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
          }
          
          // Cerrar la conexión a la base de datos de usuarios
          dbUsers.close();
          
          // Devolver estadísticas
          res.json({
            totalProducts: productsRow.totalProducts,
            totalUsers: usersRow.totalUsers,
            totalOrders: 0, // Implementar cuando se tenga el sistema de pedidos
            totalRevenue: 0 // Implementar cuando se tenga el sistema de pedidos
          });
        });
      });
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Función para crear condiciones de filtrado reutilizables
function buildFilterConditions(req) {
  const conditions = [];
  const params = [];
  
  // Filtro por categoría
  if (req.query.category) {
    conditions.push('category = ?');
    params.push(req.query.category);
  }
  
  // Filtro por rango de precio
  if (req.query.minPrice !== undefined) {
    conditions.push('price >= ?');
    params.push(parseFloat(req.query.minPrice));
  }
  
  if (req.query.maxPrice !== undefined) {
    conditions.push('price <= ?');
    params.push(parseFloat(req.query.maxPrice));
  }
  
  // Filtro de búsqueda textual
  if (req.query.search) {
    const searchParam = `%${req.query.search}%`;
    conditions.push('name LIKE ? OR description LIKE ?');
    params.push(searchParam, searchParam);
  }
  
  return { conditions, params };
}

// Función para crear ordenamiento reutilizable
function buildOrderByClause(req) {
  const sortOptions = {
    'name': 'name COLLATE NOCASE',
    'name_desc': 'name COLLATE NOCASE DESC',
    'price': 'price',
    'price_desc': 'price DESC',
    'category': 'category COLLATE NOCASE',
    'category_desc': 'category COLLATE NOCASE DESC',
    'default': 'id DESC'
  };
  
  return req.query.sortBy && sortOptions[req.query.sortBy] 
    ? sortOptions[req.query.sortBy] 
    : sortOptions.default;
}

// Función para obtener productos con opciones de filtrado, paginación y ordenamiento
function getProducts(req, res, next) {
  try {
    // Validar y obtener parámetros de paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 12)); // Límite máximo de 100
    const offset = (page - 1) * limit;
    
    // Construir condiciones de filtro
    const { conditions, params } = buildFilterConditions(req);
    
    // Construir consulta principal
    let query = 'SELECT * FROM products';
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Agregar ordenamiento
    const orderBy = buildOrderByClause(req);
    query += ` ORDER BY ${orderBy}`;
    
    // Agregar paginación
    query += ' LIMIT ? OFFSET ?';
    const paginatedParams = [...params, limit, offset];
    
    // Ejecutar consulta principal
    db.all(query, paginatedParams, (err, rows) => {
      if (err) {
        throw err;
      }
      
      // Construir consulta de conteo
      let countQuery = 'SELECT COUNT(*) as total FROM products';
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Ejecutar consulta de conteo
      db.get(countQuery, params, (err, countRow) => {
        if (err) {
          throw err;
        }
        
        // Calcular datos de paginación
        const total = countRow.total;
        const totalPages = Math.ceil(total / limit);
        
        // Enviar respuesta
        res.json({
          data: rows,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            sortBy: req.query.sortBy || 'default',
            filters: req.query
          }
        });
      });
    });
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    next(error);
  }
}

// Ruta para obtener todos los productos con paginación, filtros y ordenamiento
router.get('/', getProducts);


// Ruta para obtener productos por categoría con paginación y filtros avanzados
router.get('/category/:category', (req, res, next) => {
  // Usar la categoría como parámetro de filtro
  req.query.category = req.params.category;
  
  // Usar la función getProducts reutilizable
  getProducts(req, res, next);
});

// Ruta para buscar productos por nombre
router.get('/search/:query', (req, res) => {
  const query = `%${req.params.query}%`;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  
  // Buscar productos por nombre
  db.all(`SELECT * FROM products WHERE name LIKE ? LIMIT ? OFFSET ?`, [query, limit, offset], (err, rows) => {
    if (err) {
      console.error('Error al buscar productos:', err.message);
      return res.status(500).json({ error: 'Error al buscar productos' });
    }
    
    // Contar el total de productos encontrados
    db.get(`SELECT COUNT(*) as total FROM products WHERE name LIKE ?`, [query], (err, countRow) => {
      if (err) {
        console.error('Error al contar productos encontrados:', err.message);
        return res.status(500).json({ error: 'Error al contar productos encontrados' });
      }
      
      const total = countRow.total;
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        products: rows,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

// Ruta para subir imágenes (solo para administradores)
router.post('/upload', authenticateAdmin, (req, res) => {
    if (!req.body.image) {
        return res.status(400).json({ error: 'No se proporcionó imagen' });
    }
    
    try {
        // Decodificar la imagen base64
        const imageData = req.body.image;
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generar nombre único para el archivo
        const fileName = `${uuidv4()}.png`;
        const filePath = path.join(__dirname, '..', 'uploads', fileName);
        
        // Guardar la imagen
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error al guardar imagen:', err);
                return res.status(500).json({ error: 'Error al guardar imagen' });
            }
            
            // Devolver la URL de la imagen
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
            res.json({ imageUrl });
        });
    } catch (error) {
        console.error('Error al procesar imagen:', error);
        res.status(500).json({ error: 'Error al procesar imagen' });
    }
});

// Ruta para crear un nuevo producto (solo para administradores)
router.post('/', authenticateAdmin, (req, res) => {
  const { name, description, price, category, image } = req.body;
  
  // Validar campos requeridos
  if (!name || !price || !category) {
    return res.status(400).json({ 
      error: 'Los campos nombre, precio y categoría son obligatorios' 
    });
  }
  
  // Validar que el precio sea un número válido
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ 
      error: 'El precio debe ser un número válido mayor o igual a cero' 
    });
  }
  
  // Insertar nuevo producto
  const stmt = db.prepare(`INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)`);
  stmt.run([name, description, parsedPrice, category, image], function(err) {
    if (err) {
      console.error('Error al crear producto:', err.message);
      return res.status(500).json({ error: 'Error al crear producto: ' + err.message });
    }
    
    // Devolver el producto creado con su ID
    res.status(201).json({
      id: this.lastID,
      name,
      description,
      price: parsedPrice,
      category,
      image
    });
  });
  stmt.finalize();
});

// Ruta para actualizar un producto (solo para administradores)
router.put('/:id', authenticateAdmin, (req, res) => {
  const id = req.params.id;
  const { name, description, price, category, image } = req.body;
  
  // Validar campos requeridos
  if (!name || !price || !category) {
    return res.status(400).json({ 
      error: 'Los campos nombre, precio y categoría son obligatorios' 
    });
  }
  
  // Validar que el precio sea un número válido
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ 
      error: 'El precio debe ser un número válido mayor o igual a cero' 
    });
  }
  
  // Verificar si el producto existe
  db.get(`SELECT id FROM products WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error al verificar producto:', err.message);
      return res.status(500).json({ error: 'Error al verificar producto: ' + err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Actualizar el producto
    const stmt = db.prepare(`UPDATE products SET name = ?, description = ?, price = ?, category = ?, image = ? WHERE id = ?`);
    stmt.run([name, description, parsedPrice, category, image, id], function(err) {
      if (err) {
        console.error('Error al actualizar producto:', err.message);
        return res.status(500).json({ error: 'Error al actualizar producto: ' + err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      // Devolver el producto actualizado
      res.json({
        id,
        name,
        description,
        price: parsedPrice,
        category,
        image
      });
    });
    stmt.finalize();
  });
});

// Ruta para eliminar un producto (solo para administradores)
router.delete('/:id', authenticateAdmin, (req, res) => {
  const id = req.params.id;
  
  // Verificar si el producto existe
  db.get(`SELECT id FROM products WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error al verificar producto:', err.message);
      return res.status(500).json({ error: 'Error al verificar producto' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Eliminar el producto
    db.run(`DELETE FROM products WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Error al eliminar producto:', err.message);
        return res.status(500).json({ error: 'Error al eliminar producto' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json({ message: 'Producto eliminado correctamente' });
    });
  });
});

// Ruta para obtener productos con reseñas y calificaciones
router.get('/with-reviews', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const search = req.query.search;
  
  let query = `
    SELECT p.*, 
           AVG(r.rating) as average_rating,
           COUNT(r.id) as review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
  `;
  
  let countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
  `;
  
  const params = [];
  const countParams = [];
  
  // Agregar filtros si existen
  if (category) {
    query += ' WHERE p.category = ?';
    countQuery += ' WHERE p.category = ?';
    params.push(category);
    countParams.push(category);
  }
  
  if (search) {
    if (category) {
      query += ' AND p.name LIKE ?';
      countQuery += ' AND p.name LIKE ?';
    } else {
      query += ' WHERE p.name LIKE ?';
      countQuery += ' WHERE p.name LIKE ?';
    }
    params.push(`%${search}%`);
    countParams.push(`%${search}%`);
  }
  
  // Agregar agrupamiento y orden
  query += ' GROUP BY p.id ORDER BY p.id LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  // Obtener productos con reseñas y calificaciones
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener productos con reseñas:', err.message);
      return res.status(500).json({ error: 'Error al obtener productos con reseñas' });
    }
    
    // Contar el total de productos con los filtros aplicados
    db.get(countQuery, countParams, (err, countRow) => {
      if (err) {
        console.error('Error al contar productos:', err.message);
        return res.status(500).json({ error: 'Error al contar productos' });
      }
      
      const total = countRow.total;
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        products: rows,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

// Ruta para obtener productos más populares (por número de reseñas)
router.get('/popular', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const query = `
    SELECT p.*, 
           AVG(r.rating) as average_rating,
           COUNT(r.id) as review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id
    HAVING review_count > 0
    ORDER BY review_count DESC, average_rating DESC
    LIMIT ?
  `;
  
  db.all(query, [limit], (err, rows) => {
    if (err) {
      console.error('Error al obtener productos populares:', err.message);
      return res.status(500).json({ error: 'Error al obtener productos populares' });
    }
    
    res.json({
      products: rows
    });
  });
});

// Ruta para obtener un producto por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  
  // Verificar que el ID sea un número para evitar conflictos con otras rutas
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }
  
  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error al obtener producto:', err.message);
      return res.status(500).json({ error: 'Error al obtener producto' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(row);
  });
});

// Ruta para obtener productos mejor calificados
router.get('/top-rated', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const query = `
    SELECT p.*, 
           AVG(r.rating) as average_rating,
           COUNT(r.id) as review_count
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id
    HAVING review_count > 2
    ORDER BY average_rating DESC, review_count DESC
    LIMIT ?
  `;
  
  db.all(query, [limit], (err, rows) => {
    if (err) {
      console.error('Error al obtener productos mejor calificados:', err.message);
      return res.status(500).json({ error: 'Error al obtener productos mejor calificados' });
    }
    
    res.json({
      products: rows
    });
  });
});

module.exports = router;