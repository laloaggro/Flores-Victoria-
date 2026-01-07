/**
 * @fileoverview Sistema de Auditoría de Seguridad para Flores Victoria
 * @description Registra eventos de seguridad como cambios de roles, permisos,
 *              intentos de acceso fallidos y actividades sospechosas
 * 
 * @example
 * const { auditSecurityEvent, AuditEvents } = require('@flores-victoria/shared/audit/security-audit');
 * 
 * await auditSecurityEvent(AuditEvents.ROLE_CHANGED, {
 *   targetUserId: '123',
 *   previousRole: 'customer',
 *   newRole: 'manager',
 *   changedBy: req.user.id,
 * });
 */

const logger = require('../logging/logger').createLogger('security-audit');
const Redis = require('ioredis');

// ═══════════════════════════════════════════════════════════════
// TIPOS DE EVENTOS DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════

/**
 * Eventos de auditoría de seguridad
 * @enum {string}
 */
const AuditEvents = {
  // Autenticación
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGIN_BLOCKED: 'auth.login.blocked',
  LOGOUT: 'auth.logout',
  PASSWORD_CHANGED: 'auth.password.changed',
  PASSWORD_RESET_REQUESTED: 'auth.password.reset_requested',
  PASSWORD_RESET_COMPLETED: 'auth.password.reset_completed',
  TOKEN_REFRESHED: 'auth.token.refreshed',
  TOKEN_REVOKED: 'auth.token.revoked',
  MFA_ENABLED: 'auth.mfa.enabled',
  MFA_DISABLED: 'auth.mfa.disabled',
  
  // Roles y Permisos
  ROLE_CHANGED: 'rbac.role.changed',
  ROLE_ESCALATION_ATTEMPT: 'rbac.role.escalation_attempt',
  PERMISSION_GRANTED: 'rbac.permission.granted',
  PERMISSION_REVOKED: 'rbac.permission.revoked',
  PERMISSION_DENIED: 'rbac.permission.denied',
  TEMPORARY_PERMISSION_GRANTED: 'rbac.temp_permission.granted',
  TEMPORARY_PERMISSION_EXPIRED: 'rbac.temp_permission.expired',
  
  // Usuarios
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_SUSPENDED: 'user.suspended',
  USER_REACTIVATED: 'user.reactivated',
  
  // Acceso a recursos
  SENSITIVE_DATA_ACCESSED: 'resource.sensitive.accessed',
  BULK_DATA_EXPORT: 'resource.bulk.export',
  ADMIN_PANEL_ACCESS: 'resource.admin.access',
  
  // Seguridad
  RATE_LIMIT_EXCEEDED: 'security.ratelimit.exceeded',
  SUSPICIOUS_ACTIVITY: 'security.suspicious',
  IP_BLOCKED: 'security.ip.blocked',
  CORS_VIOLATION: 'security.cors.violation',
  INVALID_TOKEN: 'security.token.invalid',
  
  // Sistema
  CONFIG_CHANGED: 'system.config.changed',
  BACKUP_CREATED: 'system.backup.created',
  MAINTENANCE_MODE: 'system.maintenance',
};

/**
 * Niveles de severidad para eventos
 * @enum {string}
 */
const AuditSeverity = {
  LOW: 'low',           // Eventos informativos
  MEDIUM: 'medium',     // Eventos que requieren atención
  HIGH: 'high',         // Eventos que requieren acción inmediata
  CRITICAL: 'critical', // Eventos de seguridad críticos
};

/**
 * Mapeo de eventos a severidad por defecto
 */
const EVENT_SEVERITY = {
  [AuditEvents.LOGIN_SUCCESS]: AuditSeverity.LOW,
  [AuditEvents.LOGIN_FAILED]: AuditSeverity.MEDIUM,
  [AuditEvents.LOGIN_BLOCKED]: AuditSeverity.HIGH,
  [AuditEvents.ROLE_CHANGED]: AuditSeverity.HIGH,
  [AuditEvents.ROLE_ESCALATION_ATTEMPT]: AuditSeverity.CRITICAL,
  [AuditEvents.PERMISSION_DENIED]: AuditSeverity.MEDIUM,
  [AuditEvents.USER_DELETED]: AuditSeverity.HIGH,
  [AuditEvents.USER_SUSPENDED]: AuditSeverity.HIGH,
  [AuditEvents.SENSITIVE_DATA_ACCESSED]: AuditSeverity.MEDIUM,
  [AuditEvents.BULK_DATA_EXPORT]: AuditSeverity.HIGH,
  [AuditEvents.RATE_LIMIT_EXCEEDED]: AuditSeverity.MEDIUM,
  [AuditEvents.SUSPICIOUS_ACTIVITY]: AuditSeverity.HIGH,
  [AuditEvents.IP_BLOCKED]: AuditSeverity.HIGH,
  [AuditEvents.CONFIG_CHANGED]: AuditSeverity.HIGH,
};

