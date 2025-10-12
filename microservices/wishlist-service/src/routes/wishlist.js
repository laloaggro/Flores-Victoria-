const express = require('express');
const WishlistController = require('../controllers/wishlistController');

const router = express.Router();

// Middleware para inyectar Redis
let wishlistController;
const setRedis = (redisClient) => {
  wishlistController = new WishlistController(redisClient);
};

// Rutas protegidas (requieren autenticación)
router.get('/', (req, res, next) => {
  wishlistController.getWishlist(req, res, next);
});

router.post('/items', (req, res, next) => {
  wishlistController.addItem(req, res, next);
});

router.delete('/items/:productId', (req, res, next) => {
  wishlistController.removeItem(req, res, next);
});

router.delete('/', (req, res, next) => {
  wishlistController.clearWishlist(req, res, next);
});

module.exports = {
  router,
  setRedis
};