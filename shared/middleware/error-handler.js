/**
 * Middleware centralizado de manejo de errores
 * Normaliza respuestas de error y logging
 */

/**
 * Determina si estamos en desarrollo
 */
function isDevelopment() {
  return (process.env.NODE_ENV || 'development') === 'development';
}

/**
 * Middleware para errores 404 (ruta no encontrada)
 * Debe colocarse ANTES del errorHandler general
 */
function notFoundHandler(req, res) {
  const error = {
    status: 'error',
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl || req.url}`,
    path: req.originalUrl || req.url,
    method: req.method,
  };

  res.status(404).json(error);
}

/**
 * Middleware principal de manejo de errores
 * Debe ser el ÚLTIMO middleware en la cadena
 *
 * @param {Error} err - Error capturado
 * @param {Request} req - Request de Express
 * @param {Response} res - Response de Express
 * @param {NextFunction} next - Next function (requerido por Express)
 */
function errorHandler(err, req, res, next) {
  // Si ya se envió la respuesta, delegar al handler por defecto
  if (res.headersSent) {
    return next(err);
  }

  // Usar req.log si existe (con requestId), sino console
  const logger = req.log || console;

  // Determinar status code
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let isOperational = err.isOperational !== undefined ? err.isOperational : false;

  // Casos especiales de errores comunes
  if (err.name === 'ValidationError' && err.errors) {
    // Error de validación de Mongoose/Joi
    statusCode = 422;
    isOperational = true;
  } else if (err.name === 'CastError') {
    // Error de casting de Mongoose (ID inválido)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    isOperational = true;
  } else if (err.code === 11000) {
    // Error de duplicado en MongoDB
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `Duplicate value for field: ${field}` : 'Duplicate entry';
    isOperational = true;
  } else if (err.name === 'JsonWebTokenError') {
    // Error de JWT inválido
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    // Token expirado
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  } else if (err.type === 'entity.parse.failed') {
    // Error de parsing JSON en body
    statusCode = 400;
    message = 'Invalid JSON in request body';
    isOperational = true;
  }

  // Log del error
  const logMeta = {
    statusCode,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...(err.metadata && { metadata: err.metadata }),
  };

  if (isOperational) {
    // Error operacional esperado (log como warn)
    logger.warn(message, logMeta);
  } else {
    // Error no esperado (log como error con stack)
    logger.error(message, {
      ...logMeta,
      stack: err.stack,
      name: err.name,
    });
  }

  // Preparar respuesta
  const errorResponse = {
    status: 'error',
    statusCode,
    message,
    ...(err.metadata && Object.keys(err.metadata).length > 0 && { metadata: err.metadata }),
  };

  // En desarrollo, incluir más detalles
  if (isDevelopment()) {
    errorResponse.stack = err.stack;
    errorResponse.name = err.name;
    if (err.errors) {
      errorResponse.errors = err.errors;
    }
  }

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
}

/**
 * Wrapper para async route handlers
 * Captura errores de promesas rechazadas y los pasa a next()
 *
 * @param {Function} fn - Async function handler
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/products/:id', asyncHandler(async (req, res) => {
 *   const product = await Product.findById(req.params.id);
 *   if (!product) throw new NotFoundError('Product');
 *   res.json(product);
 * }));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
