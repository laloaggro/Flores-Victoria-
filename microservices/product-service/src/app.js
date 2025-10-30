const express = require('express');
const mongoose = require('mongoose');

// Logging y correlation
const { accessLog } = require('../../../shared/middleware/access-log');
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/error-handler');
const {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
} = require('../../../shared/middleware/metrics');
const { requestId, withLogger } = require('../../../shared/middleware/request-id');

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

// Conectar a MongoDB
const MONGODB_URI =
  process.env.PRODUCT_SERVICE_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://mongodb:27017/flores-victoria';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('🔗 Conectado a MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
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

// 3. Correlation ID y logging
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
    message: 'Product Service - Arreglos Victoria',
    version: '2.0.0',
    features: ['logging', 'metrics', 'error-handling', 'validation'],
  });
});

// Rutas de productos
app.use('/products', productRoutes);

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
