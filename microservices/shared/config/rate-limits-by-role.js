/**
 * @fileoverview Configuración de Rate Limiting por Rol
 * @description Define límites de tasa diferenciados según el rol del usuario
 * 
 * Jerarquía de límites (de mayor a menor):
 * ADMIN > MANAGER > SUPPORT > FLORIST > DELIVERY > CUSTOMER > PUBLIC
 */

const { ROLES } = require('./roles');

// ═══════════════════════════════════════════════════════════════
// MULTIPLICADORES POR ROL
// ═══════════════════════════════════════════════════════════════

/**
 * Multiplicador de rate limit por rol
 * Mayor número = más requests permitidos
 * @type {Object<string, number>}
 */
const ROLE_MULTIPLIERS = {
  [ROLES.ADMIN]: 10,      // Admin: 10x el límite base
  [ROLES.MANAGER]: 5,     // Manager: 5x el límite base
  [ROLES.SUPPORT]: 3,     // Soporte: 3x el límite base
  [ROLES.FLORIST]: 2,     // Florista: 2x el límite base
  [ROLES.DELIVERY]: 2,    // Repartidor: 2x el límite base
  [ROLES.CUSTOMER]: 1,    // Cliente: límite base
  public: 0.5,            // Sin autenticar: 50% del límite base
};

// ═══════════════════════════════════════════════════════════════
// LÍMITES BASE POR ENDPOINT
// ═══════════════════════════════════════════════════════════════

/**
 * Límites base por tipo de endpoint (requests/ventana de tiempo)
 * @type {Object}
 */
const BASE_LIMITS = {
  // Autenticación (estricto para todos)
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxBase: 5,
    bypassRoles: [ROLES.ADMIN], // Admin puede saltear este límite
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxBase: 3,
    bypassRoles: [],
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000,
    maxBase: 3,
    bypassRoles: [],
  },

  // API General
  apiGeneral: {
    windowMs: 60 * 1000, // 1 minuto
    maxBase: 100,
    bypassRoles: [ROLES.ADMIN],
  },

  // Productos
  productSearch: {
    windowMs: 60 * 1000,
    maxBase: 30,
    bypassRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  productBrowse: {
    windowMs: 5 * 60 * 1000,
    maxBase: 100,
    bypassRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  productCreate: {
    windowMs: 60 * 60 * 1000,
    maxBase: 50,
    bypassRoles: [ROLES.ADMIN],
  },
  productUpdate: {
    windowMs: 60 * 60 * 1000,
    maxBase: 100,
    bypassRoles: [ROLES.ADMIN],
  },

  // Carrito
  cartOperations: {
    windowMs: 5 * 60 * 1000,
    maxBase: 50,
    bypassRoles: [],
  },

  // Órdenes
  orderCreate: {
    windowMs: 60 * 60 * 1000,
    maxBase: 10,
    bypassRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  orderView: {
    windowMs: 5 * 60 * 1000,
    maxBase: 50,
    bypassRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT],
  },
  orderUpdate: {
    windowMs: 60 * 60 * 1000,
    maxBase: 30,
    bypassRoles: [ROLES.ADMIN],
  },

  // Reviews
  reviewCreate: {
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    maxBase: 10,
    bypassRoles: [],
  },
  reviewModerate: {
    windowMs: 60 * 60 * 1000,
    maxBase: 100,
    bypassRoles: [ROLES.ADMIN],
  },

  // Uploads
  fileUpload: {
    windowMs: 60 * 60 * 1000,
    maxBase: 20,
    bypassRoles: [ROLES.ADMIN, ROLES.MANAGER],
  },

  // Contacto
  contactForm: {
    windowMs: 60 * 60 * 1000,
    maxBase: 3,
    bypassRoles: [],
  },

  // Admin Dashboard
  adminDashboard: {
    windowMs: 60 * 1000,
    maxBase: 200,
    bypassRoles: [ROLES.ADMIN],
  },
  adminReports: {
    windowMs: 5 * 60 * 1000,
    maxBase: 20,
    bypassRoles: [ROLES.ADMIN],
  },

  // Notificaciones
  notificationSend: {
    windowMs: 60 * 60 * 1000,
    maxBase: 100,
    bypassRoles: [ROLES.ADMIN],
  },
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Obtiene el multiplicador de rate limit para un rol
 * @param {string} role - Rol del usuario
 * @returns {number} Multiplicador
 */
function getRoleMultiplier(role) {
  if (!role) return ROLE_MULTIPLIERS.public;
  const normalizedRole = role.toLowerCase();
  return ROLE_MULTIPLIERS[normalizedRole] || ROLE_MULTIPLIERS.public;
}

/**
 * Calcula el límite de requests para un rol y endpoint específico
 * @param {string} endpointType - Tipo de endpoint (ej: 'login', 'productSearch')
 * @param {string} role - Rol del usuario
 * @returns {Object} { max, windowMs, bypass }
 */
function getRateLimitForRole(endpointType, role) {
  const baseLimit = BASE_LIMITS[endpointType];
  
  if (!baseLimit) {
    // Límite por defecto si no está definido
    return {
      max: 100,
      windowMs: 60 * 1000,
      bypass: false,
    };
  }

  const normalizedRole = role?.toLowerCase() || 'public';
  
  // Verificar si el rol puede bypasear el límite
  if (baseLimit.bypassRoles?.includes(normalizedRole)) {
    return {
      max: Infinity,
      windowMs: baseLimit.windowMs,
      bypass: true,
    };
  }

  const multiplier = getRoleMultiplier(normalizedRole);
  const calculatedMax = Math.ceil(baseLimit.maxBase * multiplier);

  return {
    max: calculatedMax,
    windowMs: baseLimit.windowMs,
    bypass: false,
  };
}

/**
 * Verifica si un rol puede bypasear el rate limiting para un endpoint
 * @param {string} endpointType - Tipo de endpoint
 * @param {string} role - Rol del usuario
 * @returns {boolean}
 */
function canBypassRateLimit(endpointType, role) {
  const baseLimit = BASE_LIMITS[endpointType];
  if (!baseLimit || !baseLimit.bypassRoles) return false;
  
  const normalizedRole = role?.toLowerCase();
  return baseLimit.bypassRoles.includes(normalizedRole);
}

/**
 * Obtiene información de rate limit para mostrar al usuario
 * @param {string} endpointType - Tipo de endpoint
 * @param {string} role - Rol del usuario
 * @returns {Object}
 */
function getRateLimitInfo(endpointType, role) {
  const limit = getRateLimitForRole(endpointType, role);
  const roleInfo = {
    role: role || 'public',
    multiplier: getRoleMultiplier(role),
  };

  return {
    ...limit,
    ...roleInfo,
    windowMinutes: Math.round(limit.windowMs / 60000),
    message: limit.bypass 
      ? 'Sin límite para tu rol'
      : `${limit.max} requests cada ${Math.round(limit.windowMs / 60000)} minutos`,
  };
}

/**
 * Lista todos los límites para un rol específico
 * @param {string} role - Rol del usuario
 * @returns {Object} Todos los límites calculados
 */
function getAllLimitsForRole(role) {
  const limits = {};
  
  for (const [endpoint, config] of Object.entries(BASE_LIMITS)) {
    limits[endpoint] = getRateLimitForRole(endpoint, role);
  }
  
  return limits;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Configuración
  ROLE_MULTIPLIERS,
  BASE_LIMITS,
  
  // Funciones
  getRoleMultiplier,
  getRateLimitForRole,
  canBypassRateLimit,
  getRateLimitInfo,
  getAllLimitsForRole,
};
