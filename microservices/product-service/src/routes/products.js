const express = require('express');

const router = express.Router();

const { NotFoundError, BadRequestError } = require('../../../../shared/errors/AppError');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { validateProduct, validateFilters, validateProductId } = require('../middleware/validation');
const {
  uploadProductImages,
  processUploadedImages,
  validateProductImages,
} = require('../middleware/imageHandler');
const Product = require('../models/Product');
const { cacheService, cacheMiddleware } = require('../services/cacheService');

// Ruta para subir imágenes de productos
router.post('/upload-images', (req, res) => {
  uploadProductImages(req, res, (err) => {
    if (err) {
      console.error(' Error subiendo imágenes:', err.message);
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
router.post(
  '/',
  validateProduct,
  validateProductImages,
  asyncHandler(async (req, res) => {
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

    req.log.info('Product created', { productId: savedProduct.id, name: savedProduct.name });
    res.status(201).json(savedProduct);
  })
);

// Rutas específicas (deben ir ANTES de las rutas con parámetros)

// Ruta para obtener todas las categorías disponibles
router.get(
  '/categories',
  cacheMiddleware(3600),
  asyncHandler(async (req, res) => {
    const Category = require('../models/Category');
    const categories = await Category.find({ active: true }).sort({ name: 1 });

    req.log.info('Categories retrieved', { count: categories.length });
    res.status(200).json({
      categories,
      total: categories.length,
    });
  })
);

// Ruta para obtener todas las ocasiones disponibles
router.get(
  '/occasions',
  cacheMiddleware(3600),
  asyncHandler(async (req, res) => {
    const Occasion = require('../models/Occasion');
    const occasions = await Occasion.find({ active: true }).sort({ name: 1 });

    req.log.info('Occasions retrieved', { count: occasions.length });
    res.status(200).json({
      occasions,
      total: occasions.length,
    });
  })
);

// Ruta para obtener estadísticas del catálogo
router.get(
  '/stats',
  cacheMiddleware(600),
  asyncHandler(async (req, res) => {
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

    req.log.info('Stats generated', { total: totalProducts, categories: categoryStats.length });
    res.status(200).json(stats);
  })
);

// Ruta para obtener productos destacados
router.get(
  '/featured/all',
  asyncHandler(async (req, res) => {
    const featuredProducts = await Product.findFeatured().sort({ priority: 1, createdAt: -1 });
    req.log.info('Featured products retrieved', { count: featuredProducts.length });
    res.status(200).json(featuredProducts);
  })
);

// Ruta para obtener productos por ocasión específica
router.get(
  '/occasion/:occasion',
  asyncHandler(async (req, res) => {
    const { occasion } = req.params;
    const products = await Product.findByOccasion(occasion).sort({ createdAt: -1 });
    req.log.info('Products by occasion retrieved', { occasion, count: products.length });
    res.status(200).json(products);
  })
);

// Ruta para obtener productos por categoría específica
router.get(
  '/category/:category',
  asyncHandler(async (req, res) => {
    const { category } = req.params;
    const products = await Product.findByCategory(category).sort({ createdAt: -1 });
    req.log.info('Products by category retrieved', { category, count: products.length });
    res.status(200).json(products);
  })
);

// Ruta para búsqueda de productos
router.get(
  '/search/:query',
  asyncHandler(async (req, res) => {
    const { query } = req.params;
    const products = await Product.searchProducts(query);
    req.log.info('Product search completed', { query, results: products.length });
    res.status(200).json(products);
  })
);

// Ruta para obtener todos los productos con filtros avanzados
router.get(
  '/',
  validateFilters,
  cacheMiddleware(300),
  asyncHandler(async (req, res) => {
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

    const products = await productsQuery.skip(skip).limit(limitNum).lean();

    const total = await Product.countDocuments(query);

    req.log.info('Products retrieved', { count: products.length, total, page: pageNum });

    res.status(200).json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  })
);

// Ruta para obtener un producto por ID (debe ir DESPUÉS de las rutas específicas)
router.get(
  '/:productId',
  validateProductId,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findOne({ id: productId, active: true });

    if (!product) {
      throw new NotFoundError('Product', { id: productId });
    }

    // Incrementar contador de vistas
    await product.incrementViews();

    req.log.info('Product retrieved', { productId, views: product.views });
    res.status(200).json(product);
  })
);

// Ruta para actualizar un producto
router.put(
  '/:id',
  validateProductId,
  validateProduct,
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      throw new NotFoundError('Product', { id: productId });
    }

    req.log.info('Product updated', { productId, name: updatedProduct.name });
    res.status(200).json(updatedProduct);
  })
);

// Ruta para eliminar un producto
router.delete(
  '/:id',
  validateProductId,
  asyncHandler(async (req, res) => {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      throw new NotFoundError('Product', { id: productId });
    }

    req.log.info('Product deleted', { productId, name: deletedProduct.name });
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  })
);

// Ruta para poblar la base de datos (solo desarrollo)
router.post(
  '/admin/seed',
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Operación no permitida en producción' });
    }

    const seedDatabase = require('../data/seed');
    await seedDatabase();

    // Invalidate product-related caches so new data is immediately visible
    try {
      await cacheService.invalidateProductCache?.();
    } catch (e) {
      req.log.warn('Could not invalidate cache after seed', { error: e?.message || e });
    }

    req.log.info('Database seeded successfully');
    res.status(200).json({
      message: 'Base de datos poblada exitosamente',
      timestamp: new Date().toISOString(),
    });
  })
);

// Ruta para crear índices de texto para búsqueda (solo desarrollo)
router.post(
  '/admin/create-indexes',
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Operación no permitida en producción' });
    }

    await Product.createIndexes();

    req.log.info('Search indexes created successfully');
    res.status(200).json({
      message: 'Índices de búsqueda creados exitosamente',
      timestamp: new Date().toISOString(),
    });
  })
);

module.exports = router;
