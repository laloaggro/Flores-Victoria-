const express = require('express');
const OrderController = require('../controllers/orderController');

const router = express.Router();

// Middleware para inyectar base de datos
let orderController;
const setDatabase = (db) => {
  orderController = new OrderController(db);
};

// Rutas protegidas (requieren autenticación)
router.post('/', (req, res, next) => {
  orderController.createOrder(req, res, next);
});

router.get('/', (req, res, next) => {
  orderController.getUserOrders(req, res, next);
});

router.get('/:id', (req, res, next) => {
  orderController.getOrderById(req, res, next);
});

module.exports = {
  router,
  setDatabase
};