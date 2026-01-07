/**
 * @fileoverview Índice de Módulos de Seguridad y RBAC
 * @description Exporta todos los módulos relacionados con roles, permisos y auditoría
 * 
 * @example
 * const security = require('@flores-victoria/shared/security');
 * 
 * // Roles y permisos
 * const { ROLES, PERMISSIONS, hasPermission } = security.rbac;
 * 
 * // Rate limiting por rol
 * const { createRoleBasedLimiter } = security.rateLimiting;
 * 
 * // Permisos temporales
 * const { grantTemporaryPermission } = security.temporaryPermissions;
 * 
 * // Auditoría
 * const { auditSecurityEvent } = security.audit;
 */

// Roles y permisos base
const roles = require('../config/roles');

// Rate limiting por rol
const rateLimitsByRole = require('../config/rate-limits-by-role');
const roleBasedLimiter = require('../middleware/role-based-limiter');

// Middleware de autorización
const authorize = require('../middleware/authorize');

// Auditoría de seguridad
const securityAudit = require('../audit/security-audit');

// Permisos temporales
const temporaryPermissions = require('../permissions/temporary-permissions');

// ═══════════════════════════════════════════════════════════════
// EXPORTS ORGANIZADOS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // ─────────────────────────────────────────────────────────────
  // RBAC (Role-Based Access Control)
  // ─────────────────────────────────────────────────────────────
  rbac: {
    // Constantes
    ROLES: roles.ROLES,
    PERMISSIONS: roles.PERMISSIONS,
    ROLE_HIERARCHY: roles.ROLE_HIERARCHY,
    ROLE_PERMISSIONS: roles.ROLE_PERMISSIONS,
    
    // Funciones de verificación
    hasPermission: roles.hasPermission,
    hasAnyPermission: roles.hasAnyPermission,
    hasAllPermissions: roles.hasAllPermissions,
    isRoleAtLeast: roles.isRoleAtLeast,
    canManageRole: roles.canManageRole,
    
    // Utilidades
    normalizeRole: roles.normalizeRole,
    getPermissions: roles.getPermissions,
    getRoleInfo: roles.getRoleInfo,
    getValidRoles: roles.getValidRoles,
    isValidRole: roles.isValidRole,
  },

  // ─────────────────────────────────────────────────────────────
  // Autorización (Middleware)
  // ─────────────────────────────────────────────────────────────
  authorization: {
    // Middleware de roles
    requireRole: authorize.requireRole,
    requireRoleLevel: authorize.requireRoleLevel,
    
    // Middleware de permisos
    requirePermission: authorize.requirePermission,
    requireAnyPermission: authorize.requireAnyPermission,
    requireAllPermissions: authorize.requireAllPermissions,
    
    // Middleware de propiedad
    requireOwnership: authorize.requireOwnership,
    
    // Shortcuts
    adminOnly: authorize.adminOnly,
    managerOnly: authorize.managerOnly,
    staffOnly: authorize.staffOnly,
    authenticated: authorize.authenticated,
    
    // Helpers
    attachPermissions: authorize.attachPermissions,
    requireAuth: authorize.requireAuth,
  },

  // ─────────────────────────────────────────────────────────────
  // Rate Limiting por Rol
  // ─────────────────────────────────────────────────────────────
  rateLimiting: {
    // Configuración
    ROLE_MULTIPLIERS: rateLimitsByRole.ROLE_MULTIPLIERS,
    BASE_LIMITS: rateLimitsByRole.BASE_LIMITS,
    
    // Funciones
    getRoleMultiplier: rateLimitsByRole.getRoleMultiplier,
    getRateLimitForRole: rateLimitsByRole.getRateLimitForRole,
    canBypassRateLimit: rateLimitsByRole.canBypassRateLimit,
    getRateLimitInfo: rateLimitsByRole.getRateLimitInfo,
    getAllLimitsForRole: rateLimitsByRole.getAllLimitsForRole,
    
    // Middleware factory
    createRoleBasedLimiter: roleBasedLimiter.createRoleBasedLimiter,
    dynamicRoleLimiter: roleBasedLimiter.dynamicRoleLimiter,
    rateLimitInfoMiddleware: roleBasedLimiter.rateLimitInfoMiddleware,
    
    // Limiters pre-configurados
    limiters: {
      login: roleBasedLimiter.loginLimiter,
      register: roleBasedLimiter.registerLimiter,
      passwordReset: roleBasedLimiter.passwordResetLimiter,
      productSearch: roleBasedLimiter.productSearchLimiter,
      productBrowse: roleBasedLimiter.productBrowseLimiter,
      productCreate: roleBasedLimiter.productCreateLimiter,
      productUpdate: roleBasedLimiter.productUpdateLimiter,
      cart: roleBasedLimiter.cartLimiter,
      orderCreate: roleBasedLimiter.orderCreateLimiter,
      orderView: roleBasedLimiter.orderViewLimiter,
      orderUpdate: roleBasedLimiter.orderUpdateLimiter,
      reviewCreate: roleBasedLimiter.reviewCreateLimiter,
      reviewModerate: roleBasedLimiter.reviewModerateLimiter,
      upload: roleBasedLimiter.uploadLimiter,
      contactForm: roleBasedLimiter.contactFormLimiter,
      adminDashboard: roleBasedLimiter.adminDashboardLimiter,
      adminReports: roleBasedLimiter.adminReportsLimiter,
      notification: roleBasedLimiter.notificationLimiter,
      apiGeneral: roleBasedLimiter.apiGeneralLimiter,
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Permisos Temporales
  // ─────────────────────────────────────────────────────────────
  temporaryPermissions: {
    // Configuración
    ALLOWED_DURATIONS: temporaryPermissions.ALLOWED_DURATIONS,
    SECURITY_LIMITS: temporaryPermissions.SECURITY_LIMITS,
    SENSITIVE_PERMISSIONS: temporaryPermissions.SENSITIVE_PERMISSIONS,
    
    // Funciones principales
    grant: temporaryPermissions.grantTemporaryPermission,
    revoke: temporaryPermissions.revokeTemporaryPermission,
    check: temporaryPermissions.hasTemporaryPermission,
    getForUser: temporaryPermissions.getUserTemporaryPermissions,
    checkWithRole: temporaryPermissions.checkPermissionWithTemporary,
    extend: temporaryPermissions.extendTemporaryPermission,
    
    // Middleware
    requirePermissionWithTemporary: temporaryPermissions.requirePermissionWithTemporary,
    attachTemporaryPermissions: temporaryPermissions.attachTemporaryPermissions,
    
    // Utilidades
    parseDuration: temporaryPermissions.parseDuration,
  },

  // ─────────────────────────────────────────────────────────────
  // Auditoría de Seguridad
  // ─────────────────────────────────────────────────────────────
  audit: {
    // Constantes
    Events: securityAudit.AuditEvents,
    Severity: securityAudit.AuditSeverity,
    
    // Función principal
    log: securityAudit.auditSecurityEvent,
    
    // Middleware
    roleChange: securityAudit.auditRoleChange,
    sensitiveAccess: securityAudit.auditSensitiveAccess,
    privilegeEscalation: securityAudit.auditPrivilegeEscalation,
    bulkExport: securityAudit.auditBulkExport,
    
    // Consultas
    getUserHistory: securityAudit.getUserAuditHistory,
    getCriticalEvents: securityAudit.getCriticalEvents,
    getRoleHistory: securityAudit.getRoleChangeHistory,
  },
};
