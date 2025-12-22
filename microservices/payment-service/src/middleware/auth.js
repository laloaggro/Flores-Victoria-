/**
 * Authentication Middleware for Payment Service
 * JWT-based authentication for protecting payment endpoints
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flores-victoria-secret-key';

/**
 * Middleware to verify JWT token
 * Required for all payment operations
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticación requerido',
        code: 'AUTH_REQUIRED',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.userId || decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'customer',
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Error de autenticación',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional authentication - populates req.user if token exists
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.userId || decoded.id || decoded.sub,
        email: decoded.email,
        role: decoded.role || 'customer',
      };
    }
    next();
  } catch (error) {
    // Token invalid but continue without user
    next();
  }
};

/**
 * Admin-only middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador',
      code: 'ADMIN_REQUIRED',
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminOnly,
};
