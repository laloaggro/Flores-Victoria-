const express = require('express');

// Logging y correlation
const { createLogger } = require('@flores-victoria/shared/logging/logger');
const { accessLog } = require('@flores-victoria/shared/middleware/access-log');
const { requestId, withLogger } = require('@flores-victoria/shared/middleware/request-id');

// Error handling
const {
  errorHandler,
  notFoundHandler,
} = require('@flores-victoria/shared/middleware/error-handler');

// Rate limiting
const {
  publicLimiter,
  authenticatedLimiter,
} = require('@flores-victoria/shared/middleware/rate-limiter');

// Metrics
const {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
} = require('@flores-victoria/shared/middleware/metrics');
const config = require('./config');
const redisClient = require('./config/redis');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const { router, setRedis } = require('./routes/cart');
const { verifyToken } = require('./utils/jwt');

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

const app = express();
const logger = createLogger('cart-service');

// Inicializar métricas
const { registry } = initMetrics('cart-service', {
  collectDefaultMetrics: true,
  defaultMetricsInterval: 10000,
});

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE STACK (ORDEN CRÍTICO)
// ═══════════════════════════════════════════════════════════════

// 1. Métricas (primero para medir todo)
app.use(metricsMiddleware());

// 2. Correlation ID y logging
app.use(requestId());
app.use(withLogger(logger));
app.use(accessLog(logger));

// 3. Common middleware (CORS, helmet, JSON parsing, etc.)
applyCommonMiddleware(app, config);

// 4. Rate limiting global (por IP)
app.use(publicLimiter);

// 5. Middleware de autenticación
app.use('/api/cart', (req, res, next) => {
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

// 6. Rate limiting por usuario (después de autenticación)
app.use('/api/cart', authenticatedLimiter);

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SERVICIOS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE SERVICIOS
// ═══════════════════════════════════════════════════════════════

// Inicializar controladores con Redis
setRedis(redisClient);

// Health checks (incluye verificación de Redis)
setupHealthChecks(app, 'cart-service', redisClient);

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

// Rutas principales del carrito
app.use('/api/cart', router);

// Endpoint de métricas (Prometheus)
app.get('/metrics', metricsEndpoint());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Carrito - Arreglos Victoria',
    version: '2.0.0', // Version bump por observability stack
    features: ['logging', 'rate-limiting', 'metrics', 'error-handling'],
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING (AL FINAL)
// ═══════════════════════════════════════════════════════════════

// 404 handler - reemplaza el manejador básico
app.use(notFoundHandler);

// Error handler - debe ir al final
app.use(errorHandler);

module.exports = app;
