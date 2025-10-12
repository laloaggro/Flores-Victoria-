/**
 * Middleware de manejo de errores estándar
 * 
 * Este middleware proporciona un formato consistente para todas las respuestas de error
 * en todos los microservicios.
 */

/**
 * Clase de error personalizada para errores operacionales
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de manejo de errores global
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // En desarrollo, enviar el stack trace
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    // En producción, enviar mensaje de error limpio
    sendErrorProd(err, res);
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Errores operacionales: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    
  // Errores de programación: no enviar detalles al cliente
  } else {
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Algo salió mal!'
    });
  }
};

module.exports = {
  AppError,
  globalErrorHandler
};