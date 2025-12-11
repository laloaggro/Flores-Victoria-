require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger.simple');
const config = require('./config');

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
  });
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
  } catch (error) {
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
