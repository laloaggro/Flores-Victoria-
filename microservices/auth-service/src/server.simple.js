// server.simple.js - Server sin dependencias de shared
require('dotenv').config();
const logger = require('./logger.simple');
const app = require('./app.simple');

const PORT = process.env.PORT || 8080;

// Conectar a PostgreSQL (non-blocking)
setTimeout(async () => {
  try {
    const { pool } = require('./config/database');
    await pool.query('SELECT 1');
    logger.info('✅ PostgreSQL conectado');
  } catch (error) {
    logger.warn('⚠️ PostgreSQL no disponible:', error.message);
  }
}, 1000);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ Servicio de Autenticación corriendo en puerto ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Error no capturado:', err.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = server;
