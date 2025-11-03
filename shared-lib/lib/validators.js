/**
 * Validators using Joi
 * Validaciones comunes para toda la aplicación
 */

const Joi = require('joi');

/**
 * Esquemas de validación comunes
 */
const schemas = {
  // Email
  email: Joi.string().email().lowercase().trim().required(),
  
  // Password (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número',
    }),
  
  // MongoDB ObjectId
  objectId: Joi.string().hex().length(24),
  
  // Teléfono (formato flexible)
  phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).min(7).max(20),
  
  // URL
  url: Joi.string().uri(),
  
  // Fecha
  date: Joi.date().iso(),
  
  // Paginación
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

/**
 * Validaciones específicas para productos
 */
const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().required(),
    stock: Joi.number().integer().min(0).required(),
    images: Joi.array().items(Joi.string().uri()).min(1).required(),
    tags: Joi.array().items(Joi.string()),
    featured: Joi.boolean().default(false),
    active: Joi.boolean().default(true),
  }),
  
  update: Joi.object({
    name: Joi.string().min(3).max(200),
    description: Joi.string().min(10).max(2000),
    price: Joi.number().positive(),
    category: Joi.string(),
    stock: Joi.number().integer().min(0),
    images: Joi.array().items(Joi.string().uri()).min(1),
    tags: Joi.array().items(Joi.string()),
    featured: Joi.boolean(),
    active: Joi.boolean(),
  }).min(1),
  
  query: Joi.object({
    category: Joi.string(),
    minPrice: Joi.number().positive(),
    maxPrice: Joi.number().positive(),
    featured: Joi.boolean(),
    active: Joi.boolean(),
    search: Joi.string(),
    ...schemas.pagination,
  }),
};

/**
 * Validaciones para usuarios
 */
const userSchemas = {
  register: Joi.object({
    email: schemas.email,
    password: schemas.password,
    name: Joi.string().min(2).max(100).required(),
    phone: schemas.phone,
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('Chile'),
    }),
  }),
  
  login: Joi.object({
    email: schemas.email,
    password: Joi.string().required(),
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    phone: schemas.phone,
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string(),
    }),
  }).min(1),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: schemas.password,
  }),
};

/**
 * Validaciones para órdenes
 */
const orderSchemas = {
  create: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: schemas.objectId.required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().required(),
      })
    ).min(1).required(),
    
    shippingAddress: Joi.object({
      name: Joi.string().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().default('Chile'),
      phone: schemas.phone.required(),
    }).required(),
    
    paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'transfer', 'cash').required(),
    notes: Joi.string().max(500),
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
    notes: Joi.string().max(500),
  }),
  
  query: Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    userId: schemas.objectId,
    startDate: schemas.date,
    endDate: schemas.date,
    ...schemas.pagination,
  }),
};

/**
 * Middleware de validación
 * @param {Joi.Schema} schema - Esquema de validación
 * @param {string} property - Propiedad del request a validar (body, query, params)
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Retornar todos los errores
      stripUnknown: true, // Eliminar campos no definidos en el schema
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: {
          message: 'Error de validación',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details,
        },
      });
    }

    // Reemplazar con valores validados (con defaults aplicados)
    req[property] = value;
    next();
  };
}

/**
 * Validar ObjectId de MongoDB
 */
function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    const { error } = schemas.objectId.validate(id);

    if (error) {
      return res.status(400).json({
        error: {
          message: 'ID inválido',
          code: 'INVALID_ID',
          statusCode: 400,
        },
      });
    }

    next();
  };
}

module.exports = {
  schemas,
  productSchemas,
  userSchemas,
  orderSchemas,
  validate,
  validateObjectId,
  Joi, // Exportar Joi para validaciones custom
};
