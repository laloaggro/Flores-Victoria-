const express = require('express');

const ProductController = require('../controllers/productController');

const router = express.Router();

// Middleware para inyectar base de datos
let productController;
const setDatabase = (db) => {
  productController = new ProductController(db);
};

// Rutas públicas (sin autenticación)
router.get('/', (req, res) => {
  // En la ruta raíz, devolver todos los productos (como hace /all)
  productController.getAllProducts(req, res);
});

router.get('/all', (req, res) => {
  productController.getAllProducts(req, res);
});

router.get('/:id', (req, res) => {
  productController.getProductById(req, res);
});

// Rutas protegidas (requieren autenticación)
router.post('/', (req, res) => {
  // TODO: Implementar autenticación
  productController.createProduct(req, res);
});

router.put('/:id', (req, res) => {
  // TODO: Implementar autenticación
  productController.updateProduct(req, res);
});

router.delete('/:id', (req, res) => {
  // TODO: Implementar autenticación
  productController.deleteProduct(req, res);
});

module.exports = {
  router,
  setDatabase,
};
