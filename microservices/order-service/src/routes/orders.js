const express = require('express');
const OrderController = require('../controllers/orderController');

const router = express.Router();

// Middleware para inyectar base de datos
let orderController;
const setDatabase = (db) => {
  orderController = new OrderController(db);
};

// Rutas protegidas (requieren autenticación)
router.post('/', (req, res) => {
  orderController.createOrder(req, res);
});

router.get('/', (req, res) => {
  orderController.getUserOrders(req, res);
});

router.get('/:id', (req, res) => {
  orderController.getOrderById(req, res);
});

module.exports = {
  router,
  setDatabase
};