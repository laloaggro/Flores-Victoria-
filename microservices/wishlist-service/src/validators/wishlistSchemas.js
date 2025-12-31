/**
 * Schemas de validación para Wishlist Service
 */

const { Joi, commonSchemas } = require('../../../shared/middleware/validation');

// Schema para item de wishlist
const wishlistItemSchema = Joi.object({
  productId: Joi.string().trim().required(),
  name: Joi.string().trim().min(3).max(200).required(),
  price: commonSchemas.price,
  image: commonSchemas.url.optional(),
  inStock: Joi.boolean().default(true),
  addedAt: Joi.date()
    .iso()
    .default(() => new Date()),
});

// Schema para agregar item
const addItemSchema = Joi.object({
  productId: Joi.string().trim().required(),
  name: Joi.string().trim().min(3).max(200).required(),
  price: commonSchemas.price,
  image: commonSchemas.url.optional(),
});

// Schema para compartir wishlist
const shareWishlistSchema = Joi.object({
  email: commonSchemas.email.optional(),
  shareLink: Joi.boolean().default(false),
  expiresIn: Joi.number().integer().min(1).max(365).default(30), // días
});

module.exports = {
  wishlistItemSchema,
  addItemSchema,
  shareWishlistSchema,
};
