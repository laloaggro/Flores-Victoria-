/**
 * @fileoverview Servicio de Auditoría para Flores Victoria
 * Registra acciones críticas del sistema para trazabilidad y seguridad
 * 
 * Uso: Registrar cambios de roles, accesos denegados, operaciones CRUD críticas
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS DE EVENTOS DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════

const AUDIT_EVENTS = {
  // Autenticación
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILED: 'auth.login.failed',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_PASSWORD_CHANGE: 'auth.password.change',
  AUTH_PASSWORD_RESET: 'auth.password.reset',
  AUTH_2FA_ENABLED: 'auth.2fa.enabled',
  AUTH_2FA_DISABLED: 'auth.2fa.disabled',
  
  // Roles y permisos
  ROLE_CHANGED: 'role.changed',
  ROLE_CREATED: 'role.created',
  PERMISSION_GRANTED: 'permission.granted',
  PERMISSION_REVOKED: 'permission.revoked',
  
  // Accesos
  ACCESS_DENIED: 'access.denied',
  ACCESS_SUSPICIOUS: 'access.suspicious',
  
  // Usuarios
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_BLOCKED: 'user.blocked',
  USER_UNBLOCKED: 'user.unblocked',
  
  // Productos
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_STOCK_CHANGED: 'product.stock.changed',
  
  // Pedidos
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_REFUNDED: 'order.refunded',
  ORDER_ASSIGNED: 'order.assigned',
  
  // Pagos
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  
  // Promociones
  PROMOTION_CREATED: 'promotion.created',
  PROMOTION_UPDATED: 'promotion.updated',
  PROMOTION_DELETED: 'promotion.deleted',
  
  // Sistema
  SYSTEM_CONFIG_CHANGED: 'system.config.changed',
  SYSTEM_BACKUP_CREATED: 'system.backup.created',
  SYSTEM_BACKUP_RESTORED: 'system.backup.restored',
  
  // Entregas
  DELIVERY_ASSIGNED: 'delivery.assigned',
  DELIVERY_STATUS_CHANGED: 'delivery.status.changed',
  DELIVERY_COMPLETED: 'delivery.completed',
};

// Niveles de severidad
const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Mapeo de eventos a severidad
const EVENT_SEVERITY = {
  [AUDIT_EVENTS.AUTH_LOGIN_FAILED]: SEVERITY.MEDIUM,
  [AUDIT_EVENTS.ACCESS_DENIED]: SEVERITY.MEDIUM,
  [AUDIT_EVENTS.ACCESS_SUSPICIOUS]: SEVERITY.HIGH,
  [AUDIT_EVENTS.ROLE_CHANGED]: SEVERITY.HIGH,
  [AUDIT_EVENTS.USER_DELETED]: SEVERITY.HIGH,
  [AUDIT_EVENTS.USER_BLOCKED]: SEVERITY.HIGH,
  [AUDIT_EVENTS.PRODUCT_DELETED]: SEVERITY.MEDIUM,
  [AUDIT_EVENTS.ORDER_CANCELLED]: SEVERITY.MEDIUM,
  [AUDIT_EVENTS.ORDER_REFUNDED]: SEVERITY.HIGH,
  [AUDIT_EVENTS.PAYMENT_REFUNDED]: SEVERITY.HIGH,
  [AUDIT_EVENTS.SYSTEM_CONFIG_CHANGED]: SEVERITY.CRITICAL,
  [AUDIT_EVENTS.SYSTEM_BACKUP_RESTORED]: SEVERITY.CRITICAL,
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════

class AuditService {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'unknown';
    this.logger = options.logger || console;
    this.store = options.store || null; // Redis, MongoDB, PostgreSQL, etc.
    this.buffer = [];
    this.bufferSize = options.bufferSize || 100;
    this.flushInterval = options.flushInterval || 5000; // 5 segundos
    
    // Iniciar flush periódico
    if (this.store) {
      this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * Registra un evento de auditoría
   * @param {Object} event - Datos del evento
   * @returns {Object} Registro de auditoría creado
   */
  async log(event) {
    const auditRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      event: event.type || 'unknown',
      severity: EVENT_SEVERITY[event.type] || SEVERITY.LOW,
      
      // Actor (quién realizó la acción)
      actor: {
        userId: event.userId || null,
        email: event.userEmail || null,
        role: event.userRole || null,
        ip: event.ip || null,
        userAgent: event.userAgent || null,
      },
      
      // Recurso afectado
      resource: {
        type: event.resourceType || null,
        id: event.resourceId || null,
        name: event.resourceName || null,
      },
      
      // Detalles del cambio
      changes: {
        before: event.before || null,
        after: event.after || null,
      },
      
      // Metadata adicional
      metadata: {
        requestId: event.requestId || null,
        sessionId: event.sessionId || null,
        ...event.metadata,
      },
      
      // Resultado
      success: event.success !== false,
      errorMessage: event.errorMessage || null,
    };

    // Log inmediato a consola/logger
    this.logToConsole(auditRecord);
    
    // Agregar al buffer para persistencia
    this.buffer.push(auditRecord);
    
    // Flush si el buffer está lleno
    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }
    
    return auditRecord;
  }

  /**
   * Log a consola con formato
   */
  logToConsole(record) {
    const prefix = `[AUDIT:${record.severity.toUpperCase()}]`;
    const actor = record.actor.email || record.actor.userId || 'anonymous';
    const resource = record.resource.type 
      ? `${record.resource.type}:${record.resource.id || 'N/A'}`
      : 'N/A';
    
    const message = `${prefix} ${record.event} | Actor: ${actor} | Resource: ${resource} | Success: ${record.success}`;
    
    if (record.severity === SEVERITY.CRITICAL || record.severity === SEVERITY.HIGH) {
      this.logger.warn(message, { audit: record });
    } else {
      this.logger.info(message, { audit: record });
    }
  }

  /**
   * Flush del buffer a almacenamiento persistente
   */
  async flush() {
    if (this.buffer.length === 0 || !this.store) return;
    
    const records = [...this.buffer];
    this.buffer = [];
    
    try {
      await this.store.saveAuditRecords(records);
    } catch (error) {
      this.logger.error('[AUDIT] Error saving audit records:', error);
      // Re-agregar al buffer en caso de error
      this.buffer = [...records, ...this.buffer].slice(0, this.bufferSize * 2);
    }
  }

  /**
   * Genera ID único para el registro
   */
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `aud_${timestamp}_${random}`;
  }

  /**
   * Limpiar recursos
   */
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    return this.flush();
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS DE CONVENIENCIA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Login exitoso
   */
  async logLoginSuccess(userId, email, ip, userAgent, metadata = {}) {
    return this.log({
      type: AUDIT_EVENTS.AUTH_LOGIN_SUCCESS,
      userId,
      userEmail: email,
      ip,
      userAgent,
      metadata,
    });
  }

  /**
   * Login fallido
   */
  async logLoginFailed(email, ip, userAgent, reason, metadata = {}) {
    return this.log({
      type: AUDIT_EVENTS.AUTH_LOGIN_FAILED,
      userEmail: email,
      ip,
      userAgent,
      success: false,
      errorMessage: reason,
      metadata,
    });
  }

  /**
   * Cambio de rol
   */
  async logRoleChange(adminId, adminEmail, targetUserId, oldRole, newRole, metadata = {}) {
    return this.log({
      type: AUDIT_EVENTS.ROLE_CHANGED,
      userId: adminId,
      userEmail: adminEmail,
      resourceType: 'user',
      resourceId: targetUserId,
      before: { role: oldRole },
      after: { role: newRole },
      metadata,
    });
  }

  /**
   * Acceso denegado
   */
  async logAccessDenied(userId, email, role, resource, permission, ip, metadata = {}) {
    return this.log({
      type: AUDIT_EVENTS.ACCESS_DENIED,
      userId,
      userEmail: email,
      userRole: role,
      resourceType: resource,
      ip,
      success: false,
      errorMessage: `Permission denied: ${permission}`,
      metadata,
    });
  }

  /**
   * Pedido creado
   */
  async logOrderCreated(userId, email, orderId, total, metadata = {}) {
    return this.log({
      type: AUDIT_EVENTS.ORDER_CREATED,
      userId,
      userEmail: email,
      resourceType: 'order',
      resourceId: orderId,
      after: { total },
      metadata,
    });
  }

  /**
   * Estado de pedido cambiado
   */
  async logOrderStatusChanged(userId, email, orderId, oldStatus, newStatus, metadata = {}) {
    return this.log({
      type: AUDIT_EVENTS.ORDER_STATUS_CHANGED,
      userId,
      userEmail: email,
      resourceType: 'order',
      resourceId: orderId,
      before: { status: oldStatus },
      after: { status: newStatus },
      metadata,
    });
  }

  /**
   * Producto creado/actualizado/eliminado
   */
  async logProductChange(event, userId, email, productId, productName, changes = {}, metadata = {}) {
    return this.log({
      type: event,
      userId,
      userEmail: email,
      resourceType: 'product',
      resourceId: productId,
      resourceName: productName,
      before: changes.before || null,
      after: changes.after || null,
      metadata,
    });
  }

  /**
   * Configuración del sistema cambiada
   */
  async logSystemConfigChanged(userId, email, configKey, oldValue, newValue, metadata = {}) {
    return this.log({
      type: AUDIT_EVENTS.SYSTEM_CONFIG_CHANGED,
      userId,
      userEmail: email,
      resourceType: 'config',
      resourceId: configKey,
      before: { value: oldValue },
      after: { value: newValue },
      metadata,
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE DE AUDITORÍA PARA EXPRESS
// ═══════════════════════════════════════════════════════════════

/**
 * Middleware para inyectar servicio de auditoría en el request
 */
function auditMiddleware(auditService) {
  return (req, res, next) => {
    req.audit = auditService;
    
    // Capturar información del request
    req.auditContext = {
      ip: req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      requestId: req.id || req.headers['x-request-id'],
    };
    
    next();
  };
}

/**
 * Middleware para registrar accesos denegados automáticamente
 */
function auditAccessDenied(auditService) {
  return (err, req, res, next) => {
    if (err.statusCode === 403 || err.code === 'FORBIDDEN' || err.code === 'PERMISSION_DENIED') {
      auditService.logAccessDenied(
        req.user?.id || req.user?.userId,
        req.user?.email,
        req.user?.role,
        req.originalUrl,
        err.requiredPermission || 'unknown',
        req.auditContext?.ip,
        {
          requestId: req.auditContext?.requestId,
          method: req.method,
          path: req.path,
        }
      );
    }
    next(err);
  };
}

// ═══════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Crea una instancia del servicio de auditoría
 */
function createAuditService(options = {}) {
  return new AuditService(options);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  AuditService,
  AUDIT_EVENTS,
  SEVERITY,
  auditMiddleware,
  auditAccessDenied,
  createAuditService,
};
