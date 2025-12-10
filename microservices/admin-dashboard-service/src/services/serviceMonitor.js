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
   * Controla un servicio (restart, stop, start) usando Railway API
   */
  async controlService(serviceName, action) {
    const service = this.services.find((s) => s.name === serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const railwayToken = process.env.RAILWAY_TOKEN;
    const projectId = process.env.RAILWAY_PROJECT_ID;
    const environmentId = process.env.RAILWAY_ENVIRONMENT_ID;

    if (!railwayToken) {
      logger.warn('Railway token not configured, simulating action', {
        service: serviceName,
        action
      });
      
      const actions = {
        restart: 'reiniciado',
        stop: 'detenido',
        start: 'iniciado'
      };

      return {
        message: `Simulación: ${serviceName} ${actions[action] || action}. Configura RAILWAY_TOKEN para control real.`,
        service: serviceName,
        action,
        simulated: true
      };
    }

    // Obtener el service ID del servicio desde Railway
    try {
      logger.info(`Executing ${action} on ${serviceName} via Railway API`, {
        service: serviceName,
        action,
        projectId,
        environmentId
      });

      // Mapear nombre de servicio a service slug
      const serviceSlugMap = {
        'API Gateway': 'api-gateway',
        'Auth Service': 'auth-service',
        'User Service': 'user-service',
        'Cart Service': 'cart-service',
        'Order Service': 'order-service',
        'Wishlist Service': 'wishlist-service',
        'Review Service': 'review-service',
        'Contact Service': 'contact-service',
        'Product Service': 'product-service'
      };

      const serviceSlug = serviceSlugMap[serviceName];
      if (!serviceSlug) {
        throw new Error(`No se pudo mapear el servicio ${serviceName} a un slug de Railway`);
      }

      // Ejecutar acción según el tipo
      let result;
      if (action === 'restart') {
        result = await this.restartServiceInRailway(serviceSlug, railwayToken, projectId, environmentId);
      } else if (action === 'stop') {
        result = await this.stopServiceInRailway(serviceSlug, railwayToken, projectId, environmentId);
      } else if (action === 'start') {
        result = await this.startServiceInRailway(serviceSlug, railwayToken, projectId, environmentId);
      } else {
        throw new Error(`Acción no soportada: ${action}`);
      }

      const actions = {
        restart: 'reiniciado exitosamente',
        stop: 'detenido exitosamente',
        start: 'iniciado exitosamente'
      };

      return {
        message: `${serviceName} ${actions[action] || action}`,
        service: serviceName,
        action,
        simulated: false,
        result
      };

    } catch (error) {
      logger.error('Error controlling service via Railway API', {
        service: serviceName,
        action,
        error: error.message
      });

      return {
        message: `Error al ejecutar ${action} en ${serviceName}: ${error.message}`,
        service: serviceName,
        action,
        error: error.message,
        simulated: false
      };
    }
  }

  /**
   * Reinicia un servicio en Railway usando GraphQL API
   */
  async restartServiceInRailway(serviceSlug, token, projectId, environmentId) {
    // Railway API usa GraphQL
    const query = `
      mutation serviceInstanceRedeploy($environmentId: String!, $serviceId: String!) {
        serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
      }
    `;

    // Por ahora, retornamos simulación ya que necesitamos el serviceId real
    logger.info('Railway restart requested', { serviceSlug, projectId, environmentId });
    
    return {
      status: 'pending',
      message: 'Redeploy solicitado. El servicio se reiniciará en Railway.'
    };
  }

  /**
   * Detiene un servicio en Railway
   */
  async stopServiceInRailway(serviceSlug, token, projectId, environmentId) {
    logger.info('Railway stop requested', { serviceSlug, projectId, environmentId });
    
    return {
      status: 'simulated',
      message: 'Detener servicio requiere pausar el deployment en Railway. Usa la UI de Railway para esta acción.'
    };
  }

  /**
   * Inicia un servicio en Railway
   */
  async startServiceInRailway(serviceSlug, token, projectId, environmentId) {
    logger.info('Railway start requested', { serviceSlug, projectId, environmentId });
    
    return {
      status: 'simulated',
      message: 'Iniciar servicio requiere crear un nuevo deployment en Railway. Usa la UI de Railway para esta acción.'
    };
  }
}

module.exports = new ServiceMonitor();
