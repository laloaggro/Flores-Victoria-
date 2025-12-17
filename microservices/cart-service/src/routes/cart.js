const express = require('express');
const { asyncHandler } = require('@flores-victoria/shared/middleware/error-handler');
const {
  validateBody,
  validateParams,
  Joi,
} = require('@flores-victoria/shared/middleware/validation');
const CartController = require('../controllers/cartController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Shopping cart management
 *
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           example: "prod-001"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         price:
 *           type: number
 *           example: 29990
 *     Cart:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: "user-123"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         total:
 *           type: number
 *           example: 59980
 *         itemCount:
 *           type: integer
 *           example: 2
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ═══════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

const addItemSchema = Joi.object({
  productId: Joi.string().trim().min(1).required(),
  quantity: Joi.number().integer().min(1).max(100).required(),
  price: Joi.number().positive().optional(),
});

const productIdParam = Joi.object({
  productId: Joi.string().trim().min(1).required(),
});

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

// Middleware para inyectar Redis
let cartController;
const setRedis = (redisClient) => {
  cartController = new CartController(redisClient);
};

// ═══════════════════════════════════════════════════════════════
// RUTAS (Requieren autenticación - verificado en app.js)
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get user's cart
 *     description: Retrieve the current user's shopping cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// GET /api/cart - Obtener carrito del usuario
router.get(
  '/',
  asyncHandler(async (req, res) => {
    await cartController.getCart(req, res);
  })
);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     description: Add a product to the user's shopping cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "prod-001"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 example: 2
 *               price:
 *                 type: number
 *                 example: 29990
 *     responses:
 *       200:
 *         description: Item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// POST /api/cart/items - Agregar item al carrito
router.post(
  '/items',
  validateBody(addItemSchema),
  asyncHandler(async (req, res) => {
    await cartController.addItem(req, res);
  })
);

/**
 * @swagger
 * /cart/items/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     description: Remove a specific product from the user's cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove
 *     responses:
 *       200:
 *         description: Item removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
// DELETE /api/cart/items/:productId - Remover item del carrito
router.delete(
  '/items/:productId',
  validateParams(productIdParam),
  asyncHandler(async (req, res) => {
    await cartController.removeItem(req, res);
  })
);

// DELETE /api/cart - Limpiar carrito
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await cartController.clearCart(req, res);
  })
);

module.exports = {
  router,
  setRedis,
};
