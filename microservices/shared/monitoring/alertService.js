/**
 * @fileoverview Sistema de alertas para monitoreo de servicios
 * Detecta condiciones críticas y envía notificaciones
 */

const EventEmitter = require('events');

/**
 * Tipos de alerta
 */
const AlertType = {
  SERVICE_DOWN: 'service_down',
  HIGH_ERROR_RATE: 'high_error_rate',
  HIGH_LATENCY: 'high_latency',
  DB_CONNECTION: 'db_connection',
  DISK_SPACE: 'disk_space',
  MEMORY_HIGH: 'memory_high',
  CPU_HIGH: 'cpu_high',
  RATE_LIMIT: 'rate_limit',
  SECURITY: 'security',
  CUSTOM: 'custom',
};

/**
 * Severidad de alertas
 */
const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * Canales de notificación
 */
const NotificationChannel = {
  SLACK: 'slack',
  EMAIL: 'email',
  SMS: 'sms',
  WEBHOOK: 'webhook',
  CONSOLE: 'console',
};

/**
 * Servicio de alertas
 */
class AlertService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.serviceName = options.serviceName || 'unknown';
    this.alerts = new Map();
    this.alertHistory = [];
    this.rules = new Map();
    this.channels = new Map();
    this.cooldowns = new Map();
    this.defaultCooldownMs = options.defaultCooldownMs || 5 * 60 * 1000; // 5 min
    this.maxHistorySize = options.maxHistorySize || 1000;
    this.metrics = {
      errorsInWindow: [],
      latenciesInWindow: [],
      healthCheckFailures: new Map(),
    };

    // Configurar reglas por defecto
    this._setupDefaultRules();
  }

  /**
   * Configurar reglas de alerta por defecto
   */
  _setupDefaultRules() {
    // Service down: 3 health check failures consecutivos
    this.addRule({
      id: 'service_down',
      type: AlertType.SERVICE_DOWN,
      condition: (ctx) => ctx.consecutiveFailures >= 3,
      severity: AlertSeverity.CRITICAL,
      channels: [NotificationChannel.SLACK, NotificationChannel.EMAIL],
      cooldownMs: 10 * 60 * 1000, // 10 min
      message: (ctx) => `🚨 Service ${ctx.serviceName} is DOWN after ${ctx.consecutiveFailures} failed health checks`,
    });

    // High error rate: >5% errores en 5 minutos
    this.addRule({
      id: 'high_error_rate',
      type: AlertType.HIGH_ERROR_RATE,
      condition: (ctx) => ctx.errorRate > 0.05,
      severity: AlertSeverity.ERROR,
      channels: [NotificationChannel.SLACK],
      cooldownMs: 5 * 60 * 1000,
      message: (ctx) => `⚠️ High error rate: ${(ctx.errorRate * 100).toFixed(2)}% in ${ctx.serviceName}`,
    });

    // High latency: p95 > 2s por 5 minutos
    this.addRule({
      id: 'high_latency',
      type: AlertType.HIGH_LATENCY,
      condition: (ctx) => ctx.p95Latency > 2000,
      severity: AlertSeverity.WARNING,
      channels: [NotificationChannel.SLACK],
      cooldownMs: 5 * 60 * 1000,
      message: (ctx) => `🐢 High latency detected: p95=${ctx.p95Latency}ms in ${ctx.serviceName}`,
    });

    // Database connection pool exhausted
    this.addRule({
      id: 'db_pool_exhausted',
      type: AlertType.DB_CONNECTION,
      condition: (ctx) => ctx.poolExhausted === true,
      severity: AlertSeverity.CRITICAL,
      channels: [NotificationChannel.SLACK, NotificationChannel.EMAIL],
      cooldownMs: 5 * 60 * 1000,
      message: (ctx) => `🔴 Database connection pool exhausted in ${ctx.serviceName}`,
    });

    // High memory usage
    this.addRule({
      id: 'high_memory',
      type: AlertType.MEMORY_HIGH,
      condition: (ctx) => ctx.memoryUsagePercent > 85,
      severity: AlertSeverity.WARNING,
      channels: [NotificationChannel.SLACK],
      cooldownMs: 10 * 60 * 1000,
      message: (ctx) => `💾 High memory usage: ${ctx.memoryUsagePercent.toFixed(1)}% in ${ctx.serviceName}`,
    });

    // High CPU usage
    this.addRule({
      id: 'high_cpu',
      type: AlertType.CPU_HIGH,
      condition: (ctx) => ctx.cpuUsagePercent > 80,
      severity: AlertSeverity.WARNING,
      channels: [NotificationChannel.SLACK],
      cooldownMs: 10 * 60 * 1000,
      message: (ctx) => `🔥 High CPU usage: ${ctx.cpuUsagePercent.toFixed(1)}% in ${ctx.serviceName}`,
    });
  }

  /**
   * Agregar una regla de alerta personalizada
   */
  addRule(rule) {
    this.rules.set(rule.id, {
      id: rule.id,
      type: rule.type || AlertType.CUSTOM,
      condition: rule.condition,
      severity: rule.severity || AlertSeverity.WARNING,
      channels: rule.channels || [NotificationChannel.CONSOLE],
      cooldownMs: rule.cooldownMs || this.defaultCooldownMs,
      message: rule.message || (() => `Alert: ${rule.id}`),
      enabled: rule.enabled !== false,
    });
    return this;
  }

  /**
   * Configurar canal de notificación
   */
  configureChannel(channel, config) {
    this.channels.set(channel, config);
    return this;
  }

  /**
   * Verificar si una alerta está en cooldown
   */
  isInCooldown(ruleId) {
    const lastFired = this.cooldowns.get(ruleId);
    if (!lastFired) return false;

    const rule = this.rules.get(ruleId);
    const cooldownMs = rule?.cooldownMs || this.defaultCooldownMs;
    return Date.now() - lastFired < cooldownMs;
  }

  /**
   * Evaluar todas las reglas con el contexto actual
   */
  async evaluate(context) {
    const ctx = {
      ...context,
      serviceName: this.serviceName,
      timestamp: new Date().toISOString(),
    };

    const triggeredAlerts = [];

    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue;
      if (this.isInCooldown(ruleId)) continue;

      try {
        if (rule.condition(ctx)) {
          const alert = await this._fireAlert(rule, ctx);
          triggeredAlerts.push(alert);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${ruleId}:`, error.message);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Disparar una alerta
   */
  async _fireAlert(rule, context) {
    const alert = {
      id: `${rule.id}-${Date.now()}`,
      ruleId: rule.id,
      type: rule.type,
      severity: rule.severity,
      message: typeof rule.message === 'function' ? rule.message(context) : rule.message,
      context,
      timestamp: new Date().toISOString(),
      channels: rule.channels,
    };

    // Registrar cooldown
    this.cooldowns.set(rule.id, Date.now());

    // Guardar en historial
    this._addToHistory(alert);

    // Guardar alerta activa
    this.alerts.set(alert.id, alert);

    // Emitir evento
    this.emit('alert', alert);

    // Enviar notificaciones
    await this._sendNotifications(alert);

    return alert;
  }

  /**
   * Agregar alerta al historial
   */
  _addToHistory(alert) {
    this.alertHistory.unshift(alert);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.pop();
    }
  }

  /**
   * Enviar notificaciones a través de los canales configurados
   */
  async _sendNotifications(alert) {
    const notifications = [];

    for (const channel of alert.channels) {
      const config = this.channels.get(channel);

      try {
        switch (channel) {
          case NotificationChannel.SLACK:
            notifications.push(this._sendSlackNotification(alert, config));
            break;
          case NotificationChannel.EMAIL:
            notifications.push(this._sendEmailNotification(alert, config));
            break;
          case NotificationChannel.WEBHOOK:
            notifications.push(this._sendWebhookNotification(alert, config));
            break;
          case NotificationChannel.CONSOLE:
          default:
            this._logToConsole(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send notification to ${channel}:`, error.message);
      }
    }

    await Promise.allSettled(notifications);
  }

  /**
   * Enviar notificación a Slack
   */
  async _sendSlackNotification(alert, config) {
    if (!config?.webhookUrl) {
      console.warn('Slack webhook URL not configured');
      return;
    }

    const color = {
      [AlertSeverity.INFO]: '#36a64f',
      [AlertSeverity.WARNING]: '#ffa500',
      [AlertSeverity.ERROR]: '#ff6b6b',
      [AlertSeverity.CRITICAL]: '#ff0000',
    }[alert.severity] || '#808080';

    const payload = {
      attachments: [
        {
          color,
          title: `${this._getSeverityEmoji(alert.severity)} ${alert.type.toUpperCase()}`,
          text: alert.message,
          fields: [
            { title: 'Service', value: this.serviceName, short: true },
            { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
            { title: 'Time', value: alert.timestamp, short: true },
          ],
          footer: 'Flores Victoria Monitoring',
        },
      ],
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.status}`);
    }
  }

  /**
   * Enviar notificación por email (usa notification-service)
   */
  async _sendEmailNotification(alert, config) {
    if (!config?.notificationServiceUrl) {
      console.warn('Email notification service URL not configured');
      return;
    }

    const payload = {
      to: config.recipients || [],
      subject: `[${alert.severity.toUpperCase()}] ${alert.type} - ${this.serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: ${alert.severity === AlertSeverity.CRITICAL ? '#ff0000' : '#333'}">
            ${this._getSeverityEmoji(alert.severity)} Alert: ${alert.type}
          </h2>
          <p><strong>Message:</strong> ${alert.message}</p>
          <p><strong>Service:</strong> ${this.serviceName}</p>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Time:</strong> ${alert.timestamp}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Flores Victoria Monitoring System</p>
        </div>
      `,
    };

    const response = await fetch(`${config.notificationServiceUrl}/api/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.serviceToken || ''}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Email notification failed: ${response.status}`);
    }
  }

  /**
   * Enviar notificación via webhook genérico
   */
  async _sendWebhookNotification(alert, config) {
    if (!config?.url) {
      console.warn('Webhook URL not configured');
      return;
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
      body: JSON.stringify({
        alert,
        service: this.serviceName,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed: ${response.status}`);
    }
  }

  /**
   * Log a consola
   */
  _logToConsole(alert) {
    const prefix = {
      [AlertSeverity.INFO]: '\x1b[36m[INFO]\x1b[0m',
      [AlertSeverity.WARNING]: '\x1b[33m[WARNING]\x1b[0m',
      [AlertSeverity.ERROR]: '\x1b[31m[ERROR]\x1b[0m',
      [AlertSeverity.CRITICAL]: '\x1b[35m[CRITICAL]\x1b[0m',
    }[alert.severity] || '[ALERT]';

    console.log(`${prefix} ${alert.message}`);
  }

  /**
   * Obtener emoji según severidad
   */
  _getSeverityEmoji(severity) {
    return {
      [AlertSeverity.INFO]: 'ℹ️',
      [AlertSeverity.WARNING]: '⚠️',
      [AlertSeverity.ERROR]: '🔴',
      [AlertSeverity.CRITICAL]: '🚨',
    }[severity] || '📢';
  }

  // ============================================
  // Métodos de tracking de métricas
  // ============================================

  /**
   * Registrar un error para calcular error rate
   */
  trackError(error) {
    const windowMs = 5 * 60 * 1000; // 5 min window
    const now = Date.now();

    this.metrics.errorsInWindow.push({ timestamp: now, error: error?.message });

    // Limpiar errores fuera de la ventana
    this.metrics.errorsInWindow = this.metrics.errorsInWindow.filter(
      (e) => now - e.timestamp < windowMs
    );
  }

  /**
   * Registrar latencia de request
   */
  trackLatency(durationMs) {
    const windowMs = 5 * 60 * 1000;
    const now = Date.now();

    this.metrics.latenciesInWindow.push({ timestamp: now, duration: durationMs });

    // Limpiar latencias fuera de la ventana
    this.metrics.latenciesInWindow = this.metrics.latenciesInWindow.filter(
      (l) => now - l.timestamp < windowMs
    );
  }

  /**
   * Registrar fallo de health check
   */
  trackHealthCheckFailure(serviceName) {
    const failures = this.metrics.healthCheckFailures.get(serviceName) || 0;
    this.metrics.healthCheckFailures.set(serviceName, failures + 1);
  }

  /**
   * Resetear contador de health check
   */
  resetHealthCheckFailures(serviceName) {
    this.metrics.healthCheckFailures.set(serviceName, 0);
  }

  /**
   * Calcular contexto de métricas para evaluación
   */
  getMetricsContext(totalRequests = 1) {
    const errors = this.metrics.errorsInWindow.length;
    const errorRate = totalRequests > 0 ? errors / totalRequests : 0;

    // Calcular p95 de latencias
    const latencies = this.metrics.latenciesInWindow
      .map((l) => l.duration)
      .sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index] || 0;

    // Métricas de sistema
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    return {
      errorRate,
      errorsInWindow: errors,
      p95Latency,
      avgLatency: latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0,
      memoryUsagePercent,
      memoryUsed: usedMemory,
      memoryTotal: totalMemory,
      cpuUsagePercent: 0, // Requiere medición asíncrona
    };
  }

  /**
   * Obtener alertas activas
   */
  getActiveAlerts() {
    return Array.from(this.alerts.values());
  }

  /**
   * Obtener historial de alertas
   */
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(0, limit);
  }

  /**
   * Resolver/cerrar una alerta
   */
  resolveAlert(alertId) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.alerts.delete(alertId);
      this.emit('alertResolved', alert);
      return alert;
    }
    return null;
  }

  /**
   * Limpiar todas las alertas
   */
  clearAlerts() {
    this.alerts.clear();
    this.cooldowns.clear();
  }
}

// Exportar tipos y clase
module.exports = AlertService;
module.exports.AlertType = AlertType;
module.exports.AlertSeverity = AlertSeverity;
module.exports.NotificationChannel = NotificationChannel;
