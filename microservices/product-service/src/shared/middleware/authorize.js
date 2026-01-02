/**
 * @fileoverview Stub de autorización para product-service (Railway)
 * Versión simplificada del middleware de autorización
 */

// ═══════════════════════════════════════════════════════════════
// ROLES Y PERMISOS (copiar de shared/config/roles.js)
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

const PERMISSIONS = {
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_MANAGE_INVENTORY: 'products:manage_inventory',
  ORDERS_VIEW_OWN: 'orders:view_own',
  ORDERS_VIEW_ALL: 'orders:view_all',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE_STATUS: 'orders:update_status',
  ORDERS_CANCEL: 'orders:cancel',
  USERS_VIEW_PROFILE: 'users:view_profile',
  USERS_UPDATE_PROFILE: 'users:update_profile',
  USERS_VIEW_ALL: 'users:view_all',
  USERS_MANAGE_ROLES: 'users:manage_roles',
  REVIEWS_MODERATE: 'reviews:moderate',
  PROMOTIONS_CREATE: 'promotions:create',
  PROMOTIONS_UPDATE: 'promotions:update',
  PROMOTIONS_DELETE: 'promotions:delete',
  REPORTS_VIEW: 'reports:view',
  SYSTEM_CONFIG: 'system:config',
};

const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.USERS_VIEW_PROFILE,
    PERMISSIONS.USERS_UPDATE_PROFILE,
  ],
  [ROLES.DELIVERY]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.USERS_VIEW_PROFILE,
  ],
  [ROLES.FLORIST]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE_INVENTORY,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
  ],
  [ROLES.SUPPORT]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.USERS_VIEW_ALL,
    PERMISSIONS.REVIEWS_MODERATE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_MANAGE_INVENTORY,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
    PERMISSIONS.USERS_VIEW_ALL,
    PERMISSIONS.PROMOTIONS_CREATE,
    PERMISSIONS.PROMOTIONS_UPDATE,
    PERMISSIONS.PROMOTIONS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES HELPER
// ═══════════════════════════════════════════════════════════════

function normalizeRole(role) {
  if (!role) return ROLES.CUSTOMER;
  const lowercaseRole = role.toLowerCase();
  return ROLE_ALIASES[lowercaseRole] || lowercaseRole;
}

function hasPermission(role, permission) {
  const normalizedRole = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(permission);
}

function isRoleAtLeast(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[normalizeRole(userRole)] || 0;
  const requiredLevel = ROLE_HIERARCHY[normalizeRole(requiredRole)] || 0;
  return userLevel >= requiredLevel;
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

function requireAuth() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
      });
    }
    next();
  };
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
      });
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Acceso denegado. Rol insuficiente.`,
          requiredRoles: allowedRoles,
          userRole: userRole,
        },
      });
    }

    next();
  };
}

function requireRoleLevel(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!isRoleAtLeast(userRole, minimumRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_ROLE',
          message: `Se requiere rol ${minimumRole} o superior`,
          requiredRole: minimumRole,
          userRole: userRole,
        },
      });
    }

    next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
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

function requireAnyPermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
      });
    }

    const userRole = normalizeRole(req.user.role);
    const hasAny = permissions.some((p) => hasPermission(userRole, p));

    if (!hasAny) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'No tienes ninguno de los permisos requeridos',
          requiredPermissions: permissions,
        },
      });
    }

    next();
  };
}

// Shortcuts
const adminOnly = requireRole(ROLES.ADMIN);
const managerOnly = requireRoleLevel(ROLES.MANAGER);
const staffOnly = requireRole(ROLES.FLORIST, ROLES.SUPPORT, ROLES.MANAGER, ROLES.ADMIN);
const authenticated = requireAuth();

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  normalizeRole,
  hasPermission,
  isRoleAtLeast,
  requireAuth,
  requireRole,
  requireRoleLevel,
  requirePermission,
  requireAnyPermission,
  adminOnly,
  managerOnly,
  staffOnly,
  authenticated,
};
