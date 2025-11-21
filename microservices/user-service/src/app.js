const { initTracer } = require('@flores-victoria/tracing');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');

const { createLogger } = require('../../../shared/logging/logger');
const { accessLog } = require('../../../shared/middleware/access-log');
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/error-handler');
const {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('../../../shared/middleware/health-check');
const {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
} = require('../../../shared/middleware/metrics');
const { requestId, withLogger } = require('../../../shared/middleware/request-id');

const sequelize = require('./config/database');
const userRoutes = require('./routes/users');

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

dotenv.config();

initTracer('user-service');
initMetrics('user-service');

const app = express();
const logger = createLogger('user-service');

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE STACK
// ═══════════════════════════════════════════════════════════════

// 1. Métricas (primero)
app.use(metricsMiddleware());

// 2. Correlation ID y logging
app.use(requestId());
app.use(withLogger(logger));
app.use(accessLog(logger));

// 3. CORS y body parsing
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

app.use('/api/users', userRoutes);

// Health checks mejorados con verificación de PostgreSQL (Sequelize)
const dbCheck = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (_error) {
    return false;
  }
};

// Health check completo - incluye DB, memoria, CPU, uptime
app.get(
  '/health',
  createHealthCheck({
    serviceName: 'user-service',
    dbCheck,
  })
);

// Readiness check - verifica que puede recibir tráfico
app.get(
  '/ready',
  createReadinessCheck({
    serviceName: 'user-service',
    dbCheck,
  })
);

// Liveness check - solo verifica que el proceso está vivo
app.get('/live', createLivenessCheck('user-service'));

// Métricas
app.get('/metrics', metricsEndpoint());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'User Service - Arreglos Victoria',
    version: '2.0.0',
    features: ['logging', 'tracing', 'metrics', 'error-handling'],
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING (AL FINAL)
// ═══════════════════════════════════════════════════════════════

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

// Ruta para métricas
app.get('/metrics', async (req, res) => {
  try {
    const { register } = require('@flores-victoria/metrics');
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// 404 handler - debe ir después de todas las rutas
app.use(notFoundHandler);

// Error handler - debe ir al final
app.use(errorHandler);

module.exports = app;
