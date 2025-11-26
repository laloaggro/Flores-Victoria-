/**
 * Schemas de validación para User Service
 */

const { Joi, commonSchemas } = require('@flores-victoria/shared/middleware/validation');

// Schema para crear usuario
const createUserSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  name: Joi.string().trim().min(2).max(100).required(),
  role: Joi.string().valid('customer', 'admin', 'moderator').default('customer'),
  phone: commonSchemas.phone.optional(),
  avatar: commonSchemas.url.optional(),
  isActive: Joi.boolean().default(true),
  emailVerified: Joi.boolean().default(false),
});

// Schema para actualizar usuario
const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  phone: commonSchemas.phone.optional(),
  avatar: commonSchemas.url.optional(),
  role: Joi.string().valid('customer', 'admin', 'moderator').optional(),
  isActive: Joi.boolean().optional(),
  emailVerified: Joi.boolean().optional(),
  preferences: Joi.object({
    newsletter: Joi.boolean().optional(),
    notifications: Joi.boolean().optional(),
    language: Joi.string().valid('es', 'en').optional(),
    theme: Joi.string().valid('light', 'dark', 'auto').optional(),
  }).optional(),
  addresses: Joi.array().items(commonSchemas.address).max(5).optional(),
}).min(1);

// Schema para filtros de usuarios
const userFiltersSchema = Joi.object({
  role: Joi.string().valid('customer', 'admin', 'moderator').optional(),
  isActive: Joi.boolean().optional(),
  emailVerified: Joi.boolean().optional(),
  search: Joi.string().trim().min(2).optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('createdAt', 'name', 'email').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

// Schema para agregar dirección
const addAddressSchema = Joi.object({
  street: Joi.string().trim().min(3).max(200).required(),
  city: Joi.string().trim().min(2).max(100).required(),
  state: Joi.string().trim().min(2).max(100).required(),
  country: Joi.string().trim().length(2).uppercase().required(), // ISO 3166-1 alpha-2
  zipCode: Joi.string().trim().min(3).max(20).required(),
  apartment: Joi.string().trim().max(50).optional(),
  reference: Joi.string().trim().max(200).optional(),
  isDefault: Joi.boolean().default(false),
  label: Joi.string().valid('home', 'work', 'other').default('home'),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  addAddressSchema,
};
