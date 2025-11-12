/**
 * Health Check Routes - Kubernetes compatible
 *
 * Endpoints:
 * - GET /health/live  - Liveness probe (¿está el proceso vivo?)
 * - GET /health/ready - Readiness probe (¿puede servir tráfico?)
 */

const express = require('express');

const router = express.Router();

/**
 * Liveness probe - Verifica si el proceso está vivo
 * Kubernetes reinicia el pod si este endpoint falla
 *
 * Debe responder rápidamente (< 1s) y solo verificar lo esencial
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Readiness probe - Verifica si puede recibir tráfico
 * Kubernetes quita el pod del balanceo si este endpoint falla
 *
 * Verifica dependencias críticas (DB, cache, APIs externas)
 */
router.get('/ready', async (req, res) => {
  const checks = {};
  let allHealthy = true;

  // Verificar dependencias si existen en req.app.locals
  const { database, redis, externalApis } = req.app.locals.healthChecks || {};

  // Check database
  if (database) {
    try {
      checks.database = await database();
      if (checks.database.status !== 'healthy') {
        allHealthy = false;
      }
    } catch (error) {
      checks.database = { status: 'unhealthy', error: error.message };
      allHealthy = false;
    }
  }

  // Check Redis
  if (redis) {
    try {
      checks.redis = await redis();
      if (checks.redis.status !== 'healthy') {
        allHealthy = false;
      }
    } catch (error) {
      checks.redis = { status: 'unhealthy', error: error.message };
      allHealthy = false;
    }
  }

  // Check external APIs
  if (externalApis && Array.isArray(externalApis)) {
    checks.externalApis = {};
    for (const api of externalApis) {
      try {
        checks.externalApis[api.name] = await api.check();
        if (checks.externalApis[api.name].status !== 'healthy') {
          allHealthy = false;
        }
      } catch (error) {
        checks.externalApis[api.name] = { status: 'unhealthy', error: error.message };
        allHealthy = false;
      }
    }
  }

  const status = allHealthy ? 200 : 503;
  res.status(status).json({
    status: allHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * Startup probe - Verifica si la aplicación ha terminado de inicializarse
 * Kubernetes espera a que este endpoint responda OK antes de los otros probes
 */
router.get('/startup', (req, res) => {
  const { isReady } = req.app.locals.healthChecks || { isReady: true };

  if (isReady) {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      message: 'Application started successfully',
    });
  } else {
    res.status(503).json({
      status: 'STARTING',
      timestamp: new Date().toISOString(),
      message: 'Application is still starting',
    });
  }
});

module.exports = router;
