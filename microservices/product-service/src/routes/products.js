const express = require('express');
const router = express.Router();

// Importar modelos de base de datos
const {
  uploadProductImages,
  processUploadedImages,
  validateProductImages,
} = require('../middleware/imageHandler');
const { validateProduct, validateFilters, validateProductId } = require('../middleware/validation');
const Product = require('../models/Product');

// Importar middleware de validación

// Importar middleware de manejo de imágenes

// Importar servicio de cache
const { cacheService, cacheMiddleware } = require('../services/cacheService');

// Ruta para subir imágenes de productos
router.post('/upload-images', (req, res) => {
  uploadProductImages(req, res, (err) => {
    if (err) {
      console.error('❌ Error subiendo imágenes:', err.message);
      return res.status(400).json({
        error: 'Error subiendo imágenes',
        details: err.message,
      });
    }

    processUploadedImages(req, res, () => {
      res.status(200).json({
        message: 'Imágenes subidas exitosamente',
        images: req.body.images,
        total: req.files?.length || 0,
      });
    });
  });
});

// Ruta para crear un producto
router.post('/', validateProduct, validateProductImages, async (req, res) => {
  try {
    const { name, price, category, description, images, quantity } = req.body;

    // Crear un nuevo producto
    const newProduct = new Product({
      name,
      price,
      category,
      description,
      images,
      quantity,
    });

    // Guardar en la base de datos
    const savedProduct = await newProduct.save();

    console.log(`✅ Producto creado: ${savedProduct.id}`);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas específicas (deben ir ANTES de las rutas con parámetros)

// Ruta para obtener todas las categorías disponibles
router.get('/categories', cacheMiddleware(3600), async (req, res) => {
  try {
    const Category = require('../models/Category');
    const categories = await Category.find({ active: true }).sort({ name: 1 });

    console.log(`✅ Categorías obtenidas: ${categories.length} items`);
    res.status(200).json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todas las ocasiones disponibles
router.get('/occasions', cacheMiddleware(3600), async (req, res) => {
  try {
    const Occasion = require('../models/Occasion');
    const occasions = await Occasion.find({ active: true }).sort({ name: 1 });

    console.log(`✅ Ocasiones obtenidas: ${occasions.length} items`);
    res.status(200).json({
      occasions,
      total: occasions.length,
    });
  } catch (error) {
    console.error('❌ Error al obtener ocasiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener estadísticas del catálogo
router.get('/stats', cacheMiddleware(600), async (req, res) => {
  try {
    // Estadísticas básicas
    const totalProducts = await Product.countDocuments({ active: true });
    const featuredCount = await Product.countDocuments({ active: true, featured: true });

    // Estadísticas de precios
    const priceStats = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalStock: { $sum: '$stock' },
        },
      },
    ]);

    // Productos por categoría
    const categoryStats = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Top productos por rating
    const topRated = await Product.find({ active: true })
      .sort({ rating: -1, reviews_count: -1 })
      .limit(5)
      .select('name rating reviews_count price');

    const stats = {
      total: {
        products: totalProducts,
        featured: featuredCount,
        categories: categoryStats.length,
        stock: priceStats[0]?.totalStock || 0,
      },
      prices: {
        average: Math.round(priceStats[0]?.avgPrice || 0),
        min: priceStats[0]?.minPrice || 0,
        max: priceStats[0]?.maxPrice || 0,
        range: `${priceStats[0]?.minPrice || 0} - ${priceStats[0]?.maxPrice || 0}`,
        averageFormatted: `$${Math.round(priceStats[0]?.avgPrice || 0).toLocaleString('es-CL')} CLP`,
      },
      categories: categoryStats,
      topRated,
      generated: new Date().toISOString(),
    };

    console.log('✅ Estadísticas del catálogo generadas');
    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Error al generar estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener productos destacados
router.get('/featured/all', async (req, res) => {
  try {
    const featuredProducts = await Product.findFeatured().sort({ priority: 1, createdAt: -1 });
    console.log(`✅ Productos destacados obtenidos: ${featuredProducts.length} items`);
    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error('❌ Error al obtener productos destacados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener productos por ocasión específica
router.get('/occasion/:occasion', async (req, res) => {
  try {
    const { occasion } = req.params;
    const products = await Product.findByOccasion(occasion).sort({ createdAt: -1 });
    console.log(`✅ Productos por ocasión '${occasion}': ${products.length} items`);
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos por ocasión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener productos por categoría específica
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.findByCategory(category).sort({ createdAt: -1 });
    console.log(`✅ Productos por categoría '${category}': ${products.length} items`);
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos por categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para búsqueda de productos
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const products = await Product.searchProducts(query);
    console.log(`✅ Búsqueda '${query}': ${products.length} resultados`);
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error en búsqueda de productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todos los productos con filtros avanzados
router.get('/', validateFilters, cacheMiddleware(300), async (req, res) => {
  try {
    const { occasion, category, color, minPrice, maxPrice, search, featured, limit, page } =
      req.query;

    // Construir query de MongoDB
    const query = { active: true };

    if (category) {
      query.category = category;
    }

    if (occasion) {
      query.occasions = { $in: [occasion] };
    }

    if (color) {
      query.colors = { $in: [color] };
    }

    if (featured === 'true') {
      query.featured = true;
    } else if (featured === 'false') {
      query.featured = false;
    }

    console.log('🔍 Query construida:', JSON.stringify(query));

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Configurar paginación
    const limitNum = parseInt(limit) || 50;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    let productsQuery;

    if (search) {
      // Búsqueda por texto
      productsQuery = Product.find({
        $and: [query, { $text: { $search: search } }],
      }).sort({ score: { $meta: 'textScore' } });
    } else {
      // Consulta normal
      productsQuery = Product.find(query).sort({ featured: -1, createdAt: -1 });
    }

    const products = await productsQuery.skip(skip).limit(limitNum).lean(); // Para mejor performance

    const total = await Product.countDocuments(query);

    console.log(`✅ Productos obtenidos: ${products.length} de ${total} items`);

    res.status(200).json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un producto por ID (debe ir DESPUÉS de las rutas específicas)
router.get('/:productId', validateProductId, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ id: productId, active: true });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Incrementar contador de vistas
    await product.incrementViews();

    console.log(`✅ Producto ${productId} obtenido de la base de datos`);
    res.status(200).json(product);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para actualizar un producto
router.put('/:id', validateProductId, validateProduct, async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // Actualizar producto en la base de datos
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log(`✅ Producto ${productId} actualizado`);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para eliminar un producto
router.delete('/:id', validateProductId, async (req, res) => {
  try {
    const productId = req.params.id;

    // Eliminar producto de la base de datos
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log(`✅ Producto ${productId} eliminado`);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para poblar la base de datos (solo desarrollo)
router.post('/admin/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Operación no permitida en producción' });
    }

    const seedDatabase = require('../data/seed');
    await seedDatabase();

    // Invalidate product-related caches so new data is immediately visible
    try {
      await cacheService.invalidateProductCache?.();
      console.log('🧹 Cache de productos invalidado tras seed');
    } catch (e) {
      console.warn('⚠️ No se pudo invalidar el cache tras seed:', e?.message || e);
    }

    console.log('✅ Base de datos poblada exitosamente');
    res.status(200).json({
      message: 'Base de datos poblada exitosamente',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    res.status(500).json({ error: 'Error poblando la base de datos' });
  }
});

// Ruta para crear índices de texto para búsqueda (solo desarrollo)
router.post('/admin/create-indexes', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Operación no permitida en producción' });
    }

    // Crear índices de texto para búsqueda
    await Product.createIndexes();

    console.log('✅ Índices creados exitosamente');
    res.status(200).json({
      message: 'Índices de búsqueda creados exitosamente',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error creando índices:', error);
    res.status(500).json({ error: 'Error creando índices de búsqueda' });
  }
});

module.exports = router;
