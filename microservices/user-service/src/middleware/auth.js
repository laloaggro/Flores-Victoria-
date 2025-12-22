/**
 * Authentication Middleware for User Service
 * JWT-based authentication for protecting user endpoints
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flores-victoria-secret-key';

/**
 * Middleware to verify JWT token
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
 * Admin-only middleware - requires authMiddleware first
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

/**
 * Middleware that allows access if user is admin OR is accessing their own resource
 */
const selfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED',
    });
  }

  const resourceId = req.params.id;
  const isOwner = req.user.id === resourceId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'No tiene permisos para acceder a este recurso',
      code: 'ACCESS_DENIED',
    });
  }

  next();
};

/**
 * Service-to-service authentication (for internal calls)
 * Accepts API key OR admin JWT
 */
const serviceAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const serviceSecret = process.env.INTERNAL_SERVICE_SECRET || process.env.JWT_SECRET;

  // Check API key first
  if (apiKey && apiKey === serviceSecret) {
    req.isInternalService = true;
    return next();
  }

  // Fallback to JWT with admin role
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === 'admin') {
        req.user = {
          id: decoded.userId || decoded.id || decoded.sub,
          email: decoded.email,
          role: decoded.role,
        };
        req.isInternalService = true;
        return next();
      }
    } catch (error) {
      // Token invalid, continue to error
    }
  }

  return res.status(403).json({
    success: false,
    error: 'Acceso denegado. Solo servicios internos o administradores.',
    code: 'SERVICE_AUTH_REQUIRED',
  });
};

module.exports = {
  authMiddleware,
  adminOnly,
  selfOrAdmin,
  serviceAuth,
};
