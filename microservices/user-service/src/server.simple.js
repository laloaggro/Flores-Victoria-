// server.simple.js - User Service sin dependencias de shared
require('dotenv').config();
const express = require('express');
const logger = require('./logger.simple');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware básico
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  logger.info('GET /health');
  res.status(200).json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

// Endpoint de status básico
app.get('/api/users/status', (req, res) => {
  logger.info('GET /api/users/status');
  res.json({
    status: 'ok',
    message: 'User Service operativo (rutas completas en desarrollo)',
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor inmediatamente
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ Servicio de Usuarios corriendo en puerto ${PORT}`);
  logger.info('✅ Basic user routes loaded');
});

// Conectar a PostgreSQL de forma asíncrona (no bloquear startup)
setTimeout(async () => {
  try {
    const { Pool } = require('pg');

    let poolConfig;
    if (process.env.DATABASE_URL) {
      poolConfig = {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };
    } else {
      poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'flores_db',
        user: process.env.DB_USER || 'flores_user',
        password: process.env.DB_PASSWORD || 'flores_password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };
    }

    const pool = new Pool(poolConfig);
    await pool.query('SELECT 1');
    logger.info('✅ PostgreSQL conectado');

    // Cerrar test connection
    await pool.end();
  } catch (error) {
    logger.warn('⚠️ PostgreSQL no disponible:', error.message);
  }
}, 1000);

// Manejo de señales
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

// Manejo de errores
process.on('uncaughtException', (err) => {
  logger.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;
