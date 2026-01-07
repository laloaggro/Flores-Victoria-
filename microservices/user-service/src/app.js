const { initTracer } = require('@flores-victoria/tracing');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const valkeyUrl = process.env.VALKEY_URL;
const revocationRedisClient = valkeyUrl
  ? require('redis').createClient({ url: valkeyUrl })
  : require('redis').createClient({
      socket: {
        host: process.env.VALKEY_HOST || 'valkey',
        port: Number.parseInt(process.env.VALKEY_PORT || '6379', 10),
      },
      password: process.env.VALKEY_PASSWORD,
      database: Number.parseInt(process.env.VALKEY_REVOCATION_DB || '3', 10),
      lazyConnect: true,
    });
const { createLogger } = require('./shared/logging/logger');
const { accessLog } = require('./shared/middleware/access-log');
const { errorHandler, notFoundHandler } = require('./shared/middleware/error-handler');
const { requestId, withLogger } = require('./shared/middleware/request-id');
const {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('./shared/middleware/health-check');
const {
  initMetrics,
  metricsMiddleware,
  metricsEndpoint,
} = require('./shared/middleware/metrics');
const {
  initRedisClient: initTokenRevocationRedis,
  isTokenRevokedMiddleware,
} = require('./shared/middleware/token-revocation');
const sequelize = require('./config/database');
const userRoutes = require('./routes/users');
const { authMiddleware, adminOnly, selfOrAdmin, serviceAuth } = require('./middleware/auth');

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

dotenv.config();

initTracer('user-service');
initMetrics('user-service');

// Inicializar Redis para token revocation (DB 3)

revocationRedisClient.on('error', (err) =>
  logger.warn('⚠️ Token revocation Redis error:', { error: err.message })
);
revocationRedisClient.on('ready', () => logger.info('✅ Token revocation Redis conectado'));

revocationRedisClient
  .connect()
  .catch((err) =>
    logger.error('❌ No se puede conectar a Token revocation Redis', { error: err.message })
  );

initTokenRevocationRedis(revocationRedisClient);

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

// 3. CORS and body parsing
const corsOptions = {
  origin: [
    'https://admin-dashboard-service-production.up.railway.app',
    'https://api-gateway-production-b02f.up.railway.app',
    'https://flores-victoria-frontend.up.railway.app',
    'http://localhost:3000',
    'http://localhost:5173',
    /\.railway\.app$/, // Allow all Railway subdomains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
};
app.use(cors(corsOptions));
app.use(helmet()); // Security headers
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Intente más tarde.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/users', generalLimiter);

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

// Internal stats routes (path alternativo que no conflicta con /:id)
const statsRoutes = require('./routes/stats');
app.use('/internal/users', statsRoutes);

// User stats routes TAMBIÉN en /api/users para compatibilidad
app.use('/api/users', statsRoutes);

// User routes with authentication
// - GET / (list all) requires admin
// - GET /:id requires auth + selfOrAdmin
// - POST / (create) is open (registration) but rate limited
// - PUT /:id requires auth + selfOrAdmin
// - DELETE /:id requires admin
app.use('/api/users', userRoutes);

// ═══════════════════════════════════════════════════════════════
// SWAGGER API DOCS
// ═══════════════════════════════════════════════════════════════
const { setupSwagger } = require('./config/swagger');
setupSwagger(app);

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
