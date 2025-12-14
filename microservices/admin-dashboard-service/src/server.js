/**
 * Servidor principal del admin-dashboard-service
 */
const express = require('express');
const cors = require('cors');
const { logger } = require('@flores-victoria/shared/utils/logger');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    service: config.serviceName,
    ip: req.ip,
  });
  next();
});

// Health check endpoint (REQUERIDO para Railway)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'admin-dashboard-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.get('/api/admin', (req, res) => {
  res.json({
    message: 'Dashboard de Administración - Flores Victoria',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check del dashboard',
      'GET /api/admin - Información del servicio',
      'GET /api/dashboard - Dashboard completo con todos los servicios',
      'GET /api/dashboard/summary - Resumen de salud del sistema',
      'GET /api/dashboard/services - Lista de servicios configurados',
      'GET /api/dashboard/services/:name - Estado detallado de un servicio',
      'POST /api/dashboard/healthcheck - Ejecutar health check en todos los servicios',
    ],
  });
});

// Dashboard routes
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Servir dashboard HTML en la ruta raíz
const path = require('path');

// Dashboard v2 (con roles)
app.get('/v2', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard-v2.html'));
});

// Dashboard original
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

// ==================== AUTH API ====================
// Mock users database
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
    email: 'admin@flores-victoria.com',
    role: 'admin',
  },
  {
    id: 2,
    username: 'worker',
    password: 'worker123',
    name: 'María González',
    email: 'maria@flores-victoria.com',
    role: 'worker',
  },
  {
    id: 3,
    username: 'viewer',
    password: 'viewer123',
    name: 'Carlos López',
    email: 'carlos@flores-victoria.com',
    role: 'viewer',
  },
];

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    // For demo, allow any user with the role from the request
    const role = req.body.role || 'viewer';
    return res.json({
      success: true,
      user: {
        id: Date.now(),
        username,
        name: username,
        email: `${username}@flores-victoria.com`,
        role,
      },
      token: `demo-token-${Date.now()}`,
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: `token-${user.id}-${Date.now()}`,
  });
});

// Get users (admin only in production)
app.get('/api/auth/users', (req, res) => {
  res.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      lastAccess: new Date().toISOString(),
    })),
  });
});

// Add user (admin only in production)
app.post('/api/auth/users', (req, res) => {
  const { username, name, email, role } = req.body;
  const newUser = {
    id: users.length + 1,
    username,
    password: 'temp123',
    name,
    email,
    role: role || 'viewer',
  };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada',
    path: req.path,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  logger.error('Error no manejado', {
    error: err.message,
    stack: err.stack,
    service: config.serviceName,
  });

  res.status(err.status || 500).json({
    error: true,
    message: config.nodeEnv === 'production' ? 'Error interno del servidor' : err.message,
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de admin-dashboard-service ejecutándose en el puerto ${PORT}`, {
    environment: config.nodeEnv,
    port: PORT,
    service: config.serviceName,
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

module.exports = app;
