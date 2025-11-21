const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');

// Logging y correlation
const { createLogger } = require('../../../shared/logging/logger');
const { accessLog } = require('../../../shared/middleware/access-log');
const { requestId, withLogger } = require('../../../shared/middleware/request-id');

// Error handling
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/error-handler');

// Metrics
const {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
} = require('../../../shared/middleware/metrics');

// Rate limiting (memoria - auth-service usa SQLite sin Redis)
const rateLimit = require('express-rate-limit');

// Tracing (con manejo de errores para evitar segfault)
let tracingMiddleware = () => (req, res, next) => next(); // Default no-op
const logger = createLogger('auth-service');
try {
  const tracing = require('../../../shared/tracing');
  if (tracing && tracing.middleware) {
    tracingMiddleware = tracing.middleware;
  }
} catch (err) {
  logger.warn({ err: err.message }, '⚠️ Tracing middleware no disponible');
}

const config = require('./config');
const authRoutes = require('./routes/auth');

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

dotenv.config();

// Inicializar sistemas
// DESHABILITADO: init('auth-service'); // Causa segfault (exit 139)
initMetrics('auth-service');

const app = express();

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE STACK
// ═══════════════════════════════════════════════════════════════

// 1. Métricas (tracing deshabilitado por segfault)
app.use(metricsMiddleware());
// DESHABILITADO: app.use(tracingMiddleware('auth-service')); // Causa exit 139

// 2. Correlation ID y logging
app.use(requestId());
app.use(withLogger(logger));
app.use(accessLog(logger));

// 3. Seguridad
app.use(helmet());
app.use(cors());

// 4. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Rate limiting global (memoria)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: 'fail',
    message: 'Demasiadas solicitudes, por favor inténtelo de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

// API routes (sin /api prefix, el API Gateway ya lo agrega)
app.use('/auth', authRoutes);

// Health checks
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks: {},
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

app.get('/api/auth/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'auth-service',
    via: '/api/auth/health',
  });
});

// Métricas
app.get('/metrics', metricsEndpoint());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Autenticación - Arreglos Victoria',
    version: '2.0.0',
    features: ['logging', 'tracing', 'metrics', 'error-handling', 'rate-limiting'],
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING (AL FINAL)
// ═══════════════════════════════════════════════════════════════

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
