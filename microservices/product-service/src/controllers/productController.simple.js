// productController.simple.js - Sin dependencias de shared
const Product = require('../models/Product');
const Category = require('../models/Category');
const Occasion = require('../models/Occasion');
const logger = require('../logger.simple');

// Helper: asyncHandler simplificado
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Obtener todos los productos
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, occasion, minPrice, maxPrice, inStock, featured } = req.query;
  
  const filter = {};
  
  if (category) filter.category = category;
  if (occasion) filter.occasions = occasion;
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (featured === 'true') filter.featured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter)
    .populate('category')
    .populate('occasions')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

/**
 * Obtener producto por ID
 */
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category')
    .populate('occasions');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado',
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

/**
 * Crear producto
 */
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  
  res.status(201).json({
    success: true,
    data: product,
  });
});

/**
 * Actualizar producto
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado',
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

/**
 * Eliminar producto
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado',
    });
  }

  res.json({
    success: true,
    message: 'Producto eliminado',
  });
});

/**
 * Buscar productos
 */
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  const products = await Product.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ],
  })
    .populate('category')
    .populate('occasions')
    .limit(20);

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

/**
 * Obtener productos destacados
 */
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true })
    .populate('category')
    .populate('occasions')
    .limit(10);

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

/**
 * Obtener productos por categoría
 */
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ category: req.params.categoryId })
    .populate('category')
    .populate('occasions');

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

/**
 * Obtener productos por ocasión
 */
exports.getProductsByOccasion = asyncHandler(async (req, res) => {
  const products = await Product.find({ occasions: req.params.occasionId })
    .populate('category')
    .populate('occasions');

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

/**
 * Obtener categorías
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  
  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/**
 * Obtener ocasiones
 */
exports.getOccasions = asyncHandler(async (req, res) => {
  const occasions = await Occasion.find();
  
  res.json({
    success: true,
    count: occasions.length,
    data: occasions,
  });
});

/**
 * Obtener estadísticas
 */
exports.getStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const inStockProducts = await Product.countDocuments({ stock: { $gt: 0 } });
  const totalCategories = await Category.countDocuments();
  const totalOccasions = await Occasion.countDocuments();

  res.json({
    success: true,
    data: {
      totalProducts,
      inStockProducts,
      outOfStockProducts: totalProducts - inStockProducts,
      totalCategories,
      totalOccasions,
    },
  });
});

/**
 * Seed database (desarrollo)
 */
exports.seedDatabase = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'No disponible en producción',
    });
  }

  // Crear categorías de ejemplo
  await Category.deleteMany({});
  const categories = await Category.insertMany([
    { name: 'Rosas', slug: 'rosas', description: 'Arreglos de rosas' },
    { name: 'Mixtos', slug: 'mixtos', description: 'Arreglos mixtos' },
  ]);

  // Crear ocasiones de ejemplo
  await Occasion.deleteMany({});
  const occasions = await Occasion.insertMany([
    { name: 'Cumpleaños', slug: 'cumpleanos' },
    { name: 'Aniversario', slug: 'aniversario' },
  ]);

  // Crear productos de ejemplo
  await Product.deleteMany({});
  await Product.insertMany([
    {
      name: 'Rosas Rojas Clásicas',
      description: 'Hermoso arreglo de 12 rosas rojas',
      price: 45.99,
      stock: 10,
      category: categories[0]._id,
      occasions: [occasions[0]._id, occasions[1]._id],
      featured: true,
      images: ['https://via.placeholder.com/400'],
    },
    {
      name: 'Bouquet Primaveral',
      description: 'Mezcla de flores de temporada',
      price: 35.99,
      stock: 15,
      category: categories[1]._id,
      occasions: [occasions[0]._id],
      images: ['https://via.placeholder.com/400'],
    },
  ]);

  res.json({
    success: true,
    message: 'Base de datos poblada exitosamente',
  });
});

/**
 * Crear índices
 */
exports.createIndexes = asyncHandler(async (req, res) => {
  await Product.createIndexes();
  await Category.createIndexes();
  await Occasion.createIndexes();

  res.json({
    success: true,
    message: 'Índices creados',
  });
});
