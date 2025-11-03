/**
 * Custom error classes
 * Errores estandarizados para toda la aplicación
 */

/**
 * Error base de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
      },
    };
  }
}

/**
 * Error de validación
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
      },
    };
  }
}

/**
 * Error de autenticación
 */
class AuthenticationError extends AppError {
  constructor(message = 'Autenticación requerida') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Error de autorización
 */
class AuthorizationError extends AppError {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Error de recurso no encontrado
 */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

/**
 * Error de conflicto (ej: duplicado)
 */
class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Error de rate limiting
 */
class RateLimitError extends AppError {
  constructor(message = 'Demasiadas solicitudes. Intenta más tarde') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Error de servicio externo
 */
class ExternalServiceError extends AppError {
  constructor(service, message = 'Error en servicio externo') {
    super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

/**
 * Error de base de datos
 */
class DatabaseError extends AppError {
  constructor(message = 'Error en base de datos', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Handler global de errores para Express
 */
function errorHandler(logger) {
  return (err, req, res, next) => {
    // Si es un error operacional conocido
    if (err.isOperational) {
      logger.warn('Operational error', {
        error: err.message,
        code: err.code,
        path: req.path,
        method: req.method,
      });

      return res.status(err.statusCode).json(err.toJSON());
    }

    // Error inesperado (bug)
    logger.error('Unexpected error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    // En producción, no exponer detalles del error
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        error: {
          message: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
        },
      });
    }

    // En desarrollo, mostrar stack trace
    return res.status(500).json({
      error: {
        message: err.message,
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        stack: err.stack,
      },
    });
  };
}

/**
 * Handler para rutas no encontradas
 */
function notFoundHandler() {
  return (req, res) => {
    const error = new NotFoundError('Ruta');
    res.status(404).json(error.toJSON());
  };
}

/**
 * Wrapper para async route handlers
 * Captura errores automáticamente
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  DatabaseError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