// ═══════════════════════════════════════════════════════════════
// STORAGE DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════

let redisClient = null;
const inMemoryLogs = [];
const MAX_IN_MEMORY_LOGS = 10000;

/**
 * Inicializa conexión a Valkey para almacenar logs de auditoría
 */
function initAuditStorage() {
  if (process.env.DISABLE_VALKEY === 'true') {
    logger.info('[SecurityAudit] Almacenamiento en memoria activado');
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
          db: parseInt(process.env.VALKEY_AUDIT_DB) || 3,
          lazyConnect: true,
          enableOfflineQueue: false,
        });

    client.on('connect', () => logger.info('[SecurityAudit] ✅ Valkey conectado'));
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
 * Registra un evento de auditoría de seguridad
 * @param {string} eventType - Tipo de evento (de AuditEvents)
 * @param {Object} data - Datos del evento
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Registro de auditoría creado
 */
async function auditSecurityEvent(eventType, data = {}, options = {}) {
  const timestamp = new Date().toISOString();
  const severity = options.severity || EVENT_SEVERITY[eventType] || AuditSeverity.LOW;
  
  const auditRecord = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    eventType,
    severity,
    data: {
      ...data,
      // Sanitizar datos sensibles
      password: data.password ? '[REDACTED]' : undefined,
      token: data.token ? '[REDACTED]' : undefined,
    },
    metadata: {
      service: process.env.SERVICE_NAME || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
    },
  };

  // Log basado en severidad
  const logMethod = severity === AuditSeverity.CRITICAL || severity === AuditSeverity.HIGH
    ? 'warn'
    : 'info';
  
  logger[logMethod](`[AUDIT:${severity.toUpperCase()}] ${eventType}`, {
    ...auditRecord.data,
    auditId: auditRecord.id,
  });

  // Almacenar en Valkey si está disponible
  if (redisClient && redisClient.status === 'ready') {
    try {
      const key = `audit:${eventType}:${auditRecord.id}`;
      await redisClient.setex(key, 90 * 24 * 60 * 60, JSON.stringify(auditRecord)); // 90 días
      
      // Índice por usuario si hay userId
      if (data.userId || data.targetUserId) {
        const userId = data.userId || data.targetUserId;
        await redisClient.lpush(`audit:user:${userId}`, key);
        await redisClient.ltrim(`audit:user:${userId}`, 0, 999); // Últimos 1000 eventos
      }
      
      // Índice por severidad para eventos críticos
      if (severity === AuditSeverity.CRITICAL || severity === AuditSeverity.HIGH) {
        await redisClient.lpush(`audit:severity:${severity}`, key);
        await redisClient.ltrim(`audit:severity:${severity}`, 0, 4999);
      }
    } catch (error) {
      logger.error('[SecurityAudit] Error guardando en Valkey:', error.message);
    }
  } else {
    // Almacenar en memoria como fallback
    inMemoryLogs.push(auditRecord);
    if (inMemoryLogs.length > MAX_IN_MEMORY_LOGS) {
      inMemoryLogs.shift();
    }
  }

  // Alertas para eventos críticos
  if (severity === AuditSeverity.CRITICAL) {
    await sendCriticalAlert(auditRecord);
  }

  return auditRecord;
}

/**
 * Envía alerta para eventos críticos
 */
