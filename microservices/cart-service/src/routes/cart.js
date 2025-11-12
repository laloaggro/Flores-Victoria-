const express = require('express');

const { asyncHandler } = require('../../shared/middleware/error-handler');
const { validateBody, validateParams, Joi } = require('../../shared/middleware/validator');

const CartController = require('../controllers/cartController');

const router = express.Router();

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

// GET /api/cart - Obtener carrito del usuario
router.get(
  '/',
  asyncHandler(async (req, res) => {
    await cartController.getCart(req, res);
  })
);

// POST /api/cart/items - Agregar item al carrito
router.post(
  '/items',
  validateBody(addItemSchema),
  asyncHandler(async (req, res) => {
    await cartController.addItem(req, res);
  })
);

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
