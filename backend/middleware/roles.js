const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos de usuarios
const dbPath = path.join(__dirname, '..', 'users.db');

/**
 * Roles del sistema con jerarquía
 */
const ROLES = {
  CLIENTE: 'cliente',
  TRABAJADOR: 'trabajador',
  CONTADOR: 'contador',
  ADMIN: 'admin',
  OWNER: 'owner'
};

/**
 * Jerarquía de roles (cada rol incluye permisos de los anteriores)
 */
const ROLE_HIERARCHY = {
  [ROLES.CLIENTE]: 0,
  [ROLES.TRABAJADOR]: 1,
  [ROLES.CONTADOR]: 2,
  [ROLES.ADMIN]: 3,
  [ROLES.OWNER]: 4
};

/**
 * Permisos específicos por rol
 */
const PERMISSIONS = {
  [ROLES.CLIENTE]: [
    'view_products',
    'add_to_cart',
    'make_purchase',
    'view_own_orders',
    'edit_own_profile',
    'create_wishlist',
    'contact_support'
  ],
  [ROLES.TRABAJADOR]: [
    'view_all_orders',
    'update_order_status',
    'view_inventory',
    'manage_deliveries',
    'customer_chat',
    'basic_reports'
  ],
  [ROLES.CONTADOR]: [
    'view_all_invoices',
    'manage_invoices',
    'view_financial_reports',
    'manage_accounting',
    'reconcile_accounts',
    'manage_chart_accounts',
    'view_tax_reports',
    'manage_suppliers',
    'view_inventory_costs',
    'generate_financial_statements'
  ],
  [ROLES.ADMIN]: [
    'manage_products',
    'manage_users',
    'view_full_reports',
    'system_configuration',
    'access_admin_panel',
    'system_monitoring'
  ],
  [ROLES.OWNER]: [
    'configure_roles',
    'manage_administrators',
    'view_financial_metrics',
    'advanced_configuration',
    'backup_restore',
    'system_logs'
  ]
};

/**
 * Middleware para verificar autenticación
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'EXPIRED_TOKEN'
      });
    }
    console.error('Error en autenticación:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Middleware para verificar rol mínimo requerido
 */
const requireRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const userLevel = ROLE_HIERARCHY[userRole];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel === undefined) {
      return res.status(403).json({ 
        error: 'Rol de usuario inválido',
        code: 'INVALID_ROLE'
      });
    }

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: `Se requiere rol ${minimumRole} o superior. Tu rol: ${userRole}`,
        code: 'INSUFFICIENT_ROLE',
        required: minimumRole,
        current: userRole
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const userPermissions = getAllPermissionsForRole(userRole);

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: `Permiso '${permission}' requerido`,
        code: 'INSUFFICIENT_PERMISSION',
        required: permission,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Obtener todos los permisos para un rol (incluyendo jerarquía)
 */
const getAllPermissionsForRole = (role) => {
  const userLevel = ROLE_HIERARCHY[role];
  let allPermissions = [];

  // Agregar permisos de todos los roles de nivel igual o inferior
  for (const [roleKey, level] of Object.entries(ROLE_HIERARCHY)) {
    if (level <= userLevel) {
      allPermissions = [...allPermissions, ...PERMISSIONS[roleKey]];
    }
  }

  return [...new Set(allPermissions)]; // Eliminar duplicados
};

/**
 * Verificar si un usuario tiene un permiso específico
 */
const hasPermission = (userRole, permission) => {
  const userPermissions = getAllPermissionsForRole(userRole);
  return userPermissions.includes(permission);
};

/**
 * Verificar si un rol puede acceder a una ruta
 */
const canAccessRoute = (userRole, route) => {
  const routePermissions = {
    // Rutas públicas
    '/': true,
    '/pages/info/*': true,
    '/pages/legal/*': true,
    
    // Rutas de cliente
    '/pages/shop/*': [ROLES.CLIENTE, ROLES.TRABAJADOR, ROLES.ADMIN, ROLES.OWNER],
    '/pages/user/*': [ROLES.CLIENTE, ROLES.TRABAJADOR, ROLES.ADMIN, ROLES.OWNER],
    '/pages/wishlist/*': [ROLES.CLIENTE, ROLES.TRABAJADOR, ROLES.ADMIN, ROLES.OWNER],
    
    // Rutas de trabajador
    '/admin-site/worker-tools.html': [ROLES.TRABAJADOR, ROLES.ADMIN, ROLES.OWNER],
    
    // Rutas de admin
    '/pages/admin/*': [ROLES.ADMIN, ROLES.OWNER],
    '/admin-panel/*': [ROLES.ADMIN, ROLES.OWNER],
    '/admin-site/*': [ROLES.ADMIN, ROLES.OWNER],
    
    // Rutas de owner
    '/admin-site/owner-dashboard.html': [ROLES.OWNER]
  };

  // Verificar rutas específicas
  for (const [pattern, allowedRoles] of Object.entries(routePermissions)) {
    if (pattern === true) return true; // Ruta pública
    
    if (Array.isArray(allowedRoles)) {
      // Convertir patrón a regex
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      
      if (regex.test(route)) {
        return allowedRoles.includes(userRole);
      }
    }
  }

  return false; // Por defecto, denegar acceso
};

/**
 * Middleware combinado de autenticación y autorización
 */
const authAndAuthorize = (minimumRole = null, permission = null) => {
  return [
    authenticateToken,
    ...(minimumRole ? [requireRole(minimumRole)] : []),
    ...(permission ? [requirePermission(permission)] : [])
  ];
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  authenticateToken,
  requireRole,
  requirePermission,
  getAllPermissionsForRole,
  hasPermission,
  canAccessRoute,
  authAndAuthorize
};