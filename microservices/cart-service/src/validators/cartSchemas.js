/**
 * Schemas de validación para Cart Service
 */

const { Joi, commonSchemas } = require('../../shared/middleware/validation');

// Schema para item de carrito
const cartItemSchema = Joi.object({
  productId: Joi.string().trim().required(),
  name: Joi.string().trim().min(3).max(200).required(),
  price: commonSchemas.price,
  quantity: commonSchemas.quantity,
  image: commonSchemas.url.optional(),
  maxQuantity: Joi.number().integer().min(1).optional(),
  extras: Joi.array().items(Joi.string().trim()).optional(),
});

// Schema para agregar item al carrito
const addItemSchema = Joi.object({
  productId: Joi.string().trim().required(),
  name: Joi.string().trim().min(3).max(200).required(),
  price: commonSchemas.price,
  quantity: Joi.number().integer().min(1).max(99).default(1),
  image: commonSchemas.url.optional(),
  extras: Joi.array().items(Joi.string().trim()).max(10).optional(),
});

// Schema para actualizar cantidad
const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(99).required(),
});

// Schema para aplicar cupón
const applyCouponSchema = Joi.object({
  couponCode: Joi.string().trim().uppercase().min(3).max(50).required(),
});

module.exports = {
  cartItemSchema,
  addItemSchema,
  updateQuantitySchema,
  applyCouponSchema,
};
