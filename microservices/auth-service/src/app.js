const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { createLogger } = require('@flores-victoria/shared/logging/logger');
const { accessLog } = require('@flores-victoria/shared/middleware/access-log');
const {
  errorHandler,
  notFoundHandler,
} = require('@flores-victoria/shared/middleware/error-handler');
const {
  sanitizeInput,
  sqlInjectionProtection,
  additionalSecurityHeaders,
} = require('@flores-victoria/shared/middleware/security');
const { criticalLimiter } = require('@flores-victoria/shared/middleware/rate-limiter');
const {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
} = require('@flores-victoria/shared/middleware/metrics');
const { requestId, withLogger } = require('@flores-victoria/shared/middleware/request-id');
const {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('@flores-victoria/shared/middleware/health-check');

// Tracing (con manejo de errores para evitar segfault)
const logger = createLogger('auth-service');

const config = require('./config');
const { pool } = require('./config/database');
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
app.use(additionalSecurityHeaders());

// 4. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Input sanitization y protección SQL injection
app.use(sanitizeInput({ skipPaths: ['/metrics', '/health'] }));
app.use(sqlInjectionProtection({ logAttempts: true }));

// 6. Rate limiting global (memoria)
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

// Rate limiting estricto para endpoints críticos (login, register)
// 5 intentos cada 15 minutos para prevenir fuerza bruta
app.use('/auth/login', criticalLimiter);
app.use('/auth/register', criticalLimiter);
app.use('/auth/google', criticalLimiter);

// API routes (sin /api prefix, el API Gateway ya lo agrega)
app.use('/auth', authRoutes);

// Health checks con verificación de PostgreSQL
const dbCheck = async () => {
  try {
    const result = await pool.query('SELECT 1');
    return result.rows.length > 0;
  } catch (_error) {
    return false;
  }
};

// Health check completo - incluye DB, memoria, CPU, uptime
app.get(
  '/health',
  createHealthCheck({
    serviceName: 'auth-service',
    dbCheck,
  })
);

// Readiness check - verifica que puede recibir tráfico
app.get(
  '/ready',
  createReadinessCheck({
    serviceName: 'auth-service',
    dbCheck,
  })
);

// Liveness check - solo verifica que el proceso está vivo
app.get('/live', createLivenessCheck('auth-service'));

// Endpoint legacy para compatibilidad con API Gateway
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
