const express = require('express');
const ReviewController = require('../controllers/reviewController');

const router = express.Router();

// Middleware para inyectar base de datos
let reviewController;
const setDatabase = (db) => {
  reviewController = new ReviewController(db);
};

// Rutas públicas
router.get('/product/:productId', (req, res, next) => {
  reviewController.getReviewsByProduct(req, res, next);
});

// Rutas protegidas (requieren autenticación)
router.post('/product/:productId', (req, res, next) => {
  reviewController.createReview(req, res, next);
});

module.exports = {
  router,
  setDatabase
};