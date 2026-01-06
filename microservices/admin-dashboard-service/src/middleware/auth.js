/**
 * Middleware de autenticación JWT para admin-dashboard-service
 */
const jwt = require('jsonwebtoken');
const { logger } = require('@flores-victoria/shared/utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'flores_victoria_secret_2024';

/**
 * Middleware para verificar token JWT
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Token de acceso requerido',
      code: 'NO_TOKEN',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Token inválido o expirado', { error: error.message });
    return res.status(403).json({
      error: true,
      message: 'Token inválido o expirado',
      code: 'INVALID_TOKEN',
    });
  }
};

/**
 * Middleware para verificar rol de administrador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: true,
      message: 'Autenticación requerida',
      code: 'AUTH_REQUIRED',
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Acceso denegado - Se requiere rol admin', {
      userId: req.user.id,
      role: req.user.role,
    });
    return res.status(403).json({
      error: true,
      message: 'Se requieren permisos de administrador',
      code: 'ADMIN_REQUIRED',
    });
  }

  next();
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Acceso denegado - Rol no permitido', {
        userId: req.user.id,
        role: req.user.role,
        allowedRoles,
      });
      return res.status(403).json({
        error: true,
        message: `Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
        code: 'ROLE_REQUIRED',
      });
    }

    next();
  };
};

/**
 * Middleware opcional - permite acceso sin token pero adjunta usuario si existe
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token inválido pero continuamos sin usuario
      req.user = null;
    }
  }

  next();
};

/**
 * Genera un token JWT con permisos
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Roles disponibles en el sistema
const ROLES = {
  ADMIN: 'admin',
  WORKER: 'worker',
  VIEWER: 'viewer',
};

// Permisos por rol
const ROLE_PERMISSIONS = {
  admin: [
    'read',
    'write',
    'delete',
    'manage_users',
    'manage_settings',
    'manage_products',
    'manage_orders',
    'manage_inventory',
    'view_reports',
    'export_data',
  ],
  worker: ['read', 'write', 'manage_products', 'manage_orders', 'manage_inventory', 'view_reports'],
  viewer: ['read', 'view_reports'],
};

/**
 * Middleware para verificar permiso específico
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED',
      });
    }

    const userPermissions = req.user.permissions || ROLE_PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      logger.warn('Acceso denegado - Permiso insuficiente', {
        userId: req.user.id,
        required: permission,
        userPermissions,
      });
      return res.status(403).json({
        error: true,
        message: `Permiso requerido: ${permission}`,
        code: 'PERMISSION_DENIED',
      });
    }

    next();
  };
};

/**
 * Middleware para verificar cualquiera de varios permisos
 */
const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Autenticación requerida',
        code: 'AUTH_REQUIRED',
      });
    }

    const userPermissions = req.user.permissions || ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        error: true,
        message: `Se requiere al menos uno de: ${permissions.join(', ')}`,
        code: 'PERMISSION_DENIED',
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireRole,
  requirePermission,
  requireAnyPermission,
  optionalAuth,
  generateToken,
  JWT_SECRET,
  ROLES,
  ROLE_PERMISSIONS,
};
