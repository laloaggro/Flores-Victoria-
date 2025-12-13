/**
 * @fileoverview Standardized Response Handler
 * @description Wrapper para respuestas consistentes en todos los servicios
 *
 * @author Flores Victoria Team
 * @version 1.0.0
 */

// ====================================================================
// CÓDIGOS DE ESTADO HTTP
// ====================================================================

const HttpStatus = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// ====================================================================
// RESPONSE BUILDERS
// ====================================================================

/**
 * Construye una respuesta de éxito
 * @param {Object} options - Opciones de la respuesta
 * @param {any} options.data - Datos a retornar
 * @param {string} options.message - Mensaje descriptivo
 * @param {Object} options.meta - Metadata adicional (paginación, etc.)
 * @returns {Object} Respuesta estructurada
 */
function success({ data = null, message = 'Success', meta = null } = {}) {
  const response = {
    status: 'success',
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
}

/**
 * Construye una respuesta de error
 * @param {Object} options - Opciones de la respuesta
 * @param {string} options.message - Mensaje de error
 * @param {string} options.code - Código de error interno
 * @param {any} options.details - Detalles adicionales del error
 * @param {number} options.statusCode - Código HTTP (para logging)
 * @returns {Object} Respuesta estructurada
 */
function error({
  message = 'An error occurred',
  code = 'INTERNAL_ERROR',
  details = null,
  // statusCode parameter reserved for future logging enhancements
} = {}) {
  const response = {
    status: 'error',
    message,
    code,
  };

  // Solo incluir detalles si existen y no es producción
  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details;
  }

  return response;
}

/**
 * Construye una respuesta paginada
 * @param {Object} options - Opciones
 * @param {Array} options.items - Items de la página actual
 * @param {number} options.total - Total de items
 * @param {number} options.page - Página actual
 * @param {number} options.limit - Items por página
 * @param {string} options.message - Mensaje descriptivo
 * @returns {Object} Respuesta paginada
 */
function paginated({ items = [], total = 0, page = 1, limit = 20, message = 'Success' } = {}) {
  const totalPages = Math.ceil(total / limit);

  return {
    status: 'success',
    message,
    data: items,
    meta: {
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  };
}

// ====================================================================
// RESPUESTAS PREDEFINIDAS
// ====================================================================

const Responses = {
  // Success responses
  ok: (data, message = 'Success') => success({ data, message }),
  created: (data, message = 'Resource created successfully') => success({ data, message }),
  accepted: (message = 'Request accepted') => success({ message }),
  noContent: () => success({ message: 'No content' }),

  // Error responses
  badRequest: (message = 'Bad request', details = null) =>
    error({ message, code: 'BAD_REQUEST', details, statusCode: 400 }),

  unauthorized: (message = 'Authentication required') =>
    error({ message, code: 'UNAUTHORIZED', statusCode: 401 }),

  forbidden: (message = 'Access denied') => error({ message, code: 'FORBIDDEN', statusCode: 403 }),

  notFound: (resource = 'Resource') =>
    error({ message: `${resource} not found`, code: 'NOT_FOUND', statusCode: 404 }),

  conflict: (message = 'Resource conflict') =>
    error({ message, code: 'CONFLICT', statusCode: 409 }),

  validationError: (errors) =>
    error({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
      statusCode: 422,
    }),

  tooManyRequests: (retryAfter = 60) =>
    error({
      message: `Too many requests. Retry after ${retryAfter} seconds`,
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    }),

  internalError: (message = 'Internal server error') =>
    error({ message, code: 'INTERNAL_ERROR', statusCode: 500 }),

  serviceUnavailable: (service = 'Service') =>
    error({
      message: `${service} is temporarily unavailable`,
      code: 'SERVICE_UNAVAILABLE',
      statusCode: 503,
    }),
};

// ====================================================================
// MIDDLEWARE DE RESPONSE HANDLER
// ====================================================================

/**
 * Middleware que agrega métodos helper a res
 * @returns {Function} Middleware de Express
 */
function responseHandler() {
  return (req, res, next) => {
    // Agregar métodos de respuesta al objeto res
    res.success = (data, message) => {
      return res.status(HttpStatus.OK).json(Responses.ok(data, message));
    };

    res.created = (data, message) => {
      return res.status(HttpStatus.CREATED).json(Responses.created(data, message));
    };

    res.paginated = (options) => {
      return res.status(HttpStatus.OK).json(paginated(options));
    };

    res.badRequest = (message, details) => {
      return res.status(HttpStatus.BAD_REQUEST).json(Responses.badRequest(message, details));
    };

    res.unauthorized = (message) => {
      return res.status(HttpStatus.UNAUTHORIZED).json(Responses.unauthorized(message));
    };

    res.forbidden = (message) => {
      return res.status(HttpStatus.FORBIDDEN).json(Responses.forbidden(message));
    };

    res.notFound = (resource) => {
      return res.status(HttpStatus.NOT_FOUND).json(Responses.notFound(resource));
    };

    res.conflict = (message) => {
      return res.status(HttpStatus.CONFLICT).json(Responses.conflict(message));
    };

    res.validationError = (errors) => {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(Responses.validationError(errors));
    };

    res.tooManyRequests = (retryAfter) => {
      res.setHeader('Retry-After', retryAfter);
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json(Responses.tooManyRequests(retryAfter));
    };

    res.internalError = (message) => {
      return res.status(HttpStatus.INTERNAL_ERROR).json(Responses.internalError(message));
    };

    res.serviceUnavailable = (service) => {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(Responses.serviceUnavailable(service));
    };

    next();
  };
}

// ====================================================================
// EXPORTS
// ====================================================================

module.exports = {
  // Status codes
  HttpStatus,

  // Response builders
  success,
  error,
  paginated,

  // Predefined responses
  Responses,

  // Middleware
  responseHandler,
};
