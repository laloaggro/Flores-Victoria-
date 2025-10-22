/**
 * Middleware para manejar errores globalmente
 */

const { logError, logApplicationError } = require('../utils/logger');

/**
 * Middleware para manejar errores operacionales
 * @param {Error} err - Error
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleOperationalErrors = (err, req, res, next) => {
  // Registrar el error
  logApplicationError('Error operacional', err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Enviar respuesta al cliente
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Algo salió mal',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware para manejar errores de programación
 * @param {Error} err - Error
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleProgrammingErrors = (err, req, res, next) => {
  // Registrar el error
  logError('Error de programación no capturado', err);

  // Enviar respuesta al cliente
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
};

/**
 * Middleware para manejar errores de tipo cast (por ejemplo, ID inválido)
 * @param {Error} err - Error de cast
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleCastError = (err, req, res, next) => {
  logApplicationError('Error de cast', err, {
    url: req.url,
    method: req.method,
  });

  res.status(400).json({
    status: 'fail',
    message: 'Datos inválidos',
  });
};

/**
 * Middleware para manejar errores de validación
 * @param {Error} err - Error de validación
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleValidationError = (err, req, res, next) => {
  logApplicationError('Error de validación', err, {
    url: req.url,
    method: req.method,
  });

  const errors = Object.values(err.errors).map((el) => el.message);

  res.status(400).json({
    status: 'fail',
    message: 'Datos inválidos',
    errors,
  });
};

/**
 * Middleware para manejar errores JWT
 * @param {Error} err - Error JWT
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleJWTError = (err, req, res, next) => {
  logApplicationError('Error de autenticación JWT', err, {
    url: req.url,
    method: req.method,
  });

  res.status(401).json({
    status: 'fail',
    message: 'No autorizado. Por favor inicie sesión nuevamente.',
  });
};

/**
 * Middleware para manejar errores JWT expirados
 * @param {Error} err - Error JWT expirado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleJWTExpiredError = (err, req, res, next) => {
  logApplicationError('Token JWT expirado', err, {
    url: req.url,
    method: req.method,
  });

  res.status(401).json({
    status: 'fail',
    message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.',
  });
};

/**
 * Middleware para manejar errores de rate limit
 * @param {Error} err - Error de rate limit
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const handleRateLimitError = (err, req, res, next) => {
  logApplicationError('Límite de solicitudes excedido', err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(429).json({
    status: 'fail',
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta nuevamente más tarde.',
  });
};

/**
 * Middleware global para manejar todos los errores
 * @param {Error} err - Error
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const globalErrorHandler = (err, req, res, next) => {
  // Manejar diferentes tipos de errores
  if (err.name === 'CastError') {
    return handleCastError(err, req, res, next);
  }

  if (err.name === 'ValidationError') {
    return handleValidationError(err, req, res, next);
  }

  if (err.name === 'JsonWebTokenError') {
    return handleJWTError(err, req, res, next);
  }

  if (err.name === 'TokenExpiredError') {
    return handleJWTExpiredError(err, req, res, next);
  }

  if (err.statusCode === 429) {
    return handleRateLimitError(err, req, res, next);
  }

  // Para errores operacionales conocidos
  if (err.isOperational) {
    return handleOperationalErrors(err, req, res, next);
  }

  // Para errores de programación desconocidos
  return handleProgrammingErrors(err, req, res, next);
};

module.exports = {
  globalErrorHandler,
};
