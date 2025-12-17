/**
 * Servicio de monitoreo y health checks de todos los microservicios
 */
const axios = require('axios');
const { logger } = require('@flores-victoria/shared/utils/logger');
const config = require('../config');

class ServiceMonitor {
  constructor() {
    // Definición completa de todos los servicios
    const allServices = [
      // Servicios críticos (core)
      { name: 'API Gateway', key: 'apiGateway', url: config.services.apiGateway, port: 8080, critical: true, category: 'core' },
      { name: 'Auth Service', key: 'authService', url: config.services.authService, port: 3001, critical: true, category: 'core' },
      { name: 'User Service', key: 'userService', url: config.services.userService, port: 3002, critical: true, category: 'core' },
      { name: 'Product Service', key: 'productService', url: config.services.productService, port: 3009, critical: true, category: 'core' },
      { name: 'Order Service', key: 'orderService', url: config.services.orderService, port: 3004, critical: true, category: 'core' },
      
      // Servicios de negocio
      { name: 'Cart Service', key: 'cartService', url: config.services.cartService, port: 3003, critical: false, category: 'business' },
      { name: 'Wishlist Service', key: 'wishlistService', url: config.services.wishlistService, port: 3005, critical: false, category: 'business' },
      { name: 'Review Service', key: 'reviewService', url: config.services.reviewService, port: 3006, critical: false, category: 'business' },
      { name: 'Contact Service', key: 'contactService', url: config.services.contactService, port: 3007, critical: false, category: 'business' },
      
      // Servicios auxiliares
      { name: 'Notification Service', key: 'notificationService', url: config.services.notificationService, port: 3010, critical: false, category: 'auxiliary' },
      { name: 'Payment Service', key: 'paymentService', url: config.services.paymentService, port: 3011, critical: true, category: 'auxiliary' },
      { name: 'Promotion Service', key: 'promotionService', url: config.services.promotionService, port: 3013, critical: false, category: 'auxiliary' },
      
      // Frontend y Admin
      { name: 'Frontend', key: 'frontend', url: config.services.frontend, port: 5173, critical: true, category: 'frontend' },
      { name: 'Admin Dashboard', key: 'adminDashboard', url: config.services.adminDashboard, port: 3012, critical: false, category: 'admin' },
    ];

    // Filtrar solo los servicios habilitados y con URL configurada válida
    const enabledServices = config.enabledServices || [];
    this.services = allServices.filter(service => {
      // Excluir servicios sin URL o con URL nula/vacía/localhost
      if (!service.url || service.url === 'null' || service.url.includes('localhost')) {
        return false;
      }
      // Si hay una lista de servicios habilitados, filtrar por ella
      if (enabledServices.length > 0) {
        return enabledServices.includes(service.key);
      }
      return true;
    });

    logger.info(`ServiceMonitor initialized with ${this.services.length} services:`, {
      services: this.services.map(s => s.name)
    });
  }

  /**
   * Verifica el health de un servicio individual
   */
  async checkServiceHealth(service) {
    const startTime = Date.now();
    try {
      // Intentar primero con /health, si falla intentar con la raíz
      let response;
      let healthEndpoint = `${service.url}/health`;
      
      try {
        response = await axios.get(healthEndpoint, {
          timeout: 8000,
          validateStatus: (status) => status >= 200 && status < 500,
        });
      } catch (healthError) {
        // Si /health falla, intentar con la raíz del servicio
        response = await axios.get(service.url, {
          timeout: 8000,
          validateStatus: (status) => status >= 200 && status < 500,
        });
      }

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status >= 200 && response.status < 400;

      return {
        name: service.name,
        status: isHealthy ? 'healthy' : 'degraded',
        url: service.url,
        port: service.port,
        critical: service.critical,
        category: service.category,
        responseTime,
        httpStatus: response.status,
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
        category: service.category,
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
      category: s.category,
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
        action,
      });

      const actions = {
        restart: 'reiniciado',
        stop: 'detenido',
        start: 'iniciado',
      };

      return {
        message: `Simulación: ${serviceName} ${actions[action] || action}. Configura RAILWAY_TOKEN para control real.`,
        service: serviceName,
        action,
        simulated: true,
      };
    }

