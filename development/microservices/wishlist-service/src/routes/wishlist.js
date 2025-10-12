const express = require('express');
const WishlistController = require('../controllers/wishlistController');

const router = express.Router();

// Middleware para inyectar Redis
let wishlistController;
const setRedis = (redisClient) => {
  wishlistController = new WishlistController(redisClient);
};

// Rutas protegidas (requieren autenticación)
router.get('/', (req, res) => {
  wishlistController.getWishlist(req, res);
});

router.post('/items', (req, res) => {
  wishlistController.addItem(req, res);
});

router.delete('/items/:productId', (req, res) => {
  wishlistController.removeItem(req, res);
});

router.delete('/', (req, res) => {
  wishlistController.clearWishlist(req, res);
});

module.exports = {
  router,
  setRedis
};