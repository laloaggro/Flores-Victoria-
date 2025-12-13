const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { metricsMiddleware, metricsEndpoint } = require('../../shared/metrics-simple');
const logger = require('./logger.simple');
const config = require('./config');

const app = express();
const SERVICE_NAME = 'cart-service';

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'cart-service',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/api/cart/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'cart-service',
    version: '1.0.0',
    cache: 'redis',
  });
});

// Intentar conectar a Redis de forma asíncrona (no bloquear startup)
setTimeout(async () => {
  try {
    const redis = require('./config/redis');
    if (redis && redis.ping) {
      await redis.ping();
      logger.info('✅ Redis conectado');
    }
  } catch (error) {
    logger.warn('⚠️ Redis no disponible:', error.message);
    logger.info('ℹ️ Servicio continuará sin caché');
  }
}, 1000);

// Métricas Prometheus
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// Iniciar servidor
const PORT = config.port || 3005;
const HOST = '0.0.0.0'; // Railway requiere binding a 0.0.0.0
const server = app.listen(PORT, HOST, () => {
  logger.info(`✅ Servicio de Carrito corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Basic cart routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/cart/status');
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
