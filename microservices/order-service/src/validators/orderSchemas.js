/**
 * Schemas de validación para Order Service
 */

const { Joi, commonSchemas } = require('../../../shared/middleware/validation');

// Schema para item de orden
const orderItemSchema = Joi.object({
  productId: Joi.string().trim().required(),
  name: Joi.string().trim().min(3).max(200).required(),
  price: commonSchemas.price,
  quantity: commonSchemas.quantity,
  image: commonSchemas.url.optional(),
  extras: Joi.array().items(Joi.string().trim()).optional(),
});

// Schema para crear orden
const createOrderSchema = Joi.object({
  userId: Joi.string().trim().required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  shippingAddress: commonSchemas.address.required(),
  billingAddress: commonSchemas.address.optional(),
  paymentMethod: Joi.string().valid('card', 'cash', 'transfer', 'paypal').required(),
  deliveryDate: Joi.date().iso().min('now').required(),
  deliveryTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Delivery time must be in HH:MM format',
    }),
  notes: Joi.string().trim().max(500).optional(),
  couponCode: Joi.string().trim().uppercase().max(50).optional(),
  giftMessage: Joi.string().trim().max(300).optional(),
  recipientName: Joi.string().trim().min(2).max(100).optional(),
  recipientPhone: commonSchemas.phone.optional(),
});

// Schema para actualizar orden
const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled')
    .optional(),
  trackingNumber: Joi.string().trim().max(100).optional(),
  deliveryDate: Joi.date().iso().optional(),
  deliveryTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  notes: Joi.string().trim().max(500).optional(),
  cancelReason: Joi.string().trim().max(500).when('status', {
    is: 'cancelled',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
}).min(1); // Al menos un campo debe estar presente

// Schema para filtros de búsqueda
const orderFiltersSchema = Joi.object({
  userId: Joi.string().trim().optional(),
  status: Joi.string()
    .valid('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled')
    .optional(),
  paymentMethod: Joi.string().valid('card', 'cash', 'transfer', 'paypal').optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional(),
  minTotal: Joi.number().positive().optional(),
  maxTotal: Joi.number().positive().min(Joi.ref('minTotal')).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('createdAt', 'total', 'deliveryDate').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

// Schema para calificar orden
const rateOrderSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().trim().min(10).max(1000).optional(),
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  orderFiltersSchema,
  rateOrderSchema,
  orderItemSchema,
};
