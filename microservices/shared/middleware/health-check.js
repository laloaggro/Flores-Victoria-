/**
 * SHARED HEALTH CHECK MIDDLEWARE
 * Sistema de health checks para microservicios
 * Flores Victoria - Service Health Monitoring
 */

/**
 * Crea un endpoint de health check para un servicio
 * @param {Object} options - Opciones de configuración
 * @param {string} options.serviceName - Nombre del servicio
 * @param {Function} options.dbCheck - Función async que verifica la BD (retorna boolean)
 * @param {Function} [options.cacheCheck] - Función async que verifica Redis (retorna boolean)
 * @param {Function} [options.customChecks] - Objeto con checks personalizados
 * @returns {Function} Express middleware
 */
function createHealthCheck(options = {}) {
  const { serviceName = 'unknown', dbCheck = null, cacheCheck = null, customChecks = {} } = options;

  const startTime = Date.now();

  return async (req, res) => {
    const healthData = {
      status: 'healthy',
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000), // segundos
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {},
    };

    let isHealthy = true;

    // Check de base de datos
    if (dbCheck) {
      try {
        const dbHealthy = await dbCheck();
        healthData.checks.database = {
          status: dbHealthy ? 'up' : 'down',
          responseTime: 0,
        };
        if (!dbHealthy) isHealthy = false;
      } catch (error) {
        healthData.checks.database = {
          status: 'down',
          error: error.message,
        };
        isHealthy = false;
      }
    }

    // Check de cache (Redis)
    if (cacheCheck) {
      try {
        const cacheHealthy = await cacheCheck();
        healthData.checks.cache = {
          status: cacheHealthy ? 'up' : 'down',
          responseTime: 0,
        };
        // Cache no es crítico, no afecta isHealthy
      } catch (error) {
        healthData.checks.cache = {
          status: 'down',
          error: error.message,
        };
      }
    }

    // Checks personalizados
    for (const [checkName, checkFn] of Object.entries(customChecks)) {
      try {
        const result = await checkFn();
        healthData.checks[checkName] = {
          status: result ? 'up' : 'down',
        };
        if (!result) isHealthy = false;
      } catch (error) {
        healthData.checks[checkName] = {
          status: 'down',
          error: error.message,
        };
        isHealthy = false;
      }
    }

    // Métricas del sistema
    const memUsage = process.memoryUsage();
    healthData.system = {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      cpu: {
        load: process.cpuUsage(),
      },
    };

    // Determinar status final
    healthData.status = isHealthy ? 'healthy' : 'unhealthy';

    // Responder con código apropiado
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthData);
  };
}

/**
 * Health check simplificado (solo status)
 * @param {string} serviceName - Nombre del servicio
 * @returns {Function} Express middleware
 */
function simpleHealthCheck(serviceName = 'unknown') {
  const startTime = Date.now();

  return (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: serviceName,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  };
}

/**
 * Readiness check - verifica si el servicio está listo para recibir tráfico
 * @param {Object} options - Opciones (igual que createHealthCheck)
 * @returns {Function} Express middleware
 */
function createReadinessCheck(options = {}) {
  const { serviceName = 'unknown', dbCheck = null, cacheCheck = null } = options;

  return async (req, res) => {
    const checks = {
      service: serviceName,
      ready: true,
      timestamp: new Date().toISOString(),
    };

    // Verificar BD (crítico para readiness)
    if (dbCheck) {
      try {
        const dbReady = await dbCheck();
        checks.database = dbReady ? 'ready' : 'not_ready';
        if (!dbReady) checks.ready = false;
      } catch (_error) {
        checks.database = 'not_ready';
        checks.ready = false;
      }
    }

    // Verificar Cache (no crítico)
    if (cacheCheck) {
      try {
        const cacheReady = await cacheCheck();
        checks.cache = cacheReady ? 'ready' : 'not_ready';
      } catch (_error) {
        checks.cache = 'not_ready';
      }
    }

    const statusCode = checks.ready ? 200 : 503;
    res.status(statusCode).json(checks);
  };
}

/**
 * Liveness check - verifica si el servicio está vivo (no bloqueado)
 * Responde siempre 200 si el proceso está corriendo
 * @param {string} serviceName - Nombre del servicio
 * @returns {Function} Express middleware
 */
function createLivenessCheck(serviceName = 'unknown') {
  return (req, res) => {
    res.status(200).json({
      status: 'alive',
      service: serviceName,
      timestamp: new Date().toISOString(),
    });
  };
}

module.exports = {
  createHealthCheck,
  simpleHealthCheck,
  createReadinessCheck,
  createLivenessCheck,
};