async function sendCriticalAlert(auditRecord) {
  logger.error(`🚨 [CRITICAL SECURITY ALERT] ${auditRecord.eventType}`, {
    ...auditRecord.data,
    timestamp: auditRecord.timestamp,
  });
  
  // Aquí se integraría con sistemas de alertas externos
  // (Slack, PagerDuty, email, etc.)
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════

/**
 * Middleware para auditar cambios de rol
 * @param {Function} getDetails - Función para extraer detalles del request
 */
function auditRoleChange(getDetails = null) {
  return async (req, res, next) => {
    // Capturar el rol anterior antes del cambio
    const originalSend = res.send;
    
    res.send = async function(body) {
      try {
        // Solo auditar si la operación fue exitosa
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const details = getDetails ? getDetails(req, res, body) : {};
          
          if (details.previousRole !== details.newRole) {
            await auditSecurityEvent(AuditEvents.ROLE_CHANGED, {
              targetUserId: details.targetUserId || req.params.id,
              previousRole: details.previousRole,
              newRole: details.newRole,
              changedBy: req.user?.id || 'system',
              changedByRole: req.user?.role || 'system',
              reason: details.reason || req.body.reason,
              ip: req.ip,
              userAgent: req.get('User-Agent'),
            });
          }
        }
      } catch (error) {
        logger.error('[SecurityAudit] Error en middleware:', error.message);
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

/**
 * Middleware para auditar acceso a recursos sensibles
 */
function auditSensitiveAccess(resourceType) {
  return async (req, res, next) => {
    await auditSecurityEvent(AuditEvents.SENSITIVE_DATA_ACCESSED, {
      userId: req.user?.id,
      userRole: req.user?.role,
      resourceType,
      resourceId: req.params.id,
      action: req.method,
      path: req.path,
      ip: req.ip,
    });
    next();
  };
}

/**
 * Middleware para auditar intentos de escalación de privilegios
 */
function auditPrivilegeEscalation() {
  return async (req, res, next) => {
    const { ROLE_HIERARCHY } = require('../config/roles');
    
    if (req.body.role) {
      const userLevel = ROLE_HIERARCHY[req.user?.role] || 0;
      const targetLevel = ROLE_HIERARCHY[req.body.role] || 0;
      
      // Detectar intento de asignar rol mayor al propio
      if (targetLevel > userLevel && req.user?.role !== 'admin') {
        await auditSecurityEvent(AuditEvents.ROLE_ESCALATION_ATTEMPT, {
          userId: req.user?.id,
          userRole: req.user?.role,
          attemptedRole: req.body.role,
          targetUserId: req.params.id || req.body.userId,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        }, { severity: AuditSeverity.CRITICAL });
        
        return res.status(403).json({
          success: false,
          error: {
            code: 'PRIVILEGE_ESCALATION_DENIED',
            message: 'No puedes asignar un rol superior al tuyo',
          },
        });
      }
    }
    
    next();
  };
}

/**
 * Middleware para auditar exports masivos de datos
 */
function auditBulkExport(resourceType) {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = async function(body) {
      try {
        let recordCount = 0;
        const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
        
        if (Array.isArray(parsedBody)) {
          recordCount = parsedBody.length;
        } else if (parsedBody?.data && Array.isArray(parsedBody.data)) {
          recordCount = parsedBody.data.length;
        }
        
        // Auditar si se exportan más de 100 registros
        if (recordCount > 100) {
          await auditSecurityEvent(AuditEvents.BULK_DATA_EXPORT, {
            userId: req.user?.id,
            userRole: req.user?.role,
            resourceType,
            recordCount,
            path: req.path,
            query: req.query,
            ip: req.ip,
          });
        }
      } catch {}
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

// ═══════════════════════════════════════════════════════════════
// CONSULTAS DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════

/**
 * Obtiene el historial de auditoría de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de filtrado
 */
async function getUserAuditHistory(userId, options = {}) {
  const { limit = 50, eventTypes = null } = options;
  
  if (redisClient && redisClient.status === 'ready') {
    try {
      const keys = await redisClient.lrange(`audit:user:${userId}`, 0, limit - 1);
      const records = await Promise.all(
        keys.map(async (key) => {
          const data = await redisClient.get(key);
          return data ? JSON.parse(data) : null;
        })
      );
      
      return records
        .filter(Boolean)
        .filter((r) => !eventTypes || eventTypes.includes(r.eventType));
    } catch (error) {
      logger.error('[SecurityAudit] Error obteniendo historial:', error.message);
    }
  }
  
  // Fallback a memoria
  return inMemoryLogs
    .filter((r) => r.data.userId === userId || r.data.targetUserId === userId)
    .filter((r) => !eventTypes || eventTypes.includes(r.eventType))
    .slice(0, limit);
}

/**
 * Obtiene eventos críticos recientes
 * @param {number} limit - Número máximo de eventos
 */
async function getCriticalEvents(limit = 100) {
  const severities = [AuditSeverity.CRITICAL, AuditSeverity.HIGH];
  
  if (redisClient && redisClient.status === 'ready') {
    try {
      const allRecords = [];
      
      for (const severity of severities) {
        const keys = await redisClient.lrange(`audit:severity:${severity}`, 0, limit - 1);
        const records = await Promise.all(
          keys.map(async (key) => {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
          })
        );
        allRecords.push(...records.filter(Boolean));
      }
      
      return allRecords
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      logger.error('[SecurityAudit] Error obteniendo eventos críticos:', error.message);
    }
  }
  
  return inMemoryLogs
    .filter((r) => severities.includes(r.severity))
    .slice(-limit)
    .reverse();
}

/**
 * Obtiene historial de cambios de rol de un usuario
 * @param {string} userId - ID del usuario
 */
async function getRoleChangeHistory(userId) {
  return getUserAuditHistory(userId, {
    eventTypes: [AuditEvents.ROLE_CHANGED, AuditEvents.ROLE_ESCALATION_ATTEMPT],
    limit: 100,
  });
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

// Inicializar storage automáticamente
initAuditStorage();

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Constantes
  AuditEvents,
  AuditSeverity,
  
  // Función principal
  auditSecurityEvent,
  
  // Middleware
  auditRoleChange,
  auditSensitiveAccess,
  auditPrivilegeEscalation,
  auditBulkExport,
  
  // Consultas
  getUserAuditHistory,
  getCriticalEvents,
  getRoleChangeHistory,
  
  // Utilidades
  initAuditStorage,
};
