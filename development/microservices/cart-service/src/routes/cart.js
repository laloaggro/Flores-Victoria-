const express = require('express');

const CartController = require('../controllers/cartController');

const router = express.Router();

// Middleware para inyectar Redis
let cartController;
const setRedis = (redisClient) => {
  cartController = new CartController(redisClient);
};

// Rutas protegidas (requieren autenticación)
router.get('/', (req, res) => {
  cartController.getCart(req, res);
});

router.post('/items', (req, res) => {
  cartController.addItem(req, res);
});

router.delete('/items/:productId', (req, res) => {
  cartController.removeItem(req, res);
});

router.delete('/', (req, res) => {
  cartController.clearCart(req, res);
});

module.exports = {
  router,
  setRedis,
};
