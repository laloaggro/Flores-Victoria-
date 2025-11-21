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
} = require('../controllers/productController');
const logger = require('../logger');
const {
  uploadProductImages,
  processUploadedImages,
  validateProductImages,
} = require('../middleware/imageHandler');
const { validateProduct, validateFilters, validateProductId } = require('../middleware/validation');
const { cacheMiddleware } = require('../services/cacheService');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product management and retrieval
 *   - name: Categories
 *     description: Product categories
 *   - name: Occasions
 *     description: Special occasions for products
 */

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

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     description: Create a new product in the catalog (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// Ruta para crear un producto
router.post('/', validateProduct, validateProductImages, createProduct);

// Rutas específicas (deben ir ANTES de las rutas con parámetros)

/**
 * @swagger
 * /products/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all product categories
 *     description: Retrieve list of all available product categories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["ramos", "arreglos", "plantas", "cestas"]
 */
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

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products with optional filters
 *     description: Retrieve a paginated list of products with optional filtering by category, occasion, price range, etc.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (ramos, arreglos, plantas, etc.)
 *       - in: query
 *         name: occasion
 *         schema:
 *           type: string
 *         description: Filter by occasion (cumpleaños, aniversario, etc.)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Ruta para obtener todos los productos con filtros avanzados
router.get('/', validateFilters, cacheMiddleware(300), getProducts);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     description: Retrieve detailed information about a specific product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product unique identifier
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique product identifier
 *           example: "prod-001"
 *         name:
 *           type: string
 *           description: Product name
 *           example: "Rosas Rojas Románticas"
 *         description:
 *           type: string
 *           description: Detailed product description
 *           example: "Hermoso ramo de 12 rosas rojas premium"
 *         price:
 *           type: number
 *           format: float
 *           description: Product price in CLP
 *           example: 29990
 *         category:
 *           type: string
 *           description: Product category
 *           example: "ramos"
 *         occasion:
 *           type: array
 *           items:
 *             type: string
 *           description: Occasions this product is suitable for
 *           example: ["amor", "aniversario"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *           example: ["/images/products/roses-red-001.jpg"]
 *         stock:
 *           type: integer
 *           description: Available stock
 *           example: 15
 *         featured:
 *           type: boolean
 *           description: Whether product is featured
 *           example: true
 *         rating:
 *           type: number
 *           format: float
 *           description: Average rating (0-5)
 *           example: 4.5
 *         discount:
 *           type: number
 *           description: Discount percentage
 *           example: 10
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: "Rosas Rojas Románticas"
 *         description:
 *           type: string
 *           minLength: 10
 *           example: "Hermoso ramo de 12 rosas rojas premium"
 *         price:
 *           type: number
 *           minimum: 0
 *           example: 29990
 *         category:
 *           type: string
 *           enum: [ramos, arreglos, plantas, cestas, flores_individuales]
 *           example: "ramos"
 *         occasion:
 *           type: array
 *           items:
 *             type: string
 *           example: ["amor", "aniversario"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["/images/products/roses-red-001.jpg"]
 *         stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 15
 *         featured:
 *           type: boolean
 *           default: false
 *           example: true
 *         discount:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *           example: 10
 */

/**
 * @swagger
 * /products/cache/metrics:
 *   get:
 *     tags: [Products]
 *     summary: Get cache performance metrics
 *     description: Retrieve cache hit rate and performance statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hits:
 *                   type: number
 *                   example: 1250
 *                 misses:
 *                   type: number
 *                   example: 350
 *                 errors:
 *                   type: number
 *                   example: 5
 *                 hitRate:
 *                   type: string
 *                   example: "78.13%"
 *                 total:
 *                   type: number
 *                   example: 1600
 */
router.get('/cache/metrics', (req, res) => {
  const { cacheService } = require('../services/cacheService');
  const metrics = cacheService.getMetrics();
  res.status(200).json({
    status: 'success',
    data: metrics,
  });
});

module.exports = router;
