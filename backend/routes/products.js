const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { MongoClient } = require('mongodb');
const cacheService = require('../services/cacheService');
const { validateId, validateProduct } = require('../middleware/validation');

// Conectar a MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://root:rootpassword@localhost:27018/floresvictoria?authSource=admin';
const client = new MongoClient(uri);

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Operaciones con productos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogenerado del producto
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         description:
 *           type: string
 *           description: Descripción del producto
 *         price:
 *           type: number
 *           format: float
 *           description: Precio del producto
 *         category:
 *           type: string
 *           description: Categoría del producto
 *         imageUrl:
 *           type: string
 *           description: URL de la imagen del producto
 *         stock:
 *           type: integer
 *           description: Cantidad en stock
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           description: Calificación del producto
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         name: "Ramo de Rosas"
 *         description: "Hermoso ramo de rosas rojas"
 *         price: 25.99
 *         category: "Ramos"
 *         imageUrl: "/assets/images/placeholder.svg"
 *         stock: 10
 *         rating: 4.5
 *         createdAt: "2023-08-20T12:00:00Z"
 *         updatedAt: "2023-08-20T12:00:00Z"
 */

let db;
let productsCollection;

// Inicializar la base de datos cuando se cargue el módulo
async function initDatabase() {
  try {
    await client.connect();
    console.log('Conectado a MongoDB para productos');
    db = client.db('floresvictoria');
    productsCollection = db.collection('products');
  } catch (error) {
    console.error('Error al conectar con MongoDB para productos:', error.message);
  }
}

// Inicializar la base de datos
initDatabase();

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

/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: Obtiene todas las categorías únicas de productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para obtener todas las categorías únicas con caché
router.get('/categories', cacheService.createMiddleware('product:categories', 3600), async (req, res) => {
  try {
    const categories = await productsCollection.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Error al obtener categorías:', error.message);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

/**
 * @swagger
 * /products/stats:
 *   get:
 *     summary: Obtiene estadísticas de productos (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *                 totalOrders:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para obtener estadísticas (solo para administradores)
router.get('/stats', async (req, res) => {
  try {
    // Obtener total de productos
    const totalProducts = await productsCollection.countDocuments();
    
    // Obtener total de usuarios (asumiendo que hay una colección de usuarios)
    const userCount = await db.collection('users').countDocuments();
    
    res.json({
      totalProducts,
      totalUsers: userCount,
      totalOrders: 0, // Implementar cuando se tenga el sistema de pedidos
      totalRevenue: 0 // Implementar cuando se tenga el sistema de pedidos
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Función para crear condiciones de filtrado reutilizables
function buildFilterConditions(req) {
  const filter = {};
  
  // Filtro por categoría
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  // Filtro por rango de precio
  if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
    filter.price = {};
    
    if (req.query.minPrice !== undefined) {
      filter.price.$gte = parseFloat(req.query.minPrice);
    }
    
    if (req.query.maxPrice !== undefined) {
      filter.price.$lte = parseFloat(req.query.maxPrice);
    }
  }
  
  // Filtro de búsqueda textual
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  return filter;
}

// Función para crear ordenamiento reutilizable
function buildSortOptions(req) {
  const sortOptions = {
    'name': { name: 1 },
    'name_desc': { name: -1 },
    'price': { price: 1 },
    'price_desc': { price: -1 },
    'category': { category: 1 },
    'category_desc': { category: -1 },
    'default': { _id: -1 }
  };
  
  return req.query.sortBy && sortOptions[req.query.sortBy] 
    ? sortOptions[req.query.sortBy] 
    : sortOptions.default;
}

// Función para obtener productos con opciones de filtrado, paginación y ordenamiento
async function getProducts(req, res, next) {
  try {
    // Validar y obtener parámetros de paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 12)); // Límite máximo de 100
    const skip = (page - 1) * limit;
    
    // Construir condiciones de filtro
    const filter = buildFilterConditions(req);
    
    // Construir opciones de ordenamiento
    const sort = buildSortOptions(req);
    
    // Obtener productos
    const products = await productsCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Obtener total de productos con los filtros aplicados
    const total = await productsCollection.countDocuments(filter);
    
    // Calcular datos de paginación
    const totalPages = Math.ceil(total / limit);
    
    // Enviar respuesta
    res.json({
      data: products,
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
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    next(error);
  }
}

// Ruta para obtener todos los productos con paginación, filtros y ordenamiento con caché
router.get('/', cacheService.createMiddleware(
  (req) => `products:${req.query.category || 'all'}:${req.query.sortBy || 'default'}:${req.query.page || 1}:${req.query.limit || 12}`, 
  1800
), getProducts);

// Ruta para obtener productos por categoría con paginación y filtros avanzados
router.get('/category/:category', (req, res, next) => {
  // Usar la categoría como parámetro de filtro
  req.query.category = req.params.category;
  
  // Usar la función getProducts reutilizable
  getProducts(req, res, next);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Detalles del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para obtener un producto por ID
router.get('/:id', validateId, cacheService.createMiddleware(
  (req) => `product:${req.params.id}`, 
  3600
), async (req, res) => {
  try {
    const product = await productsCollection.findOne({ _id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Error al obtener producto:', error.message);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crea un nuevo producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para crear un nuevo producto (solo administradores)
router.post('/', authenticateAdmin, validateProduct, async (req, res) => {
  try {
    const { name, description, price, image_url, category } = req.body;
    
    // Validar datos requeridos
    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Crear nuevo producto
    const newProduct = {
      name,
      description,
      price: parseFloat(price),
      image_url: image_url || '/assets/images/placeholder.svg',
      category,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insertar producto en la base de datos
    const result = await productsCollection.insertOne(newProduct);
    newProduct._id = result.insertedId;
    
    // Limpiar caché de productos y categorías
    cacheService.delete('product:categories');
    cacheService.clear();
    
    res.status(201).json({ product: newProduct, message: 'Producto creado exitosamente' });
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualiza un producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               category:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualiza un producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               category:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para actualizar un producto (solo administradores)
router.put('/:id', authenticateAdmin, validateId, validateProduct, async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, image_url, category, stock, rating } = req.body;
    
    // Validar datos requeridos
    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Construir objeto de actualización
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      image_url: image_url || '/assets/images/placeholder.svg',
      category,
      updatedAt: new Date()
    };
    
    // Añadir campos opcionales si están presentes
    if (stock !== undefined) {
      updateData.stock = parseInt(stock);
    }
    
    if (rating !== undefined) {
      const parsedRating = parseFloat(rating);
      if (parsedRating >= 0 && parsedRating <= 5) {
        updateData.rating = parsedRating;
      } else {
        return res.status(400).json({ error: 'La calificación debe estar entre 0 y 5' });
      }
    }
    
    // Actualizar producto
    const result = await productsCollection.updateOne(
      { _id: productId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Limpiar caché del producto específico y listados
    cacheService.delete(`product:${productId}`);
    cacheService.delete('product:categories');
    cacheService.clear();
    
    // Obtener producto actualizado
    const product = await productsCollection.findOne({ _id: productId });
    
    res.json({ product, message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Elimina un producto (solo administradores)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para eliminar un producto (solo administradores)
router.delete('/:id', authenticateAdmin, validateId, async (req, res) => {
  try {
    const productId = req.params.id;
    
    const result = await productsCollection.deleteOne({ _id: productId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Limpiar caché del producto específico y listados
    cacheService.delete(`product:${productId}`);
    cacheService.delete('product:categories');
    cacheService.clear();
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;