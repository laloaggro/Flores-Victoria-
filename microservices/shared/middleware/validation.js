/**
 * Middleware de validación compartido usando Joi
 * Proporciona validación consistente para body, query y params
 */

const Joi = require('joi');

/**
 * Crea un middleware de validación para cualquier esquema Joi
 * @param {Object} schema - Esquema Joi para validar
 * @param {string} source - Origen de los datos ('body', 'query', 'params')
 * @param {Object} options - Opciones adicionales de validación
 * @returns {Function} Middleware Express
 */
function validate(schema, source = 'body', options = {}) {
  const defaultOptions = {
    abortEarly: false, // Reportar todos los errores, no solo el primero
    stripUnknown: true, // Eliminar campos no definidos en el schema
    convert: true, // Convertir tipos automáticamente
    ...options,
  };

  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, defaultOptions);

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors,
        receivedFields: Object.keys(dataToValidate || {}),
      });
    }

    // Reemplazar los datos originales con los valores validados y sanitizados
    req[source] = value;
    next();
  };
}

/**
 * Valida body de la petición
 */
function validateBody(schema, options) {
  return validate(schema, 'body', options);
}

/**
 * Valida query params de la petición
 */
function validateQuery(schema, options) {
  return validate(schema, 'query', options);
}

/**
 * Valida path params de la petición
 */
function validateParams(schema, options) {
  return validate(schema, 'params', options);
}

/**
 * Esquemas comunes reutilizables
 */
const commonSchemas = {
  // ID genérico
  id: Joi.string().trim().min(1).max(50).required(),

  // MongoDB ObjectId
  mongoId: Joi.string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Must be a valid MongoDB ObjectId',
    }),

  // UUID
  uuid: Joi.string()
    .trim()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Must be a valid UUID',
    }),

  // Email
  email: Joi.string().trim().email().lowercase().required(),

  // Password (mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número)
  password: Joi.string()
    .trim()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least 8 characters, one uppercase, one lowercase, and one number',
    }),

  // Teléfono
  phone: Joi.string()
    .trim()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base': 'Must be a valid phone number',
    }),

  // URL
  url: Joi.string().trim().uri(),

  // Paginación
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().trim().optional(),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('asc'),
  }),

  // Fecha ISO
  isoDate: Joi.date().iso().required(),

  // Rango de fechas
  dateRange: Joi.object({
    from: Joi.date().iso().required(),
    to: Joi.date().iso().greater(Joi.ref('from')).required(),
  }),

  // Precio (en centavos)
  price: Joi.number().integer().positive().required(),

  // Cantidad
  quantity: Joi.number().integer().min(1).max(999).required(),

  // Nombre de usuario
  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
    }),

  // Token JWT
  jwt: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Must be a valid JWT token',
    }),

  // Coordenadas geográficas
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }),

  // Dirección
  address: Joi.object({
    street: Joi.string().trim().min(3).max(200).required(),
    city: Joi.string().trim().min(2).max(100).required(),
    state: Joi.string().trim().min(2).max(100).required(),
    country: Joi.string().trim().length(2).uppercase().required(), // ISO 3166-1 alpha-2
    zipCode: Joi.string().trim().min(3).max(20).required(),
    apartment: Joi.string().trim().max(50).optional(),
    reference: Joi.string().trim().max(200).optional(),
  }),
};

/**
 * Validadores de parámetros comunes
 */
const commonValidators = {
  // Validar ID en params
  id: validateParams(Joi.object({ id: commonSchemas.id })),

  // Validar MongoDB ObjectId en params
  mongoId: validateParams(Joi.object({ id: commonSchemas.mongoId })),

  // Validar UUID en params
  uuid: validateParams(Joi.object({ id: commonSchemas.uuid })),

  // Validar paginación en query
  pagination: validateQuery(commonSchemas.pagination),
};

/**
 * Helper para crear schemas de entidades con campos comunes
 */
function createEntitySchema(fields, options = {}) {
  const baseFields = {
    createdAt: Joi.date().iso().optional(),
    updatedAt: Joi.date().iso().optional(),
    ...fields,
  };

  return Joi.object(baseFields).options(options);
}

/**
 * Sanitizadores personalizados
 */
const sanitizers = {
  // Eliminar scripts HTML
  html: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },

  // Eliminar espacios extra
  trimSpaces: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\s+/g, ' ').trim();
  },

  // Normalizar URL
  normalizeUrl: (value) => {
    if (typeof value !== 'string') return value;
    try {
      const url = new URL(value);
      return url.toString();
    } catch {
      return value;
    }
  },
};

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  commonSchemas,
  commonValidators,
  createEntitySchema,
  sanitizers,
  Joi, // Exportar Joi para crear schemas personalizados
};
