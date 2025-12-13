/**
 * @fileoverview Health Check Dashboard Endpoint
 * @description Endpoint que agrega estado de salud de todos los microservicios
 *
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const http = require('http');
const https = require('https');

// ====================================================================
// CONFIGURACIÓN DE SERVICIOS
// ====================================================================

/**
 * Lista de servicios a monitorear
 * Los URLs se obtienen de variables de entorno o valores por defecto
 */
const getServiceConfig = () => ({
  services: [
    {
      name: 'auth-service',
      url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      healthPath: '/health',
      critical: true,
    },
    {
      name: 'product-service',
      url: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3009',
      healthPath: '/health',
      critical: true,
    },
    {
      name: 'user-service',
      url: process.env.USER_SERVICE_URL || 'http://user-service:3003',
      healthPath: '/health',
      critical: false,
    },
    {
      name: 'order-service',
      url: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
      healthPath: '/health',
      critical: true,
    },
    {
      name: 'cart-service',
      url: process.env.CART_SERVICE_URL || 'http://cart-service:3005',
      healthPath: '/health',
      critical: false,
    },
    {
      name: 'wishlist-service',
      url: process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:3006',
      healthPath: '/health',
      critical: false,
    },
    {
      name: 'review-service',
      url: process.env.REVIEW_SERVICE_URL || 'http://review-service:3007',
      healthPath: '/health',
      critical: false,
    },
    {
      name: 'contact-service',
      url: process.env.CONTACT_SERVICE_URL || 'http://contact-service:3008',
      healthPath: '/health',
      critical: false,
    },
    {
      name: 'notification-service',
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3010',
      healthPath: '/health',
      critical: false,
    },
  ],
  databases: [
    {
      name: 'postgresql',
      type: 'database',
      critical: true,
    },
    {
      name: 'mongodb',
      type: 'database',
      critical: true,
    },
    {
      name: 'redis',
      type: 'cache',
      critical: false,
    },
  ],
});

// ====================================================================
// FUNCIONES DE VERIFICACIÓN
// ====================================================================

/**
 * Verifica el estado de salud de un servicio HTTP
 * @param {Object} service - Configuración del servicio
 * @param {number} timeout - Timeout en ms
 * @returns {Promise<Object>} Estado del servicio
 */
async function checkServiceHealth(service, timeout = 5000) {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const url = new URL(service.healthPath, service.url);
    const protocol = url.protocol === 'https:' ? https : http;

    const req = protocol.get(url.toString(), { timeout }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        const isHealthy = res.statusCode >= 200 && res.statusCode < 300;

        let healthData = {};
        try {
          healthData = JSON.parse(data);
        } catch {
          healthData = { raw: data };
        }

        resolve({
          name: service.name,
          status: isHealthy ? 'healthy' : 'unhealthy',
          statusCode: res.statusCode,
          responseTime,
          critical: service.critical,
          details: healthData,
          lastChecked: new Date().toISOString(),
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name: service.name,
        status: 'unreachable',
        error: error.message,
        responseTime: Date.now() - startTime,
        critical: service.critical,
        lastChecked: new Date().toISOString(),
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        status: 'timeout',
        error: `Timeout after ${timeout}ms`,
        responseTime: timeout,
        critical: service.critical,
        lastChecked: new Date().toISOString(),
      });
    });
  });
}

/**
 * Verifica todos los servicios en paralelo
 * @param {number} timeout - Timeout por servicio
 * @returns {Promise<Object>} Estado agregado
 */
