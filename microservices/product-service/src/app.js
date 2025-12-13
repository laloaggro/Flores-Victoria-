const express = require('express');
const mongoose = require('mongoose');

// Logging y correlation (rutas corregidas a /app/shared)
const { accessLog } = require('@flores-victoria/shared/middleware/access-log');
const {
  errorHandler,
  notFoundHandler,
} = require('@flores-victoria/shared/middleware/error-handler');
const {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
} = require('@flores-victoria/shared/middleware/metrics');
const { requestId, withLogger } = require('@flores-victoria/shared/middleware/request-id');

// Tracing (deshabilitado temporalmente)
// const { initTracer } = require('@flores-victoria/shared/tracing');
// const { middleware: tracingMiddleware } = require('@flores-victoria/shared/tracing/middleware');

// Sentry (must be first)
const { initializeSentry } = require('./config/sentry');
// Middleware común optimizado
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const productRoutes = require('./routes/products');
const logger = require('./utils/logger');

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

const app = express();

// Initialize Sentry before any other middleware
const sentryHandlers = initializeSentry(app);

// Inicializar métricas
initMetrics('product-service');

// Inicializar tracing (deshabilitado temporalmente - causa problemas)
// initTracer('product-service');

// Conectar a MongoDB
const MONGODB_URI =
  process.env.PRODUCT_SERVICE_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://mongodb:27017/flores-victoria';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('🔗 Conectado a MongoDB', { service: 'product-service' });
  })
  .catch((error) => {
    logger.error('❌ Error conectando a MongoDB', {
      service: 'product-service',
      error: error.message,
    });
    process.exit(1);
  });

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE STACK
// ═══════════════════════════════════════════════════════════════

// 1. Sentry request handler (MUST be first)
app.use(sentryHandlers.requestHandler);
app.use(sentryHandlers.tracingHandler);

// 2. Métricas
app.use(metricsMiddleware());

// 3. Tracing (deshabilitado temporalmente)
// app.use(tracingMiddleware('product-service'));

// 4. Correlation ID y logging
app.use(requestId());
app.use(withLogger(logger));
app.use(accessLog(logger));

// 4. Common middleware (CORS, helmet, JSON parsing, rate limiting básico)
applyCommonMiddleware(app);

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static('uploads'));

// Health checks
setupHealthChecks(app, 'product-service', mongoose);

// Métricas
app.get('/metrics', metricsEndpoint());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Product Service - Arreglos Victoria [API v2.1]',
    version: '2.1.0',
    apiPrefix: '/api/products',
    features: ['logging', 'tracing', 'metrics', 'error-handling', 'validation'],
  });
});

// DEBUG: Endpoint para ver rutas registradas
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });
  res.json({ routes, deployTime: new Date().toISOString() });
});

// Rutas de productos con prefijo /api
app.use('/api/products', productRoutes);

// Rutas administrativas
const adminRoutes = require('./routes/admin');
app.use('/api/products/admin', adminRoutes);

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING (AL FINAL)
// ═══════════════════════════════════════════════════════════════

// Manejo de rutas no encontradas (debe ir después de todas las rutas)
app.use(notFoundHandler);

// Sentry error handler (MUST be before other error handlers)
app.use(sentryHandlers.errorHandler);

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

module.exports = app;
