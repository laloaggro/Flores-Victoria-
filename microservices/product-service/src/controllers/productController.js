const { NotFoundError } = require('../../../../shared/errors/AppError');
const logger = require('../logger');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const Category = require('../models/Category');
const Occasion = require('../models/Occasion');
const Product = require('../models/Product');
const { cacheService } = require('../services/cacheService');

/**
 * Crear un nuevo producto
 * @route POST /api/products
 */
const createProduct = asyncHandler(async (req, res) => {
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

  // Usar el logger inyectado en req si existe, o console como fallback
  if (req.log) {
    req.log.info('Product created', { productId: savedProduct.id, name: savedProduct.name });
  }

  res.status(201).json(savedProduct);
});

/**
 * Obtener todas las categorías disponibles
 * @route GET /api/products/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ active: true }).sort({ name: 1 });

  if (req.log) {
    req.log.info('Categories retrieved', { count: categories.length });
  }
  res.status(200).json({
    categories,
    total: categories.length,
  });
});

/**
 * Obtener todas las ocasiones disponibles
 * @route GET /api/products/occasions
 */
const getOccasions = asyncHandler(async (req, res) => {
  const occasions = await Occasion.find({ active: true }).sort({ name: 1 });

  if (req.log) {
    req.log.info('Occasions retrieved', { count: occasions.length });
  }
  res.status(200).json({
    occasions,
    total: occasions.length,
  });
});

/**
 * Obtener estadísticas del catálogo
 * @route GET /api/products/stats
 */
const getStats = asyncHandler(async (req, res) => {
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

  if (req.log) {
    req.log.info('Stats generated', { total: totalProducts, categories: categoryStats.length });
  }
  res.status(200).json(stats);
});

/**
 * Obtener productos destacados
 * @route GET /api/products/featured/all
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const featuredProducts = await Product.findFeatured().sort({ priority: 1, createdAt: -1 });
  if (req.log) {
    req.log.info('Featured products retrieved', { count: featuredProducts.length });
  }
  res.status(200).json(featuredProducts);
});

/**
 * Obtener productos por ocasión específica
 * @route GET /api/products/occasion/:occasion
 */
const getProductsByOccasion = asyncHandler(async (req, res) => {
  const { occasion } = req.params;
  const products = await Product.findByOccasion(occasion).sort({ createdAt: -1 });
  if (req.log) {
    req.log.info('Products by occasion retrieved', { occasion, count: products.length });
  }
  res.status(200).json(products);
});

/**
 * Obtener productos por categoría específica
 * @route GET /api/products/category/:category
 */
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const products = await Product.findByCategory(category).sort({ createdAt: -1 });
  if (req.log) {
    req.log.info('Products by category retrieved', { category, count: products.length });
  }
  res.status(200).json(products);
});

/**
 * Búsqueda de productos
 * @route GET /api/products/search/:query
 */
const searchProducts = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const products = await Product.searchProducts(query);
  if (req.log) {
    req.log.info('Product search completed', { query, results: products.length });
  }
  res.status(200).json(products);
});

/**
 * Obtener todos los productos con filtros avanzados
 * @route GET /api/products
 */
const getProducts = asyncHandler(async (req, res) => {
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

  if (req.log) {
    req.log.info('Products retrieved', { count: products.length, total, page: pageNum });
  }

  res.status(200).json({
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * Obtener un producto por ID
 * @route GET /api/products/:productId
 */
const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findOne({ id: productId, active: true });

  if (!product) {
    throw new NotFoundError('Product', { id: productId });
  }

  // Incrementar contador de vistas
  await product.incrementViews();

  if (req.log) {
    req.log.info('Product retrieved', { productId, views: product.views });
  }
  res.status(200).json(product);
});

/**
 * Actualizar un producto
 * @route PUT /api/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const updateData = req.body;

  const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    throw new NotFoundError('Product', { id: productId });
  }

  if (req.log) {
    req.log.info('Product updated', { productId, name: updatedProduct.name });
  }
  res.status(200).json(updatedProduct);
});

/**
 * Eliminar un producto
 * @route DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  const deletedProduct = await Product.findByIdAndDelete(productId);

  if (!deletedProduct) {
    throw new NotFoundError('Product', { id: productId });
  }

  if (req.log) {
    req.log.info('Product deleted', { productId, name: deletedProduct.name });
  }
  res.status(200).json({ message: 'Producto eliminado correctamente' });
});

/**
 * Poblar la base de datos (solo desarrollo)
 * @route POST /api/products/admin/seed
 */
const seedDatabase = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Operación no permitida en producción' });
  }

  const seedDatabaseFn = require('../data/seed');
  await seedDatabaseFn();

  // Invalidate product-related caches so new data is immediately visible
  try {
    await cacheService.invalidateProductCache?.();
  } catch (e) {
    if (req.log) {
      req.log.warn('Could not invalidate cache after seed', { error: e?.message || e });
    }
  }

  if (req.log) {
    req.log.info('Database seeded successfully');
  }
  res.status(200).json({
    message: 'Base de datos poblada exitosamente',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Crear índices de texto para búsqueda (solo desarrollo)
 * @route POST /api/products/admin/create-indexes
 */
const createIndexes = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Operación no permitida en producción' });
  }

  await Product.createIndexes();

  if (req.log) {
    req.log.info('Search indexes created successfully');
  }
  res.status(200).json({
    message: 'Índices de búsqueda creados exitosamente',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  createProduct,
  getCategories,
  getOccasions,
  getStats,
  getFeaturedProducts,
  getProductsByOccasion,
  getProductsByCategory,
  searchProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  seedDatabase,
  createIndexes,
};
