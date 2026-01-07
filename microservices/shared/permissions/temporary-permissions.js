/**
 * @fileoverview Sistema de Permisos Temporales para Flores Victoria
 * @description Permite otorgar permisos con fecha de expiración automática
 *              Útil para promociones temporales, cubrimiento de vacaciones,
 *              accesos de proyecto, etc.
 * 
 * @example
 * const { grantTemporaryPermission, TemporaryPermissions } = require('@flores-victoria/shared/permissions/temporary-permissions');
 * 
 * // Otorgar permiso temporal por 7 días
 * await grantTemporaryPermission({
 *   userId: 'user123',
 *   permission: PERMISSIONS.ORDERS_VIEW_ALL,
 *   expiresIn: '7d',
 *   grantedBy: req.user.id,
 *   reason: 'Cubrimiento de vacaciones',
 * });
 */

const Redis = require('ioredis');
const { PERMISSIONS, hasPermission } = require('../config/roles');
const { auditSecurityEvent, AuditEvents } = require('../audit/security-audit');
const logger = require('../logging/logger').createLogger('temporary-permissions');

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const TEMP_PERMISSION_PREFIX = 'temp_perm';
const USER_TEMP_PERMISSIONS_KEY = 'user_temp_perms';

/**
 * Duraciones permitidas para permisos temporales
 */
const ALLOWED_DURATIONS = {
  '1h': 60 * 60,
  '4h': 4 * 60 * 60,
  '8h': 8 * 60 * 60,
  '1d': 24 * 60 * 60,
  '3d': 3 * 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '14d': 14 * 24 * 60 * 60,
  '30d': 30 * 24 * 60 * 60,
  '90d': 90 * 24 * 60 * 60,
};

/**
 * Límites de seguridad
 */
const SECURITY_LIMITS = {
  maxActivePermissionsPerUser: 10,
  maxDurationDays: 90,
  requireApprovalForSensitive: true,
};

/**
 * Permisos que requieren aprobación adicional
 */
const SENSITIVE_PERMISSIONS = [
  PERMISSIONS.USERS_MANAGE_ROLES,
  PERMISSIONS.USERS_DELETE,
  PERMISSIONS.SYSTEM_CONFIG,
  PERMISSIONS.SYSTEM_BACKUP,
];

// ═══════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════

let redisClient = null;
const inMemoryPermissions = new Map();

/**
 * Inicializa conexión a Valkey
 */
