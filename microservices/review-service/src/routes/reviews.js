const express = require('express');
const jwt = require('jsonwebtoken');
const ReviewController = require('../controllers/reviewController');

const router = express.Router();

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    // El token usa userId pero el controller espera id
    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido o expirado',
    });
  }
};

// Middleware para inyectar base de datos
let reviewController;
const setDatabase = (db) => {
  reviewController = new ReviewController(db);
};

// Rutas públicas
router.get('/product/:productId', (req, res) => {
  reviewController.getReviewsByProduct(req, res);
});

// Rutas protegidas (requieren autenticación)
router.post('/product/:productId', authMiddleware, (req, res) => {
  reviewController.createReview(req, res);
});

module.exports = {
  router,
  setDatabase,
};
