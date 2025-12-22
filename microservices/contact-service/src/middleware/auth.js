/**
 * Authentication Middleware for Contact Service
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * Middleware de autenticación JWT
 * Verifica el token y adjunta el usuario a req.user
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
      code: 'MISSING_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido',
      code: 'INVALID_TOKEN',
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Intenta autenticar pero no falla si no hay token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };
  } catch {
    req.user = null;
  }

  next();
};

/**
 * Middleware para verificar rol de admin
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Acceso denegado. Se requiere rol de administrador',
      code: 'FORBIDDEN',
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminOnly,
};
