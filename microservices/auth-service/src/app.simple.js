// app.simple.js - Express app sin dependencias de shared
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger.simple');

const app = express();

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  const { pool } = require('./config/database');
  let dbStatus = 'disconnected';
  
  try {
    const result = await pool.query('SELECT 1');
    dbStatus = result ? 'connected' : 'disconnected';
  } catch (error) {
    logger.warn('DB health check failed:', error.message);
  }
  
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    port: process.env.PORT || 8080,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Auth Service - Arreglos Victoria',
    version: '3.0.0-simple',
    endpoints: ['/health', '/api/auth'],
  });
});

// Rutas de autenticación (deshabilitadas temporalmente por dependencias de shared)
// TODO: Crear routes/auth.simple.js sin dependencias de shared
app.get('/api/auth/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Auth Service operativo (rutas completas en desarrollo)',
    timestamp: new Date().toISOString(),
  });
});

logger.info('✅ Basic auth routes loaded');

// Error handling
app.use((err, req, res, next) => {
  logger.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
