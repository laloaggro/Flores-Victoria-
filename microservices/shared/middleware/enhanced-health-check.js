/**
 * @fileoverview Health Check mejorado con verificación de dependencias
 * @description Proporciona endpoints de health, liveness y readiness con
 *              verificación de bases de datos, Redis y servicios externos
 *
 * @example
 * const { createEnhancedHealthCheck } = require('@flores-victoria/shared/middleware/enhanced-health-check');
 *
 * // Configurar con dependencias del servicio
 * const healthCheck = createEnhancedHealthCheck({
 *   serviceName: 'product-service',
 *   version: '1.0.0',
 *   checks: {
 *     mongodb: async () => mongoose.connection.readyState === 1,
 *     redis: async () => redisClient.ping() === 'PONG',
 *   }
 * });
 *
 * app.use(healthCheck.routes());
 */

const os = require('os');

/**
 * Estados posibles de health
 */
const HealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
};

/**
 * Crea health check mejorado con verificación de dependencias
 * @param {Object} config - Configuración del health check
 * @param {string} config.serviceName - Nombre del servicio
 * @param {string} config.version - Versión del servicio
 * @param {Object} config.checks - Map de checks a ejecutar
 * @param {number} config.timeout - Timeout para cada check (ms)
 * @returns {Object} Objeto con métodos de health check
 */
function createEnhancedHealthCheck(config = {}) {
  const {
    serviceName = process.env.SERVICE_NAME || 'unknown-service',
    version = process.env.SERVICE_VERSION || '1.0.0',
    checks = {},
    timeout = 5000,
  } = config;

  const startTime = Date.now();
  let lastCheckResult = null;
  let lastCheckTime = null;

  /**
   * Ejecuta un check individual con timeout
   */
  async function runCheck(name, checkFn) {
    const checkStart = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Check timeout')), timeout);
      });

      const result = await Promise.race([checkFn(), timeoutPromise]);

      return {
        name,
        status: result ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
        responseTime: Date.now() - checkStart,
        message: result ? 'OK' : 'Check failed',
      };
    } catch (error) {
      return {
        name,
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - checkStart,
        message: error.message,
        error: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      };
    }
  }

  /**
   * Ejecuta todos los checks configurados
   */
  async function runAllChecks() {
    const checkResults = await Promise.all(
      Object.entries(checks).map(([name, checkFn]) => runCheck(name, checkFn))
    );

    const unhealthyCount = checkResults.filter((r) => r.status === HealthStatus.UNHEALTHY).length;

    let overallStatus;
    if (unhealthyCount === 0) {
      overallStatus = HealthStatus.HEALTHY;
    } else if (unhealthyCount < checkResults.length) {
      overallStatus = HealthStatus.DEGRADED;
    } else {
      overallStatus = HealthStatus.UNHEALTHY;
    }

    lastCheckResult = {
      status: overallStatus,
      checks: checkResults,
      timestamp: new Date().toISOString(),
    };
    lastCheckTime = Date.now();

    return lastCheckResult;
  }

  /**
   * Obtiene información del sistema
   */
  function getSystemInfo() {
    const memUsage = process.memoryUsage();

    return {
      uptime: Math.floor((Date.now() - startTime) / 1000),
      uptimeFormatted: formatUptime(Date.now() - startTime),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      cpu: os.loadavg(),
      hostname: os.hostname(),
      pid: process.pid,
      nodeVersion: process.version,
    };
  }

  /**
   * Formatea uptime en formato legible
   */
  function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Health check completo (para /health)
   * Incluye status de dependencias y métricas
   */
  async function healthHandler(req, res) {
    try {
      const checkResult = await runAllChecks();
      const systemInfo = getSystemInfo();

      const statusCode = checkResult.status === HealthStatus.UNHEALTHY ? 503 : 200;

      res.status(statusCode).json({
        service: serviceName,
        version,
        status: checkResult.status,
        timestamp: checkResult.timestamp,
        uptime: systemInfo.uptimeFormatted,
        checks: checkResult.checks,
        system: {
          memory: systemInfo.memory,
          cpu: systemInfo.cpu,
          pid: systemInfo.pid,
        },
      });
    } catch (error) {
      res.status(503).json({
        service: serviceName,
        version,
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }

  /**
   * Liveness check (para /live)
   * Solo verifica que el proceso responde
   */
  function livenessHandler(req, res) {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Readiness check (para /ready)
   * Verifica que el servicio puede recibir tráfico
   */
  async function readinessHandler(req, res) {
    try {
      const checkResult = await runAllChecks();

      if (checkResult.status === HealthStatus.UNHEALTHY) {
        return res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
          reason: 'One or more dependencies are unhealthy',
          checks: checkResult.checks,
        });
      }

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }

  /**
   * Retorna router con endpoints de health
   */
  function routes() {
    const express = require('express');
    const router = express.Router();

    router.get('/health', healthHandler);
    router.get('/live', livenessHandler);
    router.get('/ready', readinessHandler);

    // Alias comunes
    router.get('/healthz', healthHandler);
    router.get('/livez', livenessHandler);
    router.get('/readyz', readinessHandler);

    return router;
  }

  /**
   * Middleware que agrega health check a app
   */
  function middleware() {
    return routes();
  }

  return {
    routes,
    middleware,
    healthHandler,
    livenessHandler,
    readinessHandler,
    runAllChecks,
    getSystemInfo,
    getLastResult: () => lastCheckResult,
  };
}

/**
 * Checks predefinidos para dependencias comunes
 */
const commonChecks = {
  /**
   * Check para MongoDB (Mongoose)
   * @param {Object} mongoose - Instancia de mongoose
   */
  mongodb: (mongoose) => async () => {
    const state = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    return state === 1;
  },

  /**
   * Check para PostgreSQL (Sequelize)
   * @param {Object} sequelize - Instancia de sequelize
   */
  postgres: (sequelize) => async () => {
    await sequelize.authenticate();
    return true;
  },

  /**
   * Check para Redis (ioredis)
   * @param {Object} redisClient - Cliente Redis
   */
  redis: (redisClient) => async () => {
    const result = await redisClient.ping();
    return result === 'PONG';
  },

  /**
   * Check para servicio HTTP externo
   * @param {string} url - URL del servicio
   * @param {number} timeout - Timeout en ms
   */
  httpService:
    (url, timeout = 3000) =>
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        clearTimeout(timeoutId);
        return false;
      }
    },

  /**
   * Check de memoria (falla si uso > threshold)
   * @param {number} thresholdMB - Límite en MB
   */
  memory:
    (thresholdMB = 512) =>
    async () => {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      return used < thresholdMB;
    },

  /**
   * Check de disk space (básico)
   */
  disk: () => async () => {
    // En producción, implementar con fs.statfs o similar
    return true;
  },
};

/**
 * Configuración rápida de health checks
 */
function setupHealthRoutes(app, config = {}) {
  const healthCheck = createEnhancedHealthCheck(config);
  app.use(healthCheck.routes());
  return healthCheck;
}

module.exports = {
  createEnhancedHealthCheck,
  commonChecks,
  setupHealthRoutes,
  HealthStatus,
};
