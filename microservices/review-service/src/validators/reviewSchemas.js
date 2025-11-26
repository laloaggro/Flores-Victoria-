/**
 * Schemas de validación para Review Service
 */

const { Joi, commonSchemas } = require('@flores-victoria/shared/middleware/validation');

// Schema para crear reseña
const createReviewSchema = Joi.object({
  productId: Joi.string().trim().required(),
  userId: Joi.string().trim().required(),
  orderId: Joi.string().trim().optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().min(5).max(100).required(),
  comment: Joi.string().trim().min(10).max(1000).required(),
  pros: Joi.array().items(Joi.string().trim().max(200)).max(5).optional(),
  cons: Joi.array().items(Joi.string().trim().max(200)).max(5).optional(),
  wouldRecommend: Joi.boolean().default(true),
  isVerifiedPurchase: Joi.boolean().default(false),
  images: Joi.array().items(commonSchemas.url).max(5).optional(),
});

// Schema para actualizar reseña
const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  title: Joi.string().trim().min(5).max(100).optional(),
  comment: Joi.string().trim().min(10).max(1000).optional(),
  pros: Joi.array().items(Joi.string().trim().max(200)).max(5).optional(),
  cons: Joi.array().items(Joi.string().trim().max(200)).max(5).optional(),
  wouldRecommend: Joi.boolean().optional(),
  images: Joi.array().items(commonSchemas.url).max(5).optional(),
}).min(1);

// Schema para filtros de reseñas
const reviewFiltersSchema = Joi.object({
  productId: Joi.string().trim().optional(),
  userId: Joi.string().trim().optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  minRating: Joi.number().integer().min(1).max(5).optional(),
  maxRating: Joi.number().integer().min(1).max(5).optional(),
  isVerifiedPurchase: Joi.boolean().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('createdAt', 'rating', 'helpful').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

// Schema para marcar reseña como útil
const markHelpfulSchema = Joi.object({
  helpful: Joi.boolean().required(),
});

// Schema para respuesta a reseña (por el vendedor)
const respondToReviewSchema = Joi.object({
  response: Joi.string().trim().min(10).max(500).required(),
  respondedBy: Joi.string().trim().required(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  reviewFiltersSchema,
  markHelpfulSchema,
  respondToReviewSchema,
};
