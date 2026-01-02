/**
 * @fileoverview Sistema de Roles y Permisos para Flores Victoria
 * Define roles, permisos y matriz de acceso para el e-commerce
 */

// ═══════════════════════════════════════════════════════════════
// ROLES DEL SISTEMA
// ═══════════════════════════════════════════════════════════════

/**
 * Roles disponibles en el sistema
 * @enum {string}
 */
const ROLES = {
  CUSTOMER: 'customer',      // Cliente registrado
  FLORIST: 'florist',        // Florista/Empleado
  DELIVERY: 'delivery',      // Repartidor
  SUPPORT: 'support',        // Soporte al cliente
  MANAGER: 'manager',        // Gerente de tienda
  ADMIN: 'admin',            // Administrador total
};

/**
 * Alias para compatibilidad con código legacy
 */
const ROLE_ALIASES = {
  user: ROLES.CUSTOMER,
  client: ROLES.CUSTOMER,
  employee: ROLES.FLORIST,
  staff: ROLES.FLORIST,
};

/**
 * Jerarquía de roles (mayor número = más privilegios)
 */
const ROLE_HIERARCHY = {
  [ROLES.CUSTOMER]: 1,
  [ROLES.DELIVERY]: 2,
  [ROLES.FLORIST]: 3,
  [ROLES.SUPPORT]: 4,
  [ROLES.MANAGER]: 5,
  [ROLES.ADMIN]: 6,
};

// ═══════════════════════════════════════════════════════════════
// PERMISOS DEL SISTEMA
// ═══════════════════════════════════════════════════════════════

/**
 * Permisos disponibles organizados por recurso
 * Formato: recurso:acción
 * @enum {string}
 */
const PERMISSIONS = {
  // Productos
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_MANAGE_INVENTORY: 'products:manage_inventory',

  // Pedidos
  ORDERS_VIEW_OWN: 'orders:view_own',
  ORDERS_VIEW_ALL: 'orders:view_all',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE_STATUS: 'orders:update_status',
  ORDERS_CANCEL: 'orders:cancel',
  ORDERS_ASSIGN_DELIVERY: 'orders:assign_delivery',

  // Usuarios
  USERS_VIEW_PROFILE: 'users:view_profile',
  USERS_UPDATE_PROFILE: 'users:update_profile',
  USERS_VIEW_ALL: 'users:view_all',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage_roles',

  // Carrito y Wishlist
  CART_MANAGE: 'cart:manage',
  WISHLIST_MANAGE: 'wishlist:manage',

  // Reviews
  REVIEWS_CREATE: 'reviews:create',
  REVIEWS_UPDATE_OWN: 'reviews:update_own',
  REVIEWS_DELETE_OWN: 'reviews:delete_own',
  REVIEWS_MODERATE: 'reviews:moderate',
  REVIEWS_VIEW_ALL: 'reviews:view_all',

  // Promociones
  PROMOTIONS_VIEW: 'promotions:view',
  PROMOTIONS_CREATE: 'promotions:create',
  PROMOTIONS_UPDATE: 'promotions:update',
  PROMOTIONS_DELETE: 'promotions:delete',

  // Reportes y Analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  ANALYTICS_VIEW: 'analytics:view',

  // Configuración del sistema
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',

  // Contacto y Soporte
  CONTACT_VIEW_OWN: 'contact:view_own',
  CONTACT_VIEW_ALL: 'contact:view_all',
  CONTACT_RESPOND: 'contact:respond',

  // Notificaciones
  NOTIFICATIONS_SEND: 'notifications:send',
  NOTIFICATIONS_MANAGE: 'notifications:manage',

  // Entregas
  DELIVERIES_VIEW_ASSIGNED: 'deliveries:view_assigned',
  DELIVERIES_UPDATE_STATUS: 'deliveries:update_status',
  DELIVERIES_VIEW_ALL: 'deliveries:view_all',
};

// ═══════════════════════════════════════════════════════════════
// MATRIZ DE PERMISOS POR ROL
// ═══════════════════════════════════════════════════════════════

/**
 * Permisos asignados a cada rol
 * @type {Object<string, string[]>}
 */
