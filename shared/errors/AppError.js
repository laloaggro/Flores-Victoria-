/**
 * Clases de error personalizadas para manejo consistente
 * Extienden Error nativo con propiedades útiles para logging y respuestas HTTP
 */

/**
 * Error base de la aplicación
 * Todos los errores personalizados heredan de esta clase
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true, metadata = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational; // true = error esperado, false = bug/crítico
    this.metadata = metadata; // información adicional para debugging
    this.timestamp = new Date().toISOString();

    // Captura stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(Object.keys(this.metadata).length > 0 && { metadata: this.metadata }),
      },
    };
  }
}

/**
 * 400 Bad Request
 * Request malformado o con parámetros inválidos
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad Request', metadata = {}) {
    super(message, 400, true, metadata);
  }
}

/**
 * 401 Unauthorized
 * No autenticado o token inválido
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', metadata = {}) {
    super(message, 401, true, metadata);
  }
}

/**
 * 403 Forbidden
 * Autenticado pero sin permisos para esta acción
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', metadata = {}) {
    super(message, 403, true, metadata);
  }
}

/**
 * 404 Not Found
 * Recurso no encontrado
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource', metadata = {}) {
    super(`${resource} not found`, 404, true, metadata);
  }
}

/**
 * 409 Conflict
 * Conflicto con estado actual (ej: duplicados)
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict', metadata = {}) {
    super(message, 409, true, metadata);
  }
}

/**
 * 422 Unprocessable Entity
 * Validación de datos falló
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = [], metadata = {}) {
    super(message, 422, true, { ...metadata, errors });
  }
}

/**
 * 429 Too Many Requests
 * Rate limit excedido
 */
class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', metadata = {}) {
    super(message, 429, true, metadata);
  }
}

/**
 * 500 Internal Server Error
 * Error no esperado del servidor
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal server error', metadata = {}) {
    super(message, 500, false, metadata);
  }
}

/**
 * 503 Service Unavailable
 * Servicio temporalmente no disponible (mantenimiento, sobrecarga)
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', metadata = {}) {
    super(message, 503, true, metadata);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
};