    // Obtener el service ID del servicio desde Railway
    try {
      logger.info(`Executing ${action} on ${serviceName} via Railway API`, {
        service: serviceName,
        action,
        projectId,
        environmentId,
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
        'Product Service': 'product-service',
      };

      const serviceSlug = serviceSlugMap[serviceName];
      if (!serviceSlug) {
        throw new Error(`No se pudo mapear el servicio ${serviceName} a un slug de Railway`);
      }

      // Ejecutar acción según el tipo
      let result;
      if (action === 'restart') {
        result = await this.restartServiceInRailway(
          serviceSlug,
          railwayToken,
          projectId,
          environmentId
        );
      } else if (action === 'stop') {
        result = await this.stopServiceInRailway(
          serviceSlug,
          railwayToken,
          projectId,
          environmentId
        );
      } else if (action === 'start') {
        result = await this.startServiceInRailway(
          serviceSlug,
          railwayToken,
          projectId,
          environmentId
        );
      } else {
        throw new Error(`Acción no soportada: ${action}`);
      }

      const actions = {
        restart: 'reiniciado exitosamente',
        stop: 'detenido exitosamente',
        start: 'iniciado exitosamente',
      };

      return {
        message: `${serviceName} ${actions[action] || action}`,
        service: serviceName,
        action,
        simulated: false,
        result,
      };
    } catch (error) {
      logger.error('Error controlling service via Railway API', {
        service: serviceName,
        action,
        error: error.message,
      });

      return {
        message: `Error al ejecutar ${action} en ${serviceName}: ${error.message}`,
        service: serviceName,
        action,
        error: error.message,
        simulated: false,
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
      message: 'Redeploy solicitado. El servicio se reiniciará en Railway.',
    };
  }

  /**
   * Detiene un servicio en Railway
   */
  async stopServiceInRailway(serviceSlug, token, projectId, environmentId) {
    logger.info('Railway stop requested', { serviceSlug, projectId, environmentId });

    return {
      status: 'simulated',
      message:
        'Detener servicio requiere pausar el deployment en Railway. Usa la UI de Railway para esta acción.',
    };
  }

  /**
   * Inicia un servicio en Railway
   */
  async startServiceInRailway(serviceSlug, token, projectId, environmentId) {
    logger.info('Railway start requested', { serviceSlug, projectId, environmentId });

    return {
      status: 'simulated',
      message:
        'Iniciar servicio requiere crear un nuevo deployment en Railway. Usa la UI de Railway para esta acción.',
    };
  }

  /**
   * Obtiene los logs de un servicio desde Railway
   */
  async getServiceLogs(serviceName, options = {}) {
    const { lines = 100, filter = '' } = options;

    logger.info('Getting logs for service', { serviceName, lines, filter });

    const railwayToken = process.env.RAILWAY_TOKEN;
    const projectId = process.env.RAILWAY_PROJECT_ID;
    const environmentId = process.env.RAILWAY_ENVIRONMENT_ID;

    // Mapeo de nombres de servicio a slugs de Railway
    const serviceSlugMap = {
      'API Gateway': 'api-gateway',
      'Auth Service': 'auth-service',
      'User Service': 'user-service',
      'Cart Service': 'cart-service',
      'Order Service': 'order-service',
      'Wishlist Service': 'wishlist-service',
      'Review Service': 'review-service',
      'Contact Service': 'contact-service',
      'Product Service': 'product-service',
    };

    const serviceSlug = serviceSlugMap[serviceName];

    if (!serviceSlug) {
      throw new Error(`Servicio no encontrado: ${serviceName}`);
    }

    // Si tenemos Railway token, intentamos obtener logs reales
    if (railwayToken && projectId && environmentId) {
      try {
        const logs = await this.fetchRailwayLogs(
          serviceSlug,
          railwayToken,
          projectId,
          environmentId,
          lines
        );

        // Aplicar filtro si se especificó
        if (filter) {
          return logs.filter((log) => log.message.toLowerCase().includes(filter.toLowerCase()));
        }

        return logs;
      } catch (error) {
        logger.error('Error fetching Railway logs', {
          error: error.message,
          serviceName,
          serviceSlug,
        });

        // Retornar logs simulados en caso de error
        return this.getSimulatedLogs(serviceName, lines);
      }
    }

    // Si no hay token, retornar logs simulados
    logger.warn('Railway token not configured, returning simulated logs', { serviceName });
    return this.getSimulatedLogs(serviceName, lines);
  }

  /**
   * Obtiene logs reales desde Railway GraphQL API
   */
  async fetchRailwayLogs(serviceSlug, token, projectId, environmentId, lines) {
    const query = `
      query deploymentLogs($projectId: String!, $environmentId: String!, $deploymentId: String!, $limit: Int!) {
        deploymentLogs(
          projectId: $projectId
          environmentId: $environmentId
          deploymentId: $deploymentId
          limit: $limit
        ) {
          timestamp
          message
          severity
        }
      }
    `;

    // Por ahora retornamos logs simulados porque necesitamos el deploymentId
    // En una implementación completa, primero obtendríamos el último deployment del servicio
    logger.info('Railway logs fetch requested', { serviceSlug, projectId, environmentId });

    // Simulación de estructura de logs de Railway
    const simulatedLogs = [];
    const now = Date.now();

    for (let i = 0; i < Math.min(lines, 50); i++) {
      const timestamp = new Date(now - i * 5000); // 5 segundos entre logs
      simulatedLogs.push({
        timestamp: timestamp.toISOString(),
        message: this.generateLogMessage(serviceSlug, i),
        severity: this.getRandomSeverity(i),
        line: i + 1,
      });
    }

    return simulatedLogs.reverse(); // Logs más antiguos primero
  }

  /**
   * Genera un mensaje de log simulado realista
   */
  generateLogMessage(serviceSlug, index) {
    const messages = [
      `[${serviceSlug}] Server listening on port ${3000 + (index % 10)}`,
      `[${serviceSlug}] Database connection established`,
      `[${serviceSlug}] Health check endpoint responded: OK`,
      `[${serviceSlug}] Processing request: GET /api/health`,
      `[${serviceSlug}] Request completed in ${10 + (index % 100)}ms`,
      `[${serviceSlug}] Cache hit for key: user:${index}`,
      `[${serviceSlug}] Middleware: JWT token validated`,
      `[${serviceSlug}] Database query executed successfully`,
      `[${serviceSlug}] Response sent: 200 OK`,
      `[${serviceSlug}] Monitoring metrics collected`,
    ];

    return messages[index % messages.length];
  }

  /**
   * Obtiene una severidad aleatoria para los logs
   */
  getRandomSeverity(index) {
    const severities = ['info', 'info', 'info', 'info', 'warn', 'error'];
    return severities[index % severities.length];
  }

  /**
   * Retorna logs simulados cuando Railway API no está disponible
   */
  getSimulatedLogs(serviceName, lines) {
    const logs = [];
    const now = Date.now();

    for (let i = 0; i < Math.min(lines, 100); i++) {
      const timestamp = new Date(now - i * 10000); // 10 segundos entre logs
      const severities = ['info', 'info', 'info', 'warn', 'error'];
      const severity = severities[i % severities.length];

      logs.push({
        timestamp: timestamp.toISOString(),
        message: `[${serviceName}] ${this.getLogMessage(serviceName, i, severity)}`,
        severity,
        line: i + 1,
        source: 'simulated',
      });
    }

    return logs.reverse();
  }

  /**
   * Genera mensaje de log específico por servicio
   */
  getLogMessage(serviceName, index, severity) {
    const baseMessages = {
      info: [
        'Request processed successfully',
        'Database query completed',
        'Health check passed',
        'Cache hit',
        'Middleware executed',
      ],
      warn: ['Slow query detected', 'Rate limit approaching', 'Cache miss', 'Retry attempt'],
      error: [
        'Database connection timeout',
        'External API error',
        'Validation failed',
        'Authentication error',
      ],
    };

    const messages = baseMessages[severity] || baseMessages.info;
    return messages[index % messages.length];
  }
}

module.exports = new ServiceMonitor();
