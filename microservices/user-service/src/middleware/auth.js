/**
 * Authentication Middleware for User Service
 * JWT-based authentication for protecting user endpoints
 * Soporta sistema de 6 roles: customer, florist, delivery, support, manager, admin
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flores-victoria-secret-key';

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE ROLES (compatible con shared/config/roles.js)
// ═══════════════════════════════════════════════════════════════

const ROLES = {
  CUSTOMER: 'customer',
  FLORIST: 'florist',
  DELIVERY: 'delivery',
  SUPPORT: 'support',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

const ROLE_ALIASES = {
  user: ROLES.CUSTOMER,
  client: ROLES.CUSTOMER,
};

const ROLE_HIERARCHY = {
  [ROLES.CUSTOMER]: 1,
  [ROLES.DELIVERY]: 2,
  [ROLES.FLORIST]: 3,
  [ROLES.SUPPORT]: 4,
  [ROLES.MANAGER]: 5,
  [ROLES.ADMIN]: 6,
};

function normalizeRole(role) {
  if (!role) return ROLES.CUSTOMER;
  const lowercaseRole = role.toLowerCase();
  return ROLE_ALIASES[lowercaseRole] || lowercaseRole;
}

function isRoleAtLeast(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[normalizeRole(userRole)] || 0;
  const requiredLevel = ROLE_HIERARCHY[normalizeRole(requiredRole)] || 0;
  return userLevel >= requiredLevel;
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE PRINCIPAL DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════

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
      role: normalizeRole(decoded.role),
      permissions: decoded.permissions || [],
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

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE AUTORIZACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Admin-only middleware - requires authMiddleware first
 * Ahora soporta el rol 'admin' del nuevo sistema
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED',
    });
  }

  const userRole = normalizeRole(req.user.role);
  if (userRole !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador',
      code: 'ADMIN_REQUIRED',
      userRole: userRole,
    });
  }

  next();
};

/**
 * Manager or higher middleware
 */
const managerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED',
    });
  }

  const userRole = normalizeRole(req.user.role);
  if (!isRoleAtLeast(userRole, ROLES.MANAGER)) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de manager o superior',
      code: 'MANAGER_REQUIRED',
      userRole: userRole,
    });
  }

  next();
};

/**
 * Staff middleware (florist, support, manager, admin)
 */
const staffOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
      code: 'AUTH_REQUIRED',
    });
  }

  const userRole = normalizeRole(req.user.role);
  const staffRoles = [ROLES.FLORIST, ROLES.SUPPORT, ROLES.MANAGER, ROLES.ADMIN];
  
  if (!staffRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de personal',
      code: 'STAFF_REQUIRED',
      userRole: userRole,
    });
  }

  next();
};

/**
 * Middleware that allows access if user is admin/manager OR is accessing their own resource
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
  const userRole = normalizeRole(req.user.role);
  const isPrivileged = isRoleAtLeast(userRole, ROLES.MANAGER);

  if (!isOwner && !isPrivileged) {
    return res.status(403).json({
      success: false,
      error: 'No tiene permisos para acceder a este recurso',
      code: 'ACCESS_DENIED',
    });
  }

  next();
};

// Token de servicio para comunicación inter-servicio
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || process.env.JWT_SECRET || 'flores-victoria-internal-service';

/**
 * Service-to-service authentication (for internal calls)
 * Accepts SERVICE_TOKEN via Bearer OR x-api-key, OR admin/manager JWT
 */
const serviceAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const serviceSecret = process.env.INTERNAL_SERVICE_SECRET || process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;
  const isInternalRequest = req.headers['x-internal-request'] === 'true';
  const serviceName = req.headers['x-service-name'];

  // Check for internal service request with SERVICE_TOKEN
  if (isInternalRequest && serviceName && authHeader) {
    const token = authHeader.split(' ')[1];
    if (token === SERVICE_TOKEN) {
      req.isInternalService = true;
      req.serviceName = serviceName;
      return next();
    }
  }

  // Check API key
  if (apiKey && apiKey === serviceSecret) {
    req.isInternalService = true;
    return next();
  }

  // Fallback to JWT with manager+ role
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRole = normalizeRole(decoded.role);
      
      if (isRoleAtLeast(userRole, ROLES.MANAGER)) {
        req.user = {
          id: decoded.userId || decoded.id || decoded.sub,
          email: decoded.email,
          role: userRole,
          permissions: decoded.permissions || [],
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
  managerOnly,
  staffOnly,
  selfOrAdmin,
  serviceAuth,
  // Exportar también constantes y helpers para uso interno
  ROLES,
  normalizeRole,
  isRoleAtLeast,
};
