const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { metricsMiddleware, metricsEndpoint } = require('../../shared/metrics-simple');
const logger = require('./logger.simple');
const config = require('./config');
const { connectToDatabase } = require('./config/database');

const app = express();
const SERVICE_NAME = 'review-service';

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'review-service',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/api/reviews/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'review-service',
    version: '1.0.0',
    database: 'mongodb',
  });
});

// Conectar a MongoDB de forma asíncrona (no bloquear startup)
setTimeout(async () => {
  try {
    await connectToDatabase();
    logger.info('✅ MongoDB conectado');
  } catch (error) {
    logger.warn('⚠️ MongoDB no disponible:', error.message);
  }
}, 1000);

// Métricas Prometheus
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// Iniciar servidor
const PORT = config.port || 3007;
const HOST = '0.0.0.0'; // Railway requiere binding a 0.0.0.0
const server = app.listen(PORT, HOST, () => {
  logger.info(`✅ Servicio de Reseñas corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Basic review routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/reviews/status');
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
