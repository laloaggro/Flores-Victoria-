/**
 * Sistema centralizado de validación de requests con Joi
 *
 * Características:
 * - Validación de body, query params, URL params, headers
 * - Integración con error handling (ValidationError)
 * - Logging automático de errores de validación
 * - Schemas reutilizables
 * - Contexto y opciones flexibles
 */

const Joi = require('joi');
const { ValidationError } = require('../errors/AppError');

/**
 * Opciones por defecto para validación
 */
const DEFAULT_OPTIONS = {
  abortEarly: false, // Retorna todos los errores, no solo el primero
  stripUnknown: true, // Remueve campos no definidos en el schema
  errors: {
    wrap: {
      label: false, // No envolver nombres de campos en comillas
    },
  },
};

/**
 * Crea un middleware de validación para requests
 * @param {Object} schema - Schema de Joi para validar
 * @param {string} source - Fuente de datos: 'body', 'query', 'params', 'headers'
 * @param {Object} options - Opciones adicionales de Joi
 * @returns {Function} - Express middleware
 */
function validate(schema, source = 'body', options = {}) {
  // Validar que el schema sea un objeto Joi
  if (!schema || !schema.validate) {
    throw new Error('validate() requiere un schema de Joi válido');
  }

  // Validar source permitido
  const allowedSources = ['body', 'query', 'params', 'headers'];
  if (!allowedSources.includes(source)) {
    throw new Error(`Source debe ser uno de: ${allowedSources.join(', ')}`);
  }

  const validationOptions = { ...DEFAULT_OPTIONS, ...options };

  return (req, res, next) => {
    const dataToValidate = req[source];

    // Validar con Joi
    const { error, value } = schema.validate(dataToValidate, validationOptions);

    if (error) {
      // Extraer detalles de errores
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      // Logging
      req.log?.warn('Validation failed', {
        source,
        errors: details,
        received: Object.keys(dataToValidate || {}),
      });

      // Lanzar ValidationError (será capturado por error handler)
      throw new ValidationError('Datos de entrada inválidos', {
        source,
        errors: details,
        received: Object.keys(dataToValidate || {}),
      });
    }

    // Reemplazar datos validados y sanitizados
    req[source] = value;

    next();
  };
}

/**
 * Middleware para validar body
 * @param {Object} schema - Schema de Joi
 * @param {Object} options - Opciones de validación
 */
function validateBody(schema, options = {}) {
  return validate(schema, 'body', options);
}

/**
 * Middleware para validar query params
 * @param {Object} schema - Schema de Joi
 * @param {Object} options - Opciones de validación
 */
function validateQuery(schema, options = {}) {
  return validate(schema, 'query', options);
}

/**
 * Middleware para validar URL params
 * @param {Object} schema - Schema de Joi
 * @param {Object} options - Opciones de validación
 */
function validateParams(schema, options = {}) {
  return validate(schema, 'params', options);
}

/**
 * Middleware para validar headers
 * @param {Object} schema - Schema de Joi
 * @param {Object} options - Opciones de validación
 */
function validateHeaders(schema, options = {}) {
  return validate(schema, 'headers', options);
}

/**
 * Schemas comunes reutilizables como funciones
 * Uso: commonSchemas.id() en lugar de commonSchemas.id
 */
const commonSchemas = {
  // IDs
  id: () => Joi.string().trim().min(1).max(100),
  uuid: () => Joi.string().uuid(),
  mongoId: () => Joi.string().regex(/^[0-9a-fA-F]{24}$/),

  // Strings
  email: () => Joi.string().email().lowercase().trim(),
  password: () => Joi.string().min(8).max(128),
  url: () => Joi.string().uri(),
  phone: () => Joi.string().regex(/^\+?[1-9]\d{1,14}$/),

  // Números
  positiveInt: () => Joi.number().integer().positive(),
  nonNegativeInt: () => Joi.number().integer().min(0),
  price: () => Joi.number().positive(),
  rating: () => Joi.number().min(0).max(5),

  // Paginación
  pagination: () =>
    Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sort: Joi.string().trim().optional(),
      order: Joi.string().valid('asc', 'desc').default('asc'),
    }),

  // Fechas
  date: () => Joi.date().iso(),
  dateRange: () =>
    Joi.object({
      from: Joi.date().iso().required(),
      to: Joi.date().iso().min(Joi.ref('from')).required(),
    }),

  // Booleanos (acepta strings también)
  boolean: () =>
    Joi.alternatives().try(
      Joi.boolean(),
      Joi.string()
        .valid('true', 'false')
        .custom((value) => value === 'true')
    ),

  // Arrays
  stringArray: () => Joi.array().items(Joi.string().trim()),
  numberArray: () => Joi.array().items(Joi.number()),
};

/**
 * Schemas de validación comunes para endpoints típicos
 */
const schemas = {
  /**
   * Schema para crear usuarios
   */
  createUser: Joi.object({
    email: commonSchemas.email().required(),
    password: commonSchemas.password().required(),
    name: Joi.string().trim().min(2).max(100).required(),
    phone: commonSchemas.phone().optional(),
  }),

  /**
   * Schema para actualizar usuarios
   */
  updateUser: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    phone: commonSchemas.phone().optional(),
    // Password no se actualiza por aquí, tiene endpoint separado
  }),

  /**
   * Schema para login
   */
  login: Joi.object({
    email: commonSchemas.email().required(),
    password: Joi.string().required(), // No validar min/max en login
  }),

  /**
   * Schema para búsqueda genérica
   */
  search: Joi.object({
    q: Joi.string().trim().min(2).max(200).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().trim().optional(),
    order: Joi.string().valid('asc', 'desc').default('asc'),
  }),

  /**
   * Schema para filtros de productos
   */
  productFilters: Joi.object({
    category: Joi.string().trim().optional(),
    minPrice: commonSchemas.price().optional(),
    maxPrice: commonSchemas.price().optional(),
    featured: commonSchemas.boolean().optional(),
    search: Joi.string().trim().min(2).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().trim().optional(),
    order: Joi.string().valid('asc', 'desc').default('asc'),
  }),

  /**
   * Schema para ID en params
   */
  idParam: Joi.object({
    id: commonSchemas.id().required(),
  }),

  /**
   * Schema para UUID en params
   */
  uuidParam: Joi.object({
    id: commonSchemas.uuid().required(),
  }),
};

/**
 * Validador de objetos sin middleware (para uso directo)
 * @param {Object} schema - Schema de Joi
 * @param {Object} data - Datos a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} - { valid: boolean, value: any, errors: Array }
 */
function validateData(schema, data, options = {}) {
  const validationOptions = { ...DEFAULT_OPTIONS, ...options };
  const { error, value } = schema.validate(data, validationOptions);

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type,
    }));

    return {
      valid: false,
      value: null,
      errors,
    };
  }

  return {
    valid: true,
    value,
    errors: null,
  };
}

/**
 * Helper para crear schemas dinámicamente
 * @param {Object} fields - Objeto con definiciones de campos
 * @returns {Object} - Schema de Joi
 */
function createSchema(fields) {
  return Joi.object(fields);
}

module.exports = {
  // Middleware factories
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,

  // Schemas comunes
  commonSchemas,
  schemas,

  // Utilidades
  validateData,
  createSchema,

  // Re-export Joi para conveniencia
  Joi,

  // Constantes
  DEFAULT_OPTIONS,
};
