/**
 * Servidor principal del admin-dashboard-service
 */
const express = require('express');
const cors = require('cors');
const { logger } = require('@flores-victoria/shared/utils/logger');
const config = require('./config');
const {
  verifyToken,
  requireAdmin,
  requireRole,
  optionalAuth,
  generateToken,
} = require('./middleware/auth');

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

// Dashboard principal (unificado)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

// Ruta legacy v2 redirige a principal
app.get('/v2', (req, res) => {
  res.redirect('/');
});

// Swagger/API Docs redirect
app.get('/docs', (req, res) => {
  res.redirect('/api/admin');
});

// ==================== AUTH API ====================
// Mock users database (en producción usar PostgreSQL)
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Administrador Principal',
    email: 'admin@floresvictoria.cl',
    role: 'admin',
    phone: '+56 9 1234 5678',
    avatar: null,
    active: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'maria',
    password: 'maria123',
    name: 'María González',
    email: 'maria@floresvictoria.cl',
    role: 'worker',
    phone: '+56 9 8765 4321',
    avatar: null,
    active: true,
    createdAt: '2024-03-20T14:30:00Z',
    lastLogin: '2025-12-15T09:00:00Z',
  },
  {
    id: 3,
    username: 'carlos',
    password: 'carlos123',
    name: 'Carlos López',
    email: 'carlos@floresvictoria.cl',
    role: 'viewer',
    phone: '+56 9 5555 1234',
    avatar: null,
    active: true,
    createdAt: '2024-06-10T08:15:00Z',
    lastLogin: '2025-12-14T16:45:00Z',
  },
  {
    id: 4,
    username: 'ana',
    password: 'ana123',
    name: 'Ana Martínez',
    email: 'ana@floresvictoria.cl',
    role: 'worker',
    phone: '+56 9 7777 8888',
    avatar: null,
    active: false,
    createdAt: '2024-02-28T11:00:00Z',
    lastLogin: '2025-11-01T10:00:00Z',
  },
];

// Login endpoint con JWT real
app.post('/api/auth/login', (req, res) => {
  const { username, password, email } = req.body;

  // Buscar por username o email
  const user = users.find(
    (u) => (u.username === username || u.email === email) && u.password === password
  );

  if (!user) {
    logger.warn('Intento de login fallido', { username, email });
    return res.status(401).json({
      success: false,
      error: true,
      message: 'Credenciales inválidas',
      code: 'INVALID_CREDENTIALS',
    });
  }

  if (!user.active) {
    return res.status(403).json({
      success: false,
      error: true,
      message: 'Usuario desactivado. Contacte al administrador.',
      code: 'USER_INACTIVE',
    });
  }

  // Actualizar último login
  user.lastLogin = new Date().toISOString();

  // Generar token JWT
  const token = generateToken(user);

  logger.info('Login exitoso', { userId: user.id, username: user.username });

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
    token,
    expiresIn: '8h',
  });
});

// Verificar token
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user,
  });
});

// Logout (invalidar token del lado cliente)
app.post('/api/auth/logout', verifyToken, (req, res) => {
  logger.info('Logout', { userId: req.user.id });
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

// Obtener perfil del usuario actual
app.get('/api/auth/me', verifyToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

// Cambiar contraseña
app.post('/api/auth/change-password', verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.find((u) => u.id === req.user.id);

  if (!user || user.password !== currentPassword) {
    return res.status(400).json({ error: true, message: 'Contraseña actual incorrecta' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: true, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  user.password = newPassword;
  logger.info('Contraseña cambiada', { userId: user.id });
  res.json({ success: true, message: 'Contraseña actualizada correctamente' });
});

// ==================== USERS API (Protegido) ====================

// Listar usuarios (admin y worker pueden ver)
app.get('/api/users', verifyToken, requireRole('admin', 'worker'), (req, res) => {
  const { role, active, search } = req.query;

  let filteredUsers = [...users];

  // Filtrar por rol
  if (role) {
    filteredUsers = filteredUsers.filter((u) => u.role === role);
  }

  // Filtrar por estado activo
  if (active !== undefined) {
    const isActive = active === 'true';
    filteredUsers = filteredUsers.filter((u) => u.active === isActive);
  }

  // Buscar por nombre o email
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.username.toLowerCase().includes(searchLower)
    );
  }

  // Estadísticas
  const stats = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    inactive: users.filter((u) => !u.active).length,
    byRole: {
      admin: users.filter((u) => u.role === 'admin').length,
      worker: users.filter((u) => u.role === 'worker').length,
      viewer: users.filter((u) => u.role === 'viewer').length,
    },
  };

  res.json({
    success: true,
    users: filteredUsers.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      avatar: u.avatar,
      active: u.active,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
    })),
    stats,
  });
});

