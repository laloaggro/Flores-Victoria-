const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger.simple');
const config = require('./config');
const { connectToDatabase } = require('./config/database');

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'contact-service',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/api/contact/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'contact-service',
    version: '1.0.0',
    database: 'mongodb',
    email: config.email.user ? 'configured' : 'not-configured',
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

// Iniciar servidor
const PORT = config.port || 3008;
const HOST = '0.0.0.0'; // Railway requiere binding a 0.0.0.0
const server = app.listen(PORT, HOST, () => {
  logger.info(`✅ Servicio de Contacto corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Basic contact routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/contact/status');
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
