/**
 * Schemas de validación para Contact Service
 */

const { Joi, commonSchemas } = require('../../shared/middleware/validation');

// Schema para crear contacto
const createContactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: commonSchemas.email,
  phone: commonSchemas.phone.optional(),
  subject: Joi.string().trim().min(5).max(200).required(),
  message: Joi.string().trim().min(10).max(2000).required(),
  category: Joi.string()
    .valid('general', 'orders', 'products', 'complaints', 'suggestions', 'other')
    .default('general'),
  urgency: Joi.string().valid('low', 'medium', 'high').default('medium'),
  preferredContactMethod: Joi.string().valid('email', 'phone', 'any').default('email'),
  consent: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must consent to data processing',
  }),
});

// Schema para actualizar contacto
const updateContactSchema = Joi.object({
  status: Joi.string().valid('pending', 'in-progress', 'resolved', 'closed').optional(),
  response: Joi.string().trim().min(10).max(2000).optional(),
  assignedTo: Joi.string().trim().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  notes: Joi.string().trim().max(1000).optional(),
}).min(1);

// Schema para filtros
const contactFiltersSchema = Joi.object({
  status: Joi.string().valid('pending', 'in-progress', 'resolved', 'closed').optional(),
  category: Joi.string()
    .valid('general', 'orders', 'products', 'complaints', 'suggestions', 'other')
    .optional(),
  urgency: Joi.string().valid('low', 'medium', 'high').optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().min(Joi.ref('dateFrom')).optional(),
  search: Joi.string().trim().min(2).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('createdAt', 'urgency', 'status').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createContactSchema,
  updateContactSchema,
  contactFiltersSchema,
};
