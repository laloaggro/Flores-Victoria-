const express = require('express');
const { createLogger } = require('@flores-victoria/shared/logging/logger');
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
// Tracing (microservices/shared API)
const { initTracer } = require('@flores-victoria/shared/tracing');
const { tracingMiddleware } = require('@flores-victoria/shared/tracing/middleware');
const {
  initRedisClient: initTokenRevocationRedis,
  isTokenRevokedMiddleware,
} = require('@flores-victoria/shared/middleware/token-revocation');
const config = require('./config');
const db = require('./config/database');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const { router, setDatabase } = require('./routes/orders');
const { verifyToken } = require('./utils/jwt');

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

initMetrics('order-service');
const tracer = initTracer('order-service');

// Inicializar Valkey para token revocation (DB 3)
const valkeyUrl = process.env.VALKEY_URL;
const revocationRedisClient = valkeyUrl
  ? require('redis').createClient({ url: valkeyUrl })
  : require('redis').createClient({
      socket: {
        host: process.env.VALKEY_HOST || 'valkey',
        port: parseInt(process.env.VALKEY_PORT || '6379'),
      },
      password: process.env.VALKEY_PASSWORD,
      database: parseInt(process.env.VALKEY_REVOCATION_DB || '3'),
      lazyConnect: true,
    });

revocationRedisClient.on('error', (err) =>
  logger.warn('⚠️ Token revocation Redis error:', { error: err.message })
);
revocationRedisClient.on('ready', () =>
  logger.info('✅ Token revocation Redis conectado')
);

revocationRedisClient.connect().catch((err) =>
  logger.error('❌ No se puede conectar a Token revocation Redis', { error: err.message })
);

initTokenRevocationRedis(revocationRedisClient);

const app = express();
const logger = createLogger('order-service');

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE STACK
// ═══════════════════════════════════════════════════════════════

// 1. Métricas y tracing (primero)
app.use(metricsMiddleware());
app.use(tracingMiddleware(tracer));

// 2. Correlation ID y logging
app.use(requestId());
app.use(withLogger(logger));
app.use(accessLog(logger));

// 3. Token revocation check
app.use(isTokenRevokedMiddleware());

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
  } catch (_error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

// Swagger Documentation
const { setupSwagger } = require('./config/swagger');
setupSwagger(app);

// Inicializar controladores con base de datos
setDatabase(db);

// Health checks
setupHealthChecks(app, 'order-service', db);

// Métricas
app.get('/metrics', metricsEndpoint());

// API routes - Orders (requiere autenticación)
app.use('/api/orders', router);

// API routes - Delivery zones (público, sin autenticación)
const deliveryRouter = require('./routes/delivery');
app.use('/api/delivery', deliveryRouter);

// API routes - Event Reservations (público para consultas, autenticado para reservas)
const eventReservationsRouter = require('./routes/event-reservations');
app.use('/api/event-reservations', eventReservationsRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Order Service - Arreglos Victoria',
    version: '3.3.0-events',
    buildTime: '2026-01-03T04:05:00Z',
    features: ['logging', 'tracing', 'metrics', 'error-handling', 'authentication', 'event-reservations'],
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING (AL FINAL)
// ═══════════════════════════════════════════════════════════════

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
