const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { MongoClient } = require('mongodb');

// Conectar a MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/floresvictoria?authSource=admin';
const client = new MongoClient(uri);

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

// Ruta para obtener todas las categorías únicas
router.get('/categories', async (req, res) => {
  try {
    const categories = await productsCollection.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Error al obtener categorías:', error.message);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

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

// Ruta para obtener todos los productos con paginación, filtros y ordenamiento
router.get('/', getProducts);

// Ruta para obtener productos por categoría con paginación y filtros avanzados
router.get('/category/:category', (req, res, next) => {
  // Usar la categoría como parámetro de filtro
  req.query.category = req.params.category;
  
  // Usar la función getProducts reutilizable
  getProducts(req, res, next);
});

// Ruta para obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productsCollection.findOne({ _id: productId });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error.message);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Ruta para crear un nuevo producto (solo administradores)
router.post('/', authenticateAdmin, async (req, res) => {
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
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Ruta para actualizar un producto (solo administradores)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, image_url, category } = req.body;
    
    // Validar datos requeridos
    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Actualizar producto
    const updatedProduct = {
      $set: {
        name,
        description,
        price: parseFloat(price),
        image_url: image_url || '/assets/images/placeholder.svg',
        category,
        updatedAt: new Date()
      }
    };
    
    const result = await productsCollection.updateOne(
      { _id: productId },
      updatedProduct
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Obtener producto actualizado
    const product = await productsCollection.findOne({ _id: productId });
    
    res.json(product);
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Ruta para eliminar un producto (solo administradores)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    
    const result = await productsCollection.deleteOne({ _id: productId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;