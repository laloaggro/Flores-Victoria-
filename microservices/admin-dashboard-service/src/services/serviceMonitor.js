/**
 * Servicio de monitoreo y health checks de todos los microservicios
 */
const axios = require('axios');
const { logger } = require('@flores-victoria/shared/utils/logger');
const config = require('../config');

class ServiceMonitor {
  constructor() {
    this.services = [
      { name: 'API Gateway', url: config.services.apiGateway, port: 8080, critical: true },
      { name: 'Auth Service', url: config.services.authService, port: 3001, critical: true },
      { name: 'User Service', url: config.services.userService, port: 3002, critical: true },
      { name: 'Cart Service', url: config.services.cartService, port: 3003, critical: false },
      { name: 'Order Service', url: config.services.orderService, port: 3004, critical: true },
      {
        name: 'Wishlist Service',
        url: config.services.wishlistService,
        port: 3005,
        critical: false,
      },
      { name: 'Review Service', url: config.services.reviewService, port: 3006, critical: false },
      { name: 'Contact Service', url: config.services.contactService, port: 3007, critical: false },
      { name: 'Product Service', url: config.services.productService, port: 3009, critical: true },
    ];
  }

  /**
   * Verifica el health de un servicio individual
   */
  async checkServiceHealth(service) {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${service.url}/health`, {
        timeout: 5000,
        validateStatus: (status) => status === 200,
      });

      const responseTime = Date.now() - startTime;

      return {
        name: service.name,
        status: 'healthy',
        url: service.url,
        port: service.port,
        critical: service.critical,
        responseTime,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error(`Health check failed for ${service.name}`, {
        service: service.name,
        error: error.message,
      });

      return {
        name: service.name,
        status: 'unhealthy',
        url: service.url,
        port: service.port,
        critical: service.critical,
        responseTime,
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Verifica el health de todos los servicios en paralelo
   */
  async checkAllServices() {
    const checks = this.services.map((service) => this.checkServiceHealth(service));
    const results = await Promise.all(checks);

    const summary = {
      total: results.length,
      healthy: results.filter((r) => r.status === 'healthy').length,
      unhealthy: results.filter((r) => r.status === 'unhealthy').length,
      criticalDown: results.filter((r) => r.status === 'unhealthy' && r.critical).length,
      timestamp: new Date().toISOString(),
    };

    return {
      summary,
      services: results,
    };
  }

  /**
   * Obtiene métricas detalladas de un servicio
   */
  async getServiceMetrics(serviceName) {
    const service = this.services.find((s) => s.name === serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    try {
      const [health, metrics] = await Promise.allSettled([
        axios.get(`${service.url}/health`, { timeout: 5000 }),
        axios.get(`${service.url}/metrics`, { timeout: 5000 }).catch(() => null),
      ]);

      return {
        name: service.name,
        health: health.status === 'fulfilled' ? health.value.data : null,
        metrics: metrics.status === 'fulfilled' && metrics.value ? metrics.value.data : null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get metrics for ${serviceName}: ${error.message}`);
    }
  }

  /**
   * Obtiene la lista de servicios configurados
   */
  getServicesList() {
    return this.services.map((s) => ({
      name: s.name,
      url: s.url,
      port: s.port,
      critical: s.critical,
    }));
  }

  /**
   * Controla un servicio (restart, stop, start)
   * Nota: Esto requiere Railway CLI o API de Railway configurada
   */
  async controlService(serviceName, action) {
    const service = this.services.find((s) => s.name === serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    // Para Railway, usaríamos la API de Railway
    // Por ahora, retornamos una respuesta simulada
    logger.info(`Service control action requested`, {
      service: serviceName,
      action,
      url: service.url
    });

    // Simular acción (en producción real, aquí iría la llamada a Railway API)
    const actions = {
      restart: 'reiniciado',
      stop: 'detenido',
      start: 'iniciado'
    };

    return {
      message: `Solicitud de ${actions[action] || action} enviada para ${serviceName}. Nota: Control automático requiere integración con Railway API.`,
      service: serviceName,
      action,
      note: 'Para control real, configura RAILWAY_TOKEN en las variables de entorno'
    };
  }
}

module.exports = new ServiceMonitor();