async function checkAllServices(timeout = 5000) {
  const config = getServiceConfig();
  const startTime = Date.now();

  // Verificar servicios HTTP en paralelo
  const serviceChecks = config.services.map((service) => checkServiceHealth(service, timeout));

  const serviceResults = await Promise.all(serviceChecks);

  // Calcular estado general
  const totalServices = serviceResults.length;
  const healthyServices = serviceResults.filter((s) => s.status === 'healthy').length;
  const criticalUnhealthy = serviceResults.filter((s) => s.critical && s.status !== 'healthy');

  // Estado general basado en servicios críticos
  let overallStatus = 'healthy';
  if (criticalUnhealthy.length > 0) {
    overallStatus = 'degraded';
    if (criticalUnhealthy.length > 2) {
      overallStatus = 'critical';
    }
  }
  if (healthyServices === 0) {
    overallStatus = 'down';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checkDuration: Date.now() - startTime,
    summary: {
      total: totalServices,
      healthy: healthyServices,
      unhealthy: totalServices - healthyServices,
      healthPercentage: Math.round((healthyServices / totalServices) * 100),
    },
    services: serviceResults,
    criticalIssues: criticalUnhealthy.map((s) => ({
      service: s.name,
      status: s.status,
      error: s.error,
    })),
  };
}

// ====================================================================
// MIDDLEWARE Y ENDPOINTS
// ====================================================================

/**
 * Crea el endpoint de dashboard de salud
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Middleware de Express
 */
function createHealthDashboard(options = {}) {
  const { timeout = 5000, cacheTtl = 30000 } = options;

  let cachedResult = null;
  let lastCheck = 0;

  return async (req, res) => {
    try {
      const now = Date.now();

      // Usar cache si está disponible y no ha expirado
      if (cachedResult && now - lastCheck < cacheTtl) {
        cachedResult.cached = true;
        cachedResult.cacheAge = now - lastCheck;
        return res.json(cachedResult);
      }

      // Realizar verificación
      const result = await checkAllServices(timeout);
      result.cached = false;

      // Actualizar cache
      cachedResult = result;
      lastCheck = now;

      // Establecer código de estado HTTP apropiado
      let statusCode = 200;
      if (result.status === 'degraded') statusCode = 200; // Aún funcional
      if (result.status === 'critical') statusCode = 503;
      if (result.status === 'down') statusCode = 503;

      res.status(statusCode).json(result);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error checking services health',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Endpoint simple de salud del API Gateway
 * @param {Object} options - Opciones
 * @returns {Function} Middleware
 */
function createSimpleHealth(options = {}) {
  const { serviceName = 'api-gateway' } = options;

  return (req, res) => {
    const memUsage = process.memoryUsage();

    res.json({
      status: 'healthy',
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
    });
  };
}

/**
 * Endpoint de métricas en formato Prometheus
 * @returns {Function} Middleware
 */
function createMetricsEndpoint() {
  return async (req, res) => {
    try {
      const result = await checkAllServices(3000);

      let metrics = '';

      // Métrica de estado general
      metrics +=
        '# HELP flores_victoria_health_status Overall health status (1=healthy, 0=unhealthy)\n';
      metrics += '# TYPE flores_victoria_health_status gauge\n';
      metrics += `flores_victoria_health_status ${result.status === 'healthy' ? 1 : 0}\n\n`;

      // Métricas por servicio
      metrics +=
        '# HELP flores_victoria_service_health Individual service health (1=healthy, 0=unhealthy)\n';
      metrics += '# TYPE flores_victoria_service_health gauge\n';
      for (const service of result.services) {
        const healthy = service.status === 'healthy' ? 1 : 0;
        metrics += `flores_victoria_service_health{service="${service.name}",critical="${service.critical}"} ${healthy}\n`;
      }
      metrics += '\n';

      // Tiempos de respuesta
      metrics +=
        '# HELP flores_victoria_service_response_time_ms Service response time in milliseconds\n';
      metrics += '# TYPE flores_victoria_service_response_time_ms gauge\n';
      for (const service of result.services) {
        if (service.responseTime !== undefined) {
          metrics += `flores_victoria_service_response_time_ms{service="${service.name}"} ${service.responseTime}\n`;
        }
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(metrics);
    } catch (error) {
      res.status(500).send(`# Error generating metrics: ${error.message}\n`);
    }
  };
}

// ====================================================================
// EXPORTS
// ====================================================================

module.exports = {
  // Funciones de verificación
  checkServiceHealth,
  checkAllServices,

  // Endpoints/Middleware
  createHealthDashboard,
  createSimpleHealth,
  createMetricsEndpoint,

  // Configuración
  getServiceConfig,
};
