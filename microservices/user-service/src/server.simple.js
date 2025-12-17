// server.simple.js - User Service Production Ready
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./logger.simple');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configurado para permitir admin dashboard y frontends
const corsOptions = {
  origin: [
    'https://admin-dashboard-service-production.up.railway.app',
    'https://frontend-v2-production-7508.up.railway.app',
    'https://flores-victoria-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
};

// Middleware básico
app.use(cors(corsOptions));
app.use(express.json());

// Health check (antes de cargar rutas)
app.get('/health', (req, res) => {
  logger.info('GET /health');
  res.status(200).json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'configured' : 'not-configured',
  });
});

// Endpoint de status (siempre disponible)
app.get('/api/users/status', (req, res) => {
  logger.info('GET /api/users/status');
  res.json({
    status: 'ok',
    message: 'User Service operativo',
    timestamp: new Date().toISOString(),
  });
});

// Rutas mock para cuando no hay DB disponible
const setupMockRoutes = () => {
  app.get('/api/users', (req, res) => {
    res.json({ status: 'ok', message: 'DB no configurada', data: [] });
  });
  app.get('/api/users/:id', (req, res) => {
    res.status(404).json({ status: 'error', message: 'DB no configurada' });
  });
  app.post('/api/users', (req, res) => {
    res.status(503).json({ status: 'error', message: 'DB no configurada' });
  });
};

// Rutas de error para cuando la conexión falla
const setupErrorRoutes = (errorMsg) => {
  app.use('/api/users', (req, res) => {
    res.status(503).json({
      status: 'error',
      message: 'Servicio de usuarios no disponible',
      error: errorMsg,
    });
  });
};

// Intentar cargar rutas de usuarios
if (!process.env.DATABASE_URL) {
  logger.warn('DATABASE_URL no configurada - usando rutas mock');
  setupMockRoutes();
} else {
  try {
    const userRoutes = require('./routes/users');
    app.use('/api/users', userRoutes);
    logger.info('Rutas de usuarios cargadas correctamente');
  } catch (error) {
    logger.error('Error cargando rutas de usuarios:', error.message);
    setupErrorRoutes(error.message);
  }
}

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de Usuarios corriendo en puerto ${PORT}`);
});

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
