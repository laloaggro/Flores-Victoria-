const { Joi, commonSchemas } = require('../../../shared/middleware/validation');

// Schema de validación para crear/actualizar productos
const productSchema = Joi.object({
  id: Joi.string().trim().when('$isUpdate', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  name: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  price: Joi.number().positive().integer().required(),
  original_price: Joi.number().positive().integer().optional(),
  category: Joi.string().trim().required(),
  stock: Joi.number().integer().min(0).default(0),
  featured: Joi.boolean().default(false),
  active: Joi.boolean().default(true),
  rating: Joi.number().min(0).max(5).optional(),
  reviews_count: Joi.number().integer().min(0).default(0),
  size: Joi.string().trim().optional(),
  delivery_time: Joi.string().trim().optional(),
  flowers: Joi.array().items(Joi.string().trim()).optional(),
  colors: Joi.array().items(Joi.string().trim()).optional(),
  occasions: Joi.array().items(Joi.string().trim()).optional(),
  images: Joi.array().items(Joi.string().trim()).optional(),
  extras: Joi.array().items(Joi.string().trim()).optional(),
  care_instructions: Joi.string().trim().optional(),
});

// Schema para filtros de búsqueda
const filterSchema = Joi.object({
  occasion: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  color: Joi.string().trim().optional(),
  minPrice: Joi.number().positive().integer().optional(),
  maxPrice: Joi.number().positive().integer().optional(),
  search: Joi.string().trim().min(2).optional(),
  featured: Joi.string().valid('true', 'false').optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  page: Joi.number().integer().min(1).default(1),
});

// Middleware de validación
const validateProduct = (req, res, next) => {
  const isUpdate = req.method === 'PUT';
  const { error, value } = productSchema.validate(req.body, {
    context: { isUpdate },
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({
      error: 'Datos de producto inválidos',
      details: errorMessage,
      received: Object.keys(req.body),
    });
  }

  req.body = value;
  next();
};

const validateFilters = (req, res, next) => {
  const { error, value } = filterSchema.validate(req.query, { stripUnknown: true });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({
      error: 'Filtros de búsqueda inválidos',
      details: errorMessage,
    });
  }

  req.query = value;
  next();
};

// Validador de ID de producto
const validateProductId = (req, res, next) => {
  const idSchema = Joi.string().trim().min(3).max(50).required();
  const { error } = idSchema.validate(req.params.productId || req.params.id);

  if (error) {
    return res.status(400).json({
      error: 'ID de producto inválido',
      details: error.details[0].message,
    });
  }

  next();
};

module.exports = {
  validateProduct,
  validateFilters,
  validateProductId,
  productSchema,
  filterSchema,
};
