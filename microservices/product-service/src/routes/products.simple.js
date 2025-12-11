// routes/products.simple.js - Rutas simplificadas
const express = require('express');
const {
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
} = require('../controllers/productController.simple');

const router = express.Router();

// Public routes - rutas específicas ANTES de /:id
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/occasions', getOccasions);
router.get('/stats', getStats);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/occasion/:occasionId', getProductsByOccasion);

// Rutas generales - DESPUÉS de las específicas
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes (sin autenticación por ahora)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Development routes
if (process.env.NODE_ENV !== 'production') {
  router.post('/seed', seedDatabase);
  router.post('/indexes', createIndexes);
}

module.exports = router;