// Obtener usuario por ID
app.get('/api/users/:id', verifyToken, requireRole('admin', 'worker'), (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      active: user.active,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

// Crear usuario (solo admin)
app.post('/api/users', verifyToken, requireAdmin, (req, res) => {
  const { username, name, email, role, phone, password } = req.body;

  // Validaciones
  if (!username || !name || !email) {
    return res
      .status(400)
      .json({ error: true, message: 'Username, nombre y email son requeridos' });
  }

  // Verificar duplicados
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: true, message: 'El username ya existe' });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: true, message: 'El email ya está registrado' });
  }

  const newUser = {
    id: Math.max(...users.map((u) => u.id)) + 1,
    username,
    password: password || 'temp123',
    name,
    email,
    role: role || 'viewer',
    phone: phone || null,
    avatar: null,
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };

  users.push(newUser);
  logger.info('Usuario creado', { userId: newUser.id, createdBy: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Usuario creado correctamente',
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      active: newUser.active,
      createdAt: newUser.createdAt,
    },
  });
});

// Actualizar usuario (solo admin)
app.put('/api/users/:id', verifyToken, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
  }

  const { name, email, role, phone, active } = req.body;
  const user = users[userIndex];

  // Verificar email duplicado
  if (email && email !== user.email && users.find((u) => u.email === email)) {
    return res.status(400).json({ error: true, message: 'El email ya está registrado' });
  }

  // Actualizar campos
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (phone !== undefined) user.phone = phone;
  if (active !== undefined) user.active = active;

  logger.info('Usuario actualizado', { userId, updatedBy: req.user.id });

  res.json({
    success: true,
    message: 'Usuario actualizado correctamente',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      active: user.active,
    },
  });
});

// Eliminar usuario (solo admin)
app.delete('/api/users/:id', verifyToken, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
  }

  // No permitir eliminar al propio usuario
  if (userId === req.user.id) {
    return res.status(400).json({ error: true, message: 'No puedes eliminar tu propia cuenta' });
  }

  const deletedUser = users.splice(userIndex, 1)[0];
  logger.info('Usuario eliminado', { userId, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Usuario eliminado correctamente',
    user: { id: deletedUser.id, username: deletedUser.username },
  });
});

// Toggle estado activo del usuario
app.patch('/api/users/:id/toggle-active', verifyToken, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
  }

  user.active = !user.active;
  logger.info(`Usuario ${user.active ? 'activado' : 'desactivado'}`, {
    userId,
    updatedBy: req.user.id,
  });

  res.json({
    success: true,
    message: `Usuario ${user.active ? 'activado' : 'desactivado'} correctamente`,
    user: { id: user.id, active: user.active },
  });
});

// Resetear contraseña (solo admin)
app.post('/api/users/:id/reset-password', verifyToken, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
  }

  const tempPassword = `temp${Math.random().toString(36).substring(2, 8)}`;
  user.password = tempPassword;

  logger.info('Contraseña reseteada', { userId, resetBy: req.user.id });

  res.json({
    success: true,
    message: 'Contraseña reseteada correctamente',
    tempPassword, // En producción, enviar por email
  });
});

// ==================== ESTADÍSTICAS API ====================

// Estadísticas históricas para gráficos
app.get('/api/stats/historical', optionalAuth, (req, res) => {
  const { period = '7d' } = req.query;

  // Datos mock para gráficos históricos
  const generateHistoricalData = (days) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        orders: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 500000) + 100000,
        visitors: Math.floor(Math.random() * 500) + 100,
      });
    }
    return data;
  };

  let days;
  switch (period) {
    case '24h':
      days = 1;
      break;
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    default:
      days = 7;
  }

  res.json({
    success: true,
    period,
    data: generateHistoricalData(days),
    summary: {
      totalOrders: Math.floor(Math.random() * 100) + 50,
      totalRevenue: Math.floor(Math.random() * 5000000) + 1000000,
      averageOrderValue: Math.floor(Math.random() * 50000) + 20000,
      conversionRate: (Math.random() * 5 + 2).toFixed(2),
    },
  });
});

// Productos más vendidos
app.get('/api/stats/top-products', optionalAuth, (req, res) => {
  const topProducts = [
    { id: 1, name: 'Ramo Romántico Premium', sold: 45, revenue: 2025000 },
    { id: 2, name: 'Arreglo Primaveral', sold: 38, revenue: 1140000 },
    { id: 3, name: 'Bouquet de Rosas Rojas', sold: 35, revenue: 1050000 },
    { id: 4, name: 'Centro de Mesa Elegante', sold: 28, revenue: 1120000 },
    { id: 5, name: 'Ramo Silvestre', sold: 25, revenue: 625000 },
  ];

  res.json({ success: true, products: topProducts });
});

// Estadísticas por categoría
app.get('/api/stats/by-category', optionalAuth, (req, res) => {
  const categories = [
    { name: 'Ramos', orders: 120, revenue: 4800000, percentage: 35 },
    { name: 'Arreglos', orders: 85, revenue: 3400000, percentage: 25 },
    { name: 'Centros de Mesa', orders: 60, revenue: 2400000, percentage: 17 },
    { name: 'Bouquets', orders: 45, revenue: 1350000, percentage: 13 },
    { name: 'Otros', orders: 35, revenue: 700000, percentage: 10 },
  ];

  res.json({ success: true, categories });
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