const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_CANCEL, // Solo propios y antes de procesarse
    PERMISSIONS.USERS_VIEW_PROFILE,
    PERMISSIONS.USERS_UPDATE_PROFILE,
    PERMISSIONS.CART_MANAGE,
    PERMISSIONS.WISHLIST_MANAGE,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.REVIEWS_UPDATE_OWN,
    PERMISSIONS.REVIEWS_DELETE_OWN,
    PERMISSIONS.PROMOTIONS_VIEW,
    PERMISSIONS.CONTACT_VIEW_OWN,
  ],

  [ROLES.DELIVERY]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.USERS_VIEW_PROFILE,
    PERMISSIONS.USERS_UPDATE_PROFILE,
    PERMISSIONS.DELIVERIES_VIEW_ASSIGNED,
    PERMISSIONS.DELIVERIES_UPDATE_STATUS,
    PERMISSIONS.ORDERS_VIEW_ALL, // Solo datos de entrega
  ],

  [ROLES.FLORIST]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE_INVENTORY,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
    PERMISSIONS.USERS_VIEW_PROFILE,
    PERMISSIONS.USERS_UPDATE_PROFILE,
    PERMISSIONS.DELIVERIES_VIEW_ALL,
  ],

  [ROLES.SUPPORT]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
    PERMISSIONS.USERS_VIEW_PROFILE,
    PERMISSIONS.USERS_UPDATE_PROFILE,
    PERMISSIONS.USERS_VIEW_ALL, // Solo datos básicos
    PERMISSIONS.REVIEWS_VIEW_ALL,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.CONTACT_VIEW_ALL,
    PERMISSIONS.CONTACT_RESPOND,
    PERMISSIONS.PROMOTIONS_VIEW,
  ],

  [ROLES.MANAGER]: [
    // Todos los permisos de productos
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_MANAGE_INVENTORY,
    // Todos los permisos de pedidos
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.ORDERS_ASSIGN_DELIVERY,
    // Usuarios (sin gestión de roles)
    PERMISSIONS.USERS_VIEW_PROFILE,
    PERMISSIONS.USERS_UPDATE_PROFILE,
    PERMISSIONS.USERS_VIEW_ALL,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    // Reviews
    PERMISSIONS.REVIEWS_VIEW_ALL,
    PERMISSIONS.REVIEWS_MODERATE,
    // Promociones
    PERMISSIONS.PROMOTIONS_VIEW,
    PERMISSIONS.PROMOTIONS_CREATE,
    PERMISSIONS.PROMOTIONS_UPDATE,
    PERMISSIONS.PROMOTIONS_DELETE,
    // Reportes
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    // Contacto
    PERMISSIONS.CONTACT_VIEW_ALL,
    PERMISSIONS.CONTACT_RESPOND,
    // Entregas
    PERMISSIONS.DELIVERIES_VIEW_ALL,
    // Notificaciones
    PERMISSIONS.NOTIFICATIONS_SEND,
  ],

  [ROLES.ADMIN]: [
    // Admin tiene TODOS los permisos
    ...Object.values(PERMISSIONS),
  ],
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Normaliza un rol (maneja aliases y legacy)
 * @param {string} role - Rol a normalizar
 * @returns {string} Rol normalizado
 */
function normalizeRole(role) {
  if (!role) return ROLES.CUSTOMER;
  const lowercaseRole = role.toLowerCase();
  return ROLE_ALIASES[lowercaseRole] || lowercaseRole;
}

/**
 * Verifica si un rol tiene un permiso específico
 * @param {string} role - Rol del usuario
 * @param {string} permission - Permiso a verificar
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  const normalizedRole = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(permission);
}

/**
 * Verifica si un rol tiene al menos uno de los permisos
 * @param {string} role - Rol del usuario
 * @param {string[]} permissions - Lista de permisos
 * @returns {boolean}
 */
function hasAnyPermission(role, permissions) {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 * @param {string} role - Rol del usuario
 * @param {string[]} permissions - Lista de permisos
 * @returns {boolean}
 */
function hasAllPermissions(role, permissions) {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Obtiene todos los permisos de un rol
 * @param {string} role - Rol del usuario
 * @returns {string[]} Lista de permisos
 */
function getPermissions(role) {
  const normalizedRole = normalizeRole(role);
  return ROLE_PERMISSIONS[normalizedRole] || [];
}

/**
 * Verifica si un rol es igual o superior a otro en la jerarquía
 * @param {string} userRole - Rol del usuario
 * @param {string} requiredRole - Rol requerido
 * @returns {boolean}
 */
function isRoleAtLeast(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[normalizeRole(userRole)] || 0;
  const requiredLevel = ROLE_HIERARCHY[normalizeRole(requiredRole)] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Verifica si un rol puede gestionar a otro (debe ser superior)
 * @param {string} managerRole - Rol del gestor
 * @param {string} targetRole - Rol del objetivo
 * @returns {boolean}
 */
function canManageRole(managerRole, targetRole) {
  const managerLevel = ROLE_HIERARCHY[normalizeRole(managerRole)] || 0;
  const targetLevel = ROLE_HIERARCHY[normalizeRole(targetRole)] || 0;
  return managerLevel > targetLevel;
}

/**
 * Obtiene la lista de roles válidos
 * @returns {string[]}
 */
function getValidRoles() {
  return Object.values(ROLES);
}

/**
 * Verifica si un rol es válido
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
function isValidRole(role) {
  const normalizedRole = normalizeRole(role);
  return Object.values(ROLES).includes(normalizedRole);
}

/**
 * Obtiene información del rol para mostrar en UI
 * @param {string} role - Rol
 * @returns {Object}
 */
function getRoleInfo(role) {
  const normalizedRole = normalizeRole(role);
  const roleInfo = {
    [ROLES.CUSTOMER]: {
      name: 'Cliente',
      description: 'Cliente registrado de la tienda',
      color: '#4CAF50',
      icon: 'user',
    },
    [ROLES.DELIVERY]: {
      name: 'Repartidor',
      description: 'Encargado de entregas',
      color: '#2196F3',
      icon: 'truck',
    },
    [ROLES.FLORIST]: {
      name: 'Florista',
      description: 'Empleado de la florería',
      color: '#9C27B0',
      icon: 'flower',
    },
    [ROLES.SUPPORT]: {
      name: 'Soporte',
      description: 'Atención al cliente',
      color: '#FF9800',
      icon: 'headset',
    },
    [ROLES.MANAGER]: {
      name: 'Gerente',
      description: 'Gerente de tienda',
      color: '#F44336',
      icon: 'briefcase',
    },
    [ROLES.ADMIN]: {
      name: 'Administrador',
      description: 'Acceso total al sistema',
      color: '#000000',
      icon: 'shield',
    },
  };

  return roleInfo[normalizedRole] || {
    name: role,
    description: 'Rol desconocido',
    color: '#9E9E9E',
    icon: 'help',
  };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  ROLES,
  ROLE_ALIASES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  normalizeRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissions,
  isRoleAtLeast,
  canManageRole,
  getValidRoles,
  isValidRole,
  getRoleInfo,
};
