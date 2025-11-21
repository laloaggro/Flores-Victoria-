const express = require('express');

const router = express.Router();
const logger = require('../logger');

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
} = require('../controllers/productController');
const {
  uploadProductImages,
  processUploadedImages,
  validateProductImages,
} = require('../middleware/imageHandler');
const { validateProduct, validateFilters, validateProductId } = require('../middleware/validation');
const { cacheMiddleware } = require('../services/cacheService');

// Ruta para subir imágenes de productos
router.post('/upload-images', (req, res) => {
  uploadProductImages(req, res, (err) => {
    if (err) {
      logger.error({ service: 'product-service', err: err.message }, 'Error subiendo imágenes');
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
router.post('/', validateProduct, validateProductImages, createProduct);

// Rutas específicas (deben ir ANTES de las rutas con parámetros)

// Ruta para obtener todas las categorías disponibles
router.get('/categories', cacheMiddleware(3600), getCategories);

// Ruta para obtener todas las ocasiones disponibles
router.get('/occasions', cacheMiddleware(3600), getOccasions);

// Ruta para obtener estadísticas del catálogo
router.get('/stats', cacheMiddleware(600), getStats);

// Ruta para obtener productos destacados
router.get('/featured/all', getFeaturedProducts);

// Ruta para obtener productos por ocasión específica
router.get('/occasion/:occasion', getProductsByOccasion);

// Ruta para obtener productos por categoría específica
router.get('/category/:category', getProductsByCategory);

// Ruta para búsqueda de productos
router.get('/search/:query', searchProducts);

// Ruta para obtener todos los productos con filtros avanzados
router.get('/', validateFilters, cacheMiddleware(300), getProducts);

// Ruta para obtener un producto por ID (debe ir DESPUÉS de las rutas específicas)
router.get('/:productId', validateProductId, getProductById);

// Ruta para actualizar un producto
router.put('/:id', validateProductId, validateProduct, updateProduct);

// Ruta para eliminar un producto
router.delete('/:id', validateProductId, deleteProduct);

// Ruta para poblar la base de datos (solo desarrollo)
router.post('/admin/seed', seedDatabase);

// Ruta para crear índices de texto para búsqueda (solo desarrollo)
router.post('/admin/create-indexes', createIndexes);

module.exports = router;
