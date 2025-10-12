const express = require('express');
const CartController = require('../controllers/cartController');

const router = express.Router();

// Middleware para inyectar Redis
let cartController;
const setRedis = (redisClient) => {
  cartController = new CartController(redisClient);
};

// Rutas protegidas (requieren autenticación)
router.get('/', (req, res, next) => {
  cartController.getCart(req, res, next);
});

router.post('/items', (req, res, next) => {
  cartController.addItem(req, res, next);
});

router.delete('/items/:productId', (req, res, next) => {
  cartController.removeItem(req, res, next);
});

router.delete('/', (req, res, next) => {
  cartController.clearCart(req, res, next);
});

module.exports = {
  router,
  setRedis
};