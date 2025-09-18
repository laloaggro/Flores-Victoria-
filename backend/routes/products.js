const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const fs = require('fs');
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

// Ruta para buscar productos por nombre
router.get('/search/:query', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    
    // Crear filtro de búsqueda
    const filter = {
      $or: [
        { name: { $regex: req.params.query, $options: 'i' } },
        { description: { $regex: req.params.query, $options: 'i' } }
      ]
    };
    
    // Obtener productos
    const products = await productsCollection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Obtener total de productos con los filtros aplicados
    const total = await productsCollection.countDocuments(filter);
    
    // Calcular datos de paginación
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      products: products,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProducts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error al buscar productos:', error.message);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
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

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Products]
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
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    // Validar campos requeridos
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        error: 'Nombre, descripción, precio y categoría son requeridos' 
      });
    }
    
    // Generar ID único para el producto
    const productId = uuidv4();
    
    // Crear objeto del producto
    const newProduct = {
      id: productId,
      name,
      description,
      price: parseFloat(price),
      category,
      stock: stock || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Intentar generar una imagen basada en el nombre del producto
    try {
      const imagePath = await imageGenerationService.generateImageForProduct(name, productId);
      newProduct.image_url = imagePath;
      console.log(`Imagen generada para producto ${name}: ${imagePath}`);
    } catch (imageError) {
      console.error(`Error generando imagen para producto ${name}:`, imageError);
      // Usar una imagen por defecto si falla la generación
      newProduct.image_url = '/assets/images/products/default.jpg';
    }
    
    // Guardar en la base de datos
    await productsCollection.insertOne(newProduct);
    
    // Registrar la actividad
    // await logActivity('PRODUCT_CREATED', `Producto creado: ${name}`, { productId: newProduct.id });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para actualizar un producto (solo para administradores)
router.put('/:id', authenticateAdmin, async (req, res) => {
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
  
  try {
    // Verificar si el producto existe
    const product = await productsCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Actualizar el producto
    const update = {
      $set: {
        name,
        description,
        price: parsedPrice,
        category,
        image,
        updatedAt: new Date()
      }
    };
    
    const result = await productsCollection.updateOne({ _id: new require('mongodb').ObjectId(id) }, update);
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Devolver el producto actualizado
    res.json({
      _id: id,
      name,
      description,
      price: parsedPrice,
      category,
      image
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).json({ error: 'Error al actualizar producto: ' + error.message });
  }
});

// Ruta para eliminar un producto (solo para administradores)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  const id = req.params.id;
  
  try {
    // Verificar si el producto existe
    const product = await productsCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Eliminar el producto
    const result = await productsCollection.deleteOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    res.status(500).json({ error: 'Error al eliminar producto: ' + error.message });
  }
});

// Ruta para obtener productos con reseñas y calificaciones
router.get('/with-reviews', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    
    // Construir pipeline de agregación para MongoDB
    const pipeline = [
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product_id',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          average_rating: { $avg: '$reviews.rating' },
          review_count: { $size: '$reviews' }
        }
      }
    ];
    
    // Agregar filtros si existen
    const match = {};
    if (category) {
      match.category = category;
    }
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (Object.keys(match).length > 0) {
      pipeline.unshift({ $match: match });
    }
    
    // Agregar paginación
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );
    
    // Obtener productos
    const products = await productsCollection.aggregate(pipeline).toArray();
    
    // Contar el total de productos con los filtros aplicados
    const countPipeline = [];
    if (Object.keys(match).length > 0) {
      countPipeline.push({ $match: match });
    }
    countPipeline.push({ $count: 'total' });
    
    const countResult = await productsCollection.aggregate(countPipeline).toArray();
    const total = countResult.length > 0 ? countResult[0].total : 0;
    
    // Calcular datos de paginación
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      products: products,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProducts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener productos con reseñas:', error.message);
    res.status(500).json({ error: 'Error al obtener productos con reseñas' });
  }
});

// Ruta para obtener productos más populares (por número de reseñas)
router.get('/popular', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    
    // Construir pipeline de agregación para MongoDB
    const pipeline = [
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product_id',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          average_rating: { $avg: '$reviews.rating' },
          review_count: { $size: '$reviews' }
        }
      },
      {
        $match: {
          review_count: { $gt: 0 }
        }
      },
      {
        $sort: {
          review_count: -1,
          average_rating: -1
        }
      },
      {
        $limit: limit
      }
    ];
    
    const products = await productsCollection.aggregate(pipeline).toArray();
    
    res.json({
      products: products
    });
  } catch (error) {
    console.error('Error al obtener productos populares:', error.message);
    res.status(500).json({ error: 'Error al obtener productos populares' });
  }
});

// Ruta para obtener un producto por ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    // Verificar que el ID sea válido
    if (!require('mongodb').ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }
    
    const product = await productsCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error.message);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Ruta para obtener productos mejor calificados
router.get('/top-rated', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    
    // Construir pipeline de agregación para MongoDB
    const pipeline = [
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product_id',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          average_rating: { $avg: '$reviews.rating' },
          review_count: { $size: '$reviews' }
        }
      },
      {
        $match: {
          review_count: { $gt: 2 }
        }
      },
      {
        $sort: {
          average_rating: -1,
          review_count: -1
        }
      },
      {
        $limit: limit
      }
    ];
    
    const products = await productsCollection.aggregate(pipeline).toArray();
    
    res.json({
      products: products
    });
  } catch (error) {
    console.error('Error al obtener productos mejor calificados:', error.message);
    res.status(500).json({ error: 'Error al obtener productos mejor calificados' });
  }
});

module.exports = router;