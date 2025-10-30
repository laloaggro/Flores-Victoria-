const { initTracer } = require('@flores-victoria/tracing');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');

const healthRouter = require('../../../shared/health/routes');
const { createLogger } = require('../../../shared/logging/logger');
const { accessLog } = require('../../../shared/middleware/access-log');
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/error-handler');
const {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
} = require('../../../shared/middleware/metrics');
const { requestId, withLogger } = require('../../../shared/middleware/request-id');

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

// Health checks con verificación de dependencias
// Configurar health checks con verificación de PostgreSQL
app.locals.healthChecks = {
  database: async () => {
    const sequelize = require('./config/database');
    try {
      await sequelize.authenticate();
      return { status: 'healthy', type: 'postgresql' };
    } catch (error) {
      return { status: 'unhealthy', type: 'postgresql', error: error.message };
    }
  },
};

app.use('/health', healthRouter);

// Health checks legacy (deprecated - usar /health/live y /health/ready)
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks: {},
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

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
