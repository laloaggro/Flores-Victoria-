/**
 * @fileoverview Módulo de monitoreo - Exportaciones principales
 */

const AlertService = require('./alertService');
const MonitoringService = require('./monitoringService');
const BusinessMetricsService = require('./businessMetricsService');

// Re-exportar tipos
const { AlertType, AlertSeverity, NotificationChannel } = AlertService;
const { ServiceStatus } = MonitoringService;

/**
 * Crear instancia configurada del servicio de monitoreo
 */
function createMonitoringStack(config = {}) {
  const monitoring = new MonitoringService({
    serviceName: config.serviceName || 'flores-victoria',
    checkIntervalMs: config.checkIntervalMs || 30000,
  });

  // Registrar servicios a monitorear
  const services = config.services || [
    { name: 'api-gateway', url: process.env.API_GATEWAY_URL || 'http://localhost:3000' },
    { name: 'auth-service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
    { name: 'user-service', url: process.env.USER_SERVICE_URL || 'http://localhost:3002' },
    { name: 'product-service', url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3009' },
    { name: 'order-service', url: process.env.ORDER_SERVICE_URL || 'http://localhost:3004' },
    { name: 'cart-service', url: process.env.CART_SERVICE_URL || 'http://localhost:3005' },
  ];

  services.forEach((service) => monitoring.registerService(service));

  // Configurar canales de alerta
  if (config.slackWebhook) {
    monitoring.configureAlertChannel(NotificationChannel.SLACK, {
      webhookUrl: config.slackWebhook,
    });
  }

  if (config.emailConfig) {
    monitoring.configureAlertChannel(NotificationChannel.EMAIL, {
      notificationServiceUrl: config.emailConfig.notificationServiceUrl,
      recipients: config.emailConfig.recipients,
      serviceToken: config.emailConfig.serviceToken,
    });
  }

  // Crear servicio de métricas de negocio
  const businessMetrics = new BusinessMetricsService({
    orderServiceUrl: process.env.ORDER_SERVICE_URL,
    productServiceUrl: process.env.PRODUCT_SERVICE_URL,
    userServiceUrl: process.env.USER_SERVICE_URL,
    cartServiceUrl: process.env.CART_SERVICE_URL,
    serviceToken: process.env.SERVICE_TOKEN,
  });

  return {
    monitoring,
    businessMetrics,
    start: () => monitoring.start(),
    stop: () => monitoring.stop(),
  };
}

module.exports = {
  // Clases principales
  AlertService,
  MonitoringService,
  BusinessMetricsService,

  // Tipos
  AlertType,
  AlertSeverity,
  NotificationChannel,
  ServiceStatus,

  // Factory function
  createMonitoringStack,
};
