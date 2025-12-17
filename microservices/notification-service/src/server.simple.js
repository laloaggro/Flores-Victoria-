require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { metricsMiddleware, metricsEndpoint } = require('../shared/metrics-simple');
const logger = require('./logger.simple');
const config = require('./config');

// Métricas simplificadas (sin dependencias externas)

const app = express();
const SERVICE_NAME = 'notification-service';

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
  });
});

// Health ready (deep check)
app.get('/health/ready', async (req, res) => {
  const checks = {
    email: config.email.user ? 'configured' : 'not-configured',
    redis: 'unknown',
  };

  try {
    if (config.redis.url) {
      const { createClient } = require('redis');
      const redis = createClient({ url: config.redis.url });
      await redis.connect();
      await redis.ping();
      await redis.disconnect();
      checks.redis = 'connected';
    }
  } catch {
    checks.redis = 'disconnected';
  }

  const isReady = checks.email === 'configured';
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not-ready',
    checks,
  });
});

// Health live (simple liveness)
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'live' });
});

// Status endpoint
app.get('/api/notifications/status', async (req, res) => {
  let redisStatus = 'not-configured';
  try {
    if (config.redis.url) {
      const { createClient } = require('redis');
      const redis = createClient({ url: config.redis.url });
      await redis.connect();
      await redis.ping();
      await redis.disconnect();
      redisStatus = 'connected';
    }
  } catch {
    redisStatus = 'disconnected';
  }

  res.status(200).json({
    status: 'operational',
    service: 'notification-service',
    version: '1.0.0',
    email: config.email.user ? 'configured' : 'not-configured',
    queue: {
      type: 'redis',
      status: redisStatus,
    },
  });
});

// Métricas Prometheus
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// Load notification routes
try {
  const notificationsRouter = require('./routes/notifications.routes');
  app.use('/api/notifications', notificationsRouter);
  logger.info('✅ Notification routes loaded');
} catch (error) {
  logger.warn('⚠️ Could not load notification routes:', error.message);
}

// Intentar conectar a Redis (opcional, para cola de notificaciones)
setTimeout(async () => {
  if (config.redis.url) {
    try {
      const { createClient } = require('redis');
      const redis = createClient({ url: config.redis.url });
      await redis.connect();
      await redis.ping();
      logger.info('✅ Redis conectado (cola de notificaciones)');
      await redis.disconnect();
    } catch (error) {
      logger.warn('⚠️ Redis no disponible:', error.message);
      logger.info('ℹ️ Servicio continuará sin cola');
    }
  }
}, 1000);

// Iniciar servidor
const PORT = config.port || 3010;
const HOST = '0.0.0.0'; // Railway requiere binding a 0.0.0.0
const server = app.listen(PORT, HOST, () => {
  logger.info(`✅ Servicio de Notificaciones corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Basic notification routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/notifications/status');
  if (config.email.user) {
    logger.info('📧 Email configurado:', config.email.user);
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('❌ Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('🛑 Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;
