const express = require('express');
const OrderController = require('../controllers/orderController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - name
 *         - price
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID
 *           example: "prod_123"
 *         name:
 *           type: string
 *           description: Product name
 *           example: "Ramo de rosas rojas"
 *         price:
 *           type: number
 *           format: float
 *           description: Product price per unit
 *           example: 25000
 *         quantity:
 *           type: integer
 *           description: Quantity ordered
 *           minimum: 1
 *           example: 2
 *         imageUrl:
 *           type: string
 *           description: Product image URL
 *           example: "/uploads/products/roses.jpg"
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Order ID
 *           example: "order_abc123"
 *         userId:
 *           type: string
 *           description: User who placed the order
 *           example: "user_123"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         total:
 *           type: number
 *           format: float
 *           description: Total order amount
 *           example: 50000
 *         status:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *           default: pending
 *           example: "pending"
 *         shippingAddress:
 *           type: string
 *           description: Delivery address
 *           example: "Av. Providencia 123, Santiago"
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, debit_card, transfer, cash]
 *           example: "credit_card"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-21T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-21T10:30:00Z"
 *
 *     OrderInput:
 *       type: object
 *       required:
 *         - items
 *         - total
 *         - shippingAddress
 *         - paymentMethod
 *       properties:
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         total:
 *           type: number
 *           format: float
 *           minimum: 0
 *           example: 50000
 *         shippingAddress:
 *           type: string
 *           minLength: 10
 *           example: "Av. Providencia 123, Santiago"
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, debit_card, transfer, cash]
 *           example: "credit_card"
 */

// Middleware para inyectar base de datos
let orderController;
const setDatabase = (db) => {
  orderController = new OrderController(db);
};

// Rutas protegidas (requieren autenticación)

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
router.post('/', (req, res) => {
  orderController.createOrder(req, res);
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
router.get('/', (req, res) => {
  orderController.getUserOrders(req, res);
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get('/:id', (req, res) => {
  orderController.getOrderById(req, res);
});

module.exports = {
  router,
  setDatabase,
};