function initStorage() {
  if (process.env.DISABLE_VALKEY === 'true') {
    logger.info('[TempPermissions] Modo memoria activado');
    return null;
  }

  try {
    const cacheUrl = process.env.VALKEY_URL;
    const client = cacheUrl
      ? new Redis(cacheUrl, { lazyConnect: true, enableOfflineQueue: false })
      : new Redis({
          host: process.env.VALKEY_HOST || 'localhost',
          port: parseInt(process.env.VALKEY_PORT) || 6379,
          password: process.env.VALKEY_PASSWORD,
          db: parseInt(process.env.VALKEY_PERMISSIONS_DB) || 4,
          lazyConnect: true,
          enableOfflineQueue: false,
        });

    client.on('connect', () => logger.info('[TempPermissions] ✅ Valkey conectado'));
    client.on('error', () => {});

    client.connect().catch(() => {});
    redisClient = client;
    return client;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES PRINCIPALES
// ═══════════════════════════════════════════════════════════════

/**
 * Parsea duración a segundos
 * @param {string|number} duration - Duración ('7d', '1h', etc.) o segundos
 * @returns {number} Segundos
 */
function parseDuration(duration) {
  if (typeof duration === 'number') return duration;
  
  const match = duration.match(/^(\d+)(h|d)$/);
  if (!match) {
    if (ALLOWED_DURATIONS[duration]) {
      return ALLOWED_DURATIONS[duration];
    }
    throw new Error(`Duración inválida: ${duration}`);
  }
  
  const [, value, unit] = match;
  const multiplier = unit === 'h' ? 60 * 60 : 24 * 60 * 60;
  return parseInt(value) * multiplier;
}

/**
 * Otorga un permiso temporal a un usuario
 * @param {Object} params - Parámetros
 * @param {string} params.userId - ID del usuario
 * @param {string} params.permission - Permiso a otorgar
 * @param {string|number} params.expiresIn - Duración ('7d', '1h', etc.)
 * @param {string} params.grantedBy - ID de quien otorga el permiso
 * @param {string} params.reason - Razón del permiso temporal
 * @param {string} [params.grantedByRole] - Rol de quien otorga
 * @returns {Promise<Object>} Permiso temporal creado
 */
async function grantTemporaryPermission(params) {
  const {
    userId,
    permission,
    expiresIn,
    grantedBy,
    grantedByRole = 'admin',
    reason,
  } = params;

  // Validaciones
  if (!userId || !permission || !expiresIn || !grantedBy) {
    throw new Error('Parámetros requeridos: userId, permission, expiresIn, grantedBy');
  }

  // Validar que el permiso existe
  if (!Object.values(PERMISSIONS).includes(permission)) {
    throw new Error(`Permiso inválido: ${permission}`);
  }

  // Validar duración máxima
  const durationSeconds = parseDuration(expiresIn);
  const maxDuration = SECURITY_LIMITS.maxDurationDays * 24 * 60 * 60;
  if (durationSeconds > maxDuration) {
    throw new Error(`Duración máxima: ${SECURITY_LIMITS.maxDurationDays} días`);
  }

  // Verificar si es permiso sensible
  if (SENSITIVE_PERMISSIONS.includes(permission)) {
    if (grantedByRole !== 'admin') {
      throw new Error('Solo administradores pueden otorgar permisos sensibles');
    }
    logger.warn('[TempPermissions] Permiso sensible otorgado', {
      permission,
      userId,
      grantedBy,
    });
  }

  // Verificar límite de permisos activos
  const activeCount = await getActivePermissionsCount(userId);
  if (activeCount >= SECURITY_LIMITS.maxActivePermissionsPerUser) {
    throw new Error(`Límite de permisos temporales activos: ${SECURITY_LIMITS.maxActivePermissionsPerUser}`);
  }

  const now = Date.now();
  const expiresAt = new Date(now + durationSeconds * 1000);
  
  const tempPermission = {
    id: `tp_${now}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    permission,
    grantedBy,
    grantedByRole,
    reason,
    grantedAt: new Date(now).toISOString(),
    expiresAt: expiresAt.toISOString(),
    durationSeconds,
    status: 'active',
  };

  // Almacenar
  if (redisClient && redisClient.status === 'ready') {
    const key = `${TEMP_PERMISSION_PREFIX}:${userId}:${permission}`;
    await redisClient.setex(key, durationSeconds, JSON.stringify(tempPermission));
    
    // Índice por usuario
    await redisClient.sadd(`${USER_TEMP_PERMISSIONS_KEY}:${userId}`, key);
  } else {
    // Memoria
    const key = `${userId}:${permission}`;
    inMemoryPermissions.set(key, {
      ...tempPermission,
      expiresAtMs: now + durationSeconds * 1000,
    });
    
    // Programar limpieza
    setTimeout(() => {
      inMemoryPermissions.delete(key);
    }, durationSeconds * 1000);
  }

  // Auditar
  await auditSecurityEvent(AuditEvents.TEMPORARY_PERMISSION_GRANTED, {
    userId,
    permission,
    grantedBy,
    grantedByRole,
    reason,
    expiresAt: expiresAt.toISOString(),
    durationHours: Math.round(durationSeconds / 3600),
  });

  logger.info('[TempPermissions] Permiso temporal otorgado', {
    userId,
    permission,
    expiresAt: expiresAt.toISOString(),
  });

  return tempPermission;
}

/**
 * Revoca un permiso temporal
 * @param {string} userId - ID del usuario
 * @param {string} permission - Permiso a revocar
 * @param {string} revokedBy - ID de quien revoca
 * @param {string} [reason] - Razón de la revocación
 */
async function revokeTemporaryPermission(userId, permission, revokedBy, reason = '') {
  if (redisClient && redisClient.status === 'ready') {
    const key = `${TEMP_PERMISSION_PREFIX}:${userId}:${permission}`;
    const data = await redisClient.get(key);
    
    if (data) {
      await redisClient.del(key);
      await redisClient.srem(`${USER_TEMP_PERMISSIONS_KEY}:${userId}`, key);
      
      await auditSecurityEvent(AuditEvents.PERMISSION_REVOKED, {
        userId,
        permission,
        revokedBy,
        reason,
        wasTemporary: true,
      });
      
      logger.info('[TempPermissions] Permiso temporal revocado', {
        userId,
        permission,
        revokedBy,
      });
      
      return true;
    }
  } else {
    const key = `${userId}:${permission}`;
    if (inMemoryPermissions.has(key)) {
      inMemoryPermissions.delete(key);
      return true;
    }
  }
  
  return false;
}

/**
 * Verifica si un usuario tiene un permiso temporal activo
 * @param {string} userId - ID del usuario
 * @param {string} permission - Permiso a verificar
 * @returns {Promise<boolean>}
 */
async function hasTemporaryPermission(userId, permission) {
  if (redisClient && redisClient.status === 'ready') {
    const key = `${TEMP_PERMISSION_PREFIX}:${userId}:${permission}`;
    const data = await redisClient.get(key);
    return !!data;
  }
  
  const key = `${userId}:${permission}`;
  const perm = inMemoryPermissions.get(key);
  
  if (!perm) return false;
  if (perm.expiresAtMs < Date.now()) {
    inMemoryPermissions.delete(key);
    return false;
  }
  
  return true;
}

/**
 * Obtiene todos los permisos temporales activos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object[]>}
 */
async function getUserTemporaryPermissions(userId) {
  const permissions = [];
  
  if (redisClient && redisClient.status === 'ready') {
    const keys = await redisClient.smembers(`${USER_TEMP_PERMISSIONS_KEY}:${userId}`);
    
    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        permissions.push(JSON.parse(data));
      } else {
        // Limpiar referencia huérfana
        await redisClient.srem(`${USER_TEMP_PERMISSIONS_KEY}:${userId}`, key);
      }
    }
  } else {
    const now = Date.now();
    for (const [key, perm] of inMemoryPermissions.entries()) {
      if (key.startsWith(`${userId}:`) && perm.expiresAtMs > now) {
        permissions.push(perm);
      }
    }
  }
  
  return permissions;
}

/**
 * Cuenta permisos temporales activos de un usuario
 */
async function getActivePermissionsCount(userId) {
  const perms = await getUserTemporaryPermissions(userId);
  return perms.length;
}

/**
 * Verifica si un usuario tiene permiso (permanente o temporal)
 * @param {string} userId - ID del usuario
 * @param {string} userRole - Rol del usuario
 * @param {string} permission - Permiso a verificar
 * @returns {Promise<Object>} { hasPermission, source: 'role' | 'temporary' }
 */
async function checkPermissionWithTemporary(userId, userRole, permission) {
  // Primero verificar permiso permanente por rol
  if (hasPermission(userRole, permission)) {
    return { hasPermission: true, source: 'role' };
  }
  
  // Luego verificar permisos temporales
  const hasTempPerm = await hasTemporaryPermission(userId, permission);
  if (hasTempPerm) {
    return { hasPermission: true, source: 'temporary' };
  }
  
  return { hasPermission: false, source: null };
}

/**
 * Extiende un permiso temporal existente
 * @param {string} userId - ID del usuario
 * @param {string} permission - Permiso a extender
 * @param {string} additionalDuration - Duración adicional
 * @param {string} extendedBy - ID de quien extiende
 */
async function extendTemporaryPermission(userId, permission, additionalDuration, extendedBy) {
  const existing = await getUserTemporaryPermissions(userId);
  const perm = existing.find((p) => p.permission === permission);
  
  if (!perm) {
    throw new Error('Permiso temporal no encontrado');
  }
  
  // Revocar el existente
  await revokeTemporaryPermission(userId, permission, extendedBy, 'Extensión de permiso');
  
  // Calcular nueva duración
  const remainingMs = new Date(perm.expiresAt) - Date.now();
  const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const additionalSeconds = parseDuration(additionalDuration);
  const newDuration = remainingSeconds + additionalSeconds;
  
  // Verificar límite
  const maxDuration = SECURITY_LIMITS.maxDurationDays * 24 * 60 * 60;
  if (newDuration > maxDuration) {
    throw new Error(`Duración máxima total: ${SECURITY_LIMITS.maxDurationDays} días`);
  }
  
  // Crear nuevo permiso con duración extendida
  return grantTemporaryPermission({
    userId,
    permission,
    expiresIn: newDuration,
    grantedBy: extendedBy,
    reason: `Extensión: ${perm.reason}`,
  });
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Middleware que verifica permisos incluyendo temporales
 * @param {string} requiredPermission - Permiso requerido
 */
function requirePermissionWithTemporary(requiredPermission) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' },
      });
    }

    const { hasPermission: allowed, source } = await checkPermissionWithTemporary(
      req.user.id || req.user.userId,
      req.user.role,
      requiredPermission
    );

    if (!allowed) {
      await auditSecurityEvent(AuditEvents.PERMISSION_DENIED, {
        userId: req.user.id,
        permission: requiredPermission,
        path: req.path,
        method: req.method,
      });
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `No tienes permiso: ${requiredPermission}`,
          requiredPermission,
        },
      });
    }

    // Añadir info al request
    req.permissionSource = source;
    if (source === 'temporary') {
      req.isTemporaryPermission = true;
    }

    next();
  };
}

/**
 * Middleware para añadir permisos temporales al request
 */
function attachTemporaryPermissions() {
  return async (req, res, next) => {
    if (req.user) {
      const userId = req.user.id || req.user.userId;
      req.temporaryPermissions = await getUserTemporaryPermissions(userId);
      
      // Añadir helper para verificar
      req.hasTempPermission = async (permission) => {
        return hasTemporaryPermission(userId, permission);
      };
    }
    next();
  };
}

// ═══════════════════════════════════════════════════════════════
// LIMPIEZA Y MANTENIMIENTO
// ═══════════════════════════════════════════════════════════════

/**
 * Limpia permisos expirados de la memoria
 */
function cleanupExpiredPermissions() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, perm] of inMemoryPermissions.entries()) {
    if (perm.expiresAtMs < now) {
      inMemoryPermissions.delete(key);
      cleaned++;
      
      // Auditar expiración
      auditSecurityEvent(AuditEvents.TEMPORARY_PERMISSION_EXPIRED, {
        userId: perm.userId,
        permission: perm.permission,
        grantedBy: perm.grantedBy,
        originalReason: perm.reason,
      }).catch(() => {});
    }
  }
  
  if (cleaned > 0) {
    logger.info(`[TempPermissions] ${cleaned} permisos expirados limpiados`);
  }
}

// Ejecutar limpieza cada 5 minutos
setInterval(cleanupExpiredPermissions, 5 * 60 * 1000);

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

initStorage();

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Constantes
  ALLOWED_DURATIONS,
  SECURITY_LIMITS,
  SENSITIVE_PERMISSIONS,
  
  // Funciones principales
  grantTemporaryPermission,
  revokeTemporaryPermission,
  hasTemporaryPermission,
  getUserTemporaryPermissions,
  checkPermissionWithTemporary,
  extendTemporaryPermission,
  
  // Middleware
  requirePermissionWithTemporary,
  attachTemporaryPermissions,
  
  // Utilidades
  parseDuration,
  cleanupExpiredPermissions,
  initStorage,
};
