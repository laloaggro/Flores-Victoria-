/**
 * @fileoverview Middleware de Autorización para Flores Victoria
 * Verifica roles y permisos en las rutas protegidas
 */

const {
  ROLES,
  PERMISSIONS,
  normalizeRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  getPermissions,
  getRoleInfo,
} = require('../config/roles');

// ═══════════════════════════════════════════════════════════════
// ERRORES PERSONALIZADOS
// ═══════════════════════════════════════════════════════════════

class AuthorizationError extends Error {
  constructor(message, code = 'FORBIDDEN') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
    this.code = code;
  }
}

class AuthenticationError extends Error {
  constructor(message, code = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    this.code = code;
  }
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario esté autenticado
 * Debe usarse después del middleware de JWT
 * @returns {Function} Express middleware
 */
function requireAuth() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticación requerida',
        },
      });
    }
    next();
  };
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE AUTORIZACIÓN POR ROL
// ═══════════════════════════════════════════════════════════════

/**
 * Requiere uno de los roles especificados
 * @param {...string} allowedRoles - Roles permitidos
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/admin', requireRole(ROLES.ADMIN, ROLES.MANAGER), controller);
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticación requerida',
        },
      });
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    if (!normalizedAllowed.includes(userRole)) {
      const roleInfo = getRoleInfo(userRole);
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Acceso denegado. Tu rol (${roleInfo.name}) no tiene permiso para esta acción`,
          requiredRoles: allowedRoles,
          userRole: userRole,
        },
      });
    }

    next();
  };
}

/**
 * Requiere un nivel de rol mínimo en la jerarquía
 * @param {string} minimumRole - Rol mínimo requerido
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/reports', requireRoleLevel(ROLES.MANAGER), controller);
 */
function requireRoleLevel(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticación requerida',
        },
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!isRoleAtLeast(userRole, minimumRole)) {
      const userInfo = getRoleInfo(userRole);
      const requiredInfo = getRoleInfo(minimumRole);
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_ROLE',
          message: `Se requiere rol ${requiredInfo.name} o superior. Tu rol actual: ${userInfo.name}`,
          requiredRole: minimumRole,
          userRole: userRole,
        },
      });
    }

    next();
  };
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE AUTORIZACIÓN POR PERMISO
// ═══════════════════════════════════════════════════════════════

/**
 * Requiere un permiso específico
 * @param {string} permission - Permiso requerido
 * @returns {Function} Express middleware
 * 
 * @example
 * router.post('/products', requirePermission(PERMISSIONS.PRODUCTS_CREATE), controller);
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticación requerida',
        },
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `No tienes permiso para: ${permission}`,
          requiredPermission: permission,
          userRole: userRole,
        },
      });
    }

    next();
  };
}

/**
 * Requiere al menos uno de los permisos especificados
 * @param {...string} permissions - Permisos (cualquiera)
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/orders', requireAnyPermission(
 *   PERMISSIONS.ORDERS_VIEW_OWN,
 *   PERMISSIONS.ORDERS_VIEW_ALL
 * ), controller);
 */
function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticación requerida',
        },
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!hasAnyPermission(userRole, permissions)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'No tienes ninguno de los permisos requeridos',
          requiredPermissions: permissions,
          userRole: userRole,
        },
      });
    }

    next();
  };
}

/**
 * Requiere todos los permisos especificados
 * @param {...string} permissions - Permisos (todos requeridos)
 * @returns {Function} Express middleware
 */
function requireAllPermissions(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticación requerida',
        },
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!hasAllPermissions(userRole, permissions)) {
      const userPermissions = getPermissions(userRole);
      const missing = permissions.filter((p) => !userPermissions.includes(p));
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'No tienes todos los permisos requeridos',
          requiredPermissions: permissions,
          missingPermissions: missing,
          userRole: userRole,
        },
      });
    }

    next();
  };
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE PROPIEDAD DE RECURSOS
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica que el usuario sea dueño del recurso o tenga permiso admin
 * @param {Function} getResourceOwnerId - Función que extrae el ownerId del request
 * @param {string} [adminPermission] - Permiso alternativo para acceder sin ser dueño
 * @returns {Function} Express middleware
 * 
 * @example
 * router.put('/orders/:id',
 *   requireOwnership(
 *     (req) => req.order.userId,
 *     PERMISSIONS.ORDERS_VIEW_ALL
 *   ),
 *   controller
 * );
 */
function requireOwnership(getResourceOwnerId, adminPermission = null) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticación requerida',
        },
      });
    }

    try {
      const resourceOwnerId = await getResourceOwnerId(req);
      const userId = req.user.id || req.user.userId;
      const userRole = normalizeRole(req.user.role);

      // Si es el dueño, permitir acceso
      if (resourceOwnerId && resourceOwnerId.toString() === userId.toString()) {
        return next();
      }

      // Si tiene permiso de admin, permitir acceso
      if (adminPermission && hasPermission(userRole, adminPermission)) {
        return next();
      }

      // Si es admin o manager, permitir acceso
      if (isRoleAtLeast(userRole, ROLES.MANAGER)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_OWNER',
          message: 'No tienes permiso para acceder a este recurso',
        },
      });
    } catch (error) {
      console.error('Authorization error:', error.message);
      return res.status(500).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Error verificando permisos',
        },
      });
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE HELPER - AÑADIR INFO DE PERMISOS
// ═══════════════════════════════════════════════════════════════

/**
 * Añade información de permisos al request para uso en controladores
 * @returns {Function} Express middleware
 */
function attachPermissions() {
  return (req, res, next) => {
    if (req.user) {
      const userRole = normalizeRole(req.user.role);
      req.userPermissions = getPermissions(userRole);
      req.userRoleInfo = getRoleInfo(userRole);
      
      // Helper functions en el request
      req.can = (permission) => hasPermission(userRole, permission);
      req.canAny = (...permissions) => hasAnyPermission(userRole, permissions);
      req.canAll = (...permissions) => hasAllPermissions(userRole, permissions);
      req.isAtLeast = (role) => isRoleAtLeast(userRole, role);
    }
    next();
  };
}

// ═══════════════════════════════════════════════════════════════
// SHORTCUTS PARA ROLES COMUNES
// ═══════════════════════════════════════════════════════════════

/**
 * Solo administradores
 */
const adminOnly = requireRole(ROLES.ADMIN);

/**
 * Gerentes y administradores
 */
const managerOnly = requireRoleLevel(ROLES.MANAGER);

/**
 * Staff (florist, support, manager, admin)
 */
const staffOnly = requireRole(ROLES.FLORIST, ROLES.SUPPORT, ROLES.MANAGER, ROLES.ADMIN);

/**
 * Cualquier usuario autenticado
 */
const authenticated = requireAuth();

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Errores
  AuthorizationError,
  AuthenticationError,
  
  // Middleware de autenticación
  requireAuth,
  
  // Middleware de roles
  requireRole,
  requireRoleLevel,
  
  // Middleware de permisos
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  
  // Middleware de propiedad
  requireOwnership,
  
  // Helpers
  attachPermissions,
  
  // Shortcuts
  adminOnly,
  managerOnly,
  staffOnly,
  authenticated,
  
  // Re-export de roles para conveniencia
  ROLES,
  PERMISSIONS,
};
