/**
 * @flores-victoria/shared/errors
 * Exporta clases de errores personalizadas
 */

module.exports = {
  // Puedes agregar clases de error personalizadas aquí
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
      this.statusCode = 400;
    }
  },

  NotFoundError: class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
      super(message);
      this.name = 'NotFoundError';
      this.statusCode = 404;
    }
  },

  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
      super(message);
      this.name = 'UnauthorizedError';
      this.statusCode = 401;
    }
  },
};
