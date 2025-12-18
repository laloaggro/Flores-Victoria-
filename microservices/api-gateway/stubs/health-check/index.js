/**
 * Health Check Stub for Railway Deployment
 * Provides basic health check endpoints
 */

/**
 * Creates a comprehensive health check middleware
 */
const createHealthCheck = (options = {}) => {
  const serviceName = options.serviceName || 'unknown';

  return (req, res) => {
    const healthData = {
      status: 'ok',
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        unit: 'MB',
      },
    };

    res.json(healthData);
  };
};

/**
 * Creates a simple liveness check
 */
const createLivenessCheck = (serviceName) => {
  return (req, res) => {
    res.json({
      status: 'ok',
      service: serviceName,
      alive: true,
      timestamp: new Date().toISOString(),
    });
  };
};

/**
 * Creates a readiness check
 */
const createReadinessCheck = (serviceName) => {
  return (req, res) => {
    res.json({
      status: 'ok',
      service: serviceName,
      ready: true,
      timestamp: new Date().toISOString(),
    });
  };
};

/**
 * Simple health check middleware (passes through)
 */
const healthCheckMiddleware = (req, res, next) => next();

/**
 * Creates a health router
 */
const createHealthRouter = () => {
  const router = require('express').Router();
  router.get('/health', (req, res) => res.json({ status: 'ok' }));
  return router;
};

/**
 * Check dependencies (stub returns ok)
 */
const checkDependencies = async () => {
  return {
    status: 'ok',
    dependencies: {},
  };
};

module.exports = {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
  healthCheckMiddleware,
  createHealthRouter,
  checkDependencies,
};
