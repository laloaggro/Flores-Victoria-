const express = require('express');

// Logging y correlation
const { createLogger } = require('../../../shared/logging/logger');
const { accessLog } = require('../../../shared/middleware/access-log');
const { requestId, withLogger } = require('../../../shared/middleware/request-id');

// Error handling
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/error-handler');

// Metrics
const { initMetrics, metricsMiddleware, metricsEndpoint } = require('../../../shared/middleware/metrics');

const config = require('./config');
const db = require('./config/database');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const { router, setDatabase } = require('./routes/orders');
const { verifyToken } = require('./utils/jwt');

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

initMetrics('order-service');

const app = express();
const logger = createLogger('order-service');

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE STACK
// ═══════════════════════════════════════════════════════════════

// 1. Métricas (primero)
app.use(metricsMiddleware());

// 2. Correlation ID y logging
app.use(requestId());
app.use(withLogger(logger));
app.use(accessLog(logger));

// 3. Common middleware (CORS, helmet, JSON, rate limiting básico)
applyCommonMiddleware(app, config);

// 3. Common middleware (CORS, helmet, JSON, rate limiting básico)
applyCommonMiddleware(app, config);

// 4. Middleware de autenticación
app.use('/api/orders', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

// Inicializar controladores con base de datos
setDatabase(db);

// Health checks
setupHealthChecks(app, 'order-service', db);

// Métricas
app.get('/metrics', metricsEndpoint());

// API routes
app.use('/api/orders', router);

// API routes
app.use('/api/orders', router);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Order Service - Arreglos Victoria',
    version: '2.0.0',
    features: ['logging', 'metrics', 'error-handling', 'authentication'],
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING (AL FINAL)
// ═══════════════════════════════════════════════════════════════

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

// 404 handler - reemplaza el manejador básico
app.use(notFoundHandler);

// Error handler - debe ir al final
app.use(errorHandler);

module.exports = app;
