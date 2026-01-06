/**
 * Servidor principal del admin-dashboard-service
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const { logger } = require('@flores-victoria/shared/utils/logger');
// Rate limiting para proteger endpoints críticos (5 intentos / 15 min)
const { criticalLimiter } = require('@flores-victoria/shared/middleware/rate-limiter');
// Token revocation para logout seguro
const {
  revokeToken,
  isTokenRevokedMiddleware,
  initRedisClient: initTokenRevocation,
} = require('@flores-victoria/shared/middleware/token-revocation');
const config = require('./config');
const {
  verifyToken,
  requireAdmin,
  requireRole,
  optionalAuth,
  generateToken,
} = require('./middleware/auth');
const {
  initializeUsers,
  getUsers,
  findUser,
  findUserById,
  validateCredentials,
} = require('./config/users');

const app = express();

// CORS configuration - allow requests from all Railway services and local dev
const corsOptions = {
  origin: [
    'https://admin-dashboard-service-production.up.railway.app',
    'https://api-gateway-production-b02f.up.railway.app',
    'https://flores-victoria-frontend.up.railway.app',
    'http://localhost:3000',
    'http://localhost:5173',
    /\.railway\.app$/, // Allow all Railway subdomains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
};

// Middleware
app.use(cors(corsOptions));
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

// Health check endpoint mejorado (REQUERIDO para Railway)
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'admin-dashboard-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    checks: {
      users: 'unknown',
      rateLimit: 'unknown',
    },
  };

  try {
    // Verificar sistema de usuarios
    const users = await getUsers();
    health.checks.users = users.length > 0 ? 'ok' : 'empty';

    // Verificar rate limiting
    health.checks.rateLimit = criticalLimiter ? 'ok' : 'disabled';

    // Estado general basado en checks
    const allOk = Object.values(health.checks).every((v) => v === 'ok');
    health.status = allOk ? 'healthy' : 'degraded';

    res.status(200).json(health);
  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
    res.status(503).json(health);
  }
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

// Middleware global para verificar tokens revocados en rutas /api/auth/* y /api/users/*
// Este middleware verifica si el token fue revocado (logout) antes de permitir acceso
app.use('/api/auth', isTokenRevokedMiddleware());
app.use('/api/users', isTokenRevokedMiddleware());

// ==================== STATIC FILES ====================
// Servir archivos estáticos desde /public (CSS, JS, assets)
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1d',
  etag: true
}));

// Dashboard principal - servir el nuevo index.html unificado
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Ruta legacy para el dashboard antiguo
app.get('/legacy', (req, res) => {
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
// Sistema de usuarios con contraseñas hasheadas (bcrypt)
// En producción: ADMIN_PASSWORD debe estar configurada como variable de entorno
// En desarrollo: usa contraseñas temporales de desarrollo

// Inicializar sistema de usuarios
initializeUsers()
  .then(() => {
    logger.info('✅ Sistema de usuarios inicializado con bcrypt');
  })
  .catch((err) => {
    logger.error('❌ Error inicializando usuarios', { error: err.message });
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Inicializar Valkey para token revocation (opcional, funciona sin Valkey)
// Solo intentar conectar si hay una URL o host REAL configurado (no defaults)
const hasValkeyConfig = process.env.VALKEY_URL || process.env.VALKEY_HOST || process.env.REDIS_URL;

if (hasValkeyConfig) {
  try {
    const Redis = require('ioredis');
    
    const valkeyOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      retryStrategy: (times) => {
        if (times > 2) {
          logger.info('ℹ️ Valkey no disponible, continuando sin token revocation');
          return null; // Stop retrying after 2 attempts
        }
        return Math.min(times * 500, 2000);
      },
    };

    const connectionUrl = process.env.VALKEY_URL || process.env.REDIS_URL;
    const redisClient = connectionUrl
      ? new Redis(connectionUrl, valkeyOptions)
      : new Redis({
          host: process.env.VALKEY_HOST,
          port: process.env.VALKEY_PORT || 6379,
          password: process.env.VALKEY_PASSWORD,
          ...valkeyOptions,
        });

    // Registrar manejador de error ANTES de conectar
    redisClient.on('error', (err) => {
      // Solo loguear una vez, no en cada retry
      if (!redisClient._errorLogged) {
        redisClient._errorLogged = true;
        logger.info('ℹ️ Valkey no disponible, token revocation deshabilitado');
      }
    });

    redisClient.on('ready', () => {
      logger.info('✅ Token revocation con Valkey inicializado');
    });

    // Conectar de forma asíncrona solo si no está ya conectando
    if (redisClient.status === 'wait') {
      redisClient.connect().catch(() => {
        // Error ya manejado en el evento 'error'
      });
    }

    initTokenRevocation(redisClient);
  } catch (err) {
    logger.info('ℹ️ Valkey no configurado, token revocation deshabilitado');
  }
} else {
  logger.info('ℹ️ Valkey no configurado, token revocation deshabilitado');
}

// Login endpoint con JWT, bcrypt y rate limiting
// criticalLimiter: 5 intentos por 15 minutos para prevenir brute force
app.post('/api/auth/login', criticalLimiter, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const identifier = username || email;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Usuario/email y contraseña son requeridos',
        code: 'MISSING_CREDENTIALS',
      });
    }

    // Validar credenciales con bcrypt
    const user = await validateCredentials(identifier, password);

    if (!user) {
      logger.warn('Intento de login fallido', { identifier });
      return res.status(401).json({
        success: false,
        error: true,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (!user.active) {
      logger.warn('Login de usuario inactivo', { userId: user.id });
      return res.status(403).json({
        success: false,
        error: true,
        message: 'Usuario desactivado. Contacte al administrador.',
        code: 'USER_INACTIVE',
      });
    }

    // Generar token JWT con permisos
    const token = generateToken(user);

    logger.info('Login exitoso', {
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        phone: user.phone,
        avatar: user.avatar,
      },
      token,
      expiresIn: '8h',
    });
  } catch (error) {
    logger.error('Error en login', { error: error.message });
    res.status(500).json({
      success: false,
      error: true,
      message: 'Error interno del servidor',
      code: 'SERVER_ERROR',
    });
  }
});

// Verificar token
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user,
  });
});

// Logout (invalidar token en Redis si disponible)
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        await revokeToken(token);
        logger.info('Token revocado exitosamente', { userId: req.user.id });
      } catch (revokeError) {
        // Si Redis no está disponible, continuar con logout normal
        logger.warn('No se pudo revocar token (Redis no disponible)', {
          userId: req.user.id,
          error: revokeError.message,
        });
      }
    }
    logger.info('Logout exitoso', { userId: req.user.id });
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  } catch (error) {
    logger.error('Error en logout', { error: error.message });
    res.status(500).json({ error: true, message: 'Error cerrando sesión' });
  }
});

// Obtener perfil del usuario actual
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }
    // No exponer passwordHash
    // eslint-disable-next-line no-unused-vars
    const { passwordHash: _hash, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    logger.error('Error obteniendo perfil', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
});

// Cambiar contraseña (requiere base de datos en producción)
app.post('/api/auth/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: true,
        message: 'Contraseña actual y nueva son requeridas',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: true,
        message: 'La nueva contraseña debe tener al menos 8 caracteres',
      });
    }

    // Verificar contraseña actual
    const { comparePassword } = require('./config/users');
    const user = await findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: true, message: 'Contraseña actual incorrecta' });
    }

    // En producción, actualizar en base de datos:
    // const newHash = await hashPassword(newPassword);
    // await db.updateUserPassword(user.id, newHash);

    logger.info('Solicitud de cambio de contraseña', { userId: user.id });
    res.json({
      success: true,
      message: 'Funcionalidad requiere base de datos. Contraseña no actualizada.',
    });
  } catch (error) {
    logger.error('Error cambiando contraseña', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
});

// ==================== USERS API (Protegido) ====================

// Listar usuarios (admin y worker pueden ver)
app.get('/api/users', verifyToken, requireRole('admin', 'worker'), async (req, res) => {
  try {
    const { role, active, search } = req.query;
    let allUsers = await getUsers();

    // Filtrar por rol
    if (role) {
      allUsers = allUsers.filter((u) => u.role === role);
    }

    // Filtrar por estado activo
    if (active !== undefined) {
      const isActive = active === 'true';
      allUsers = allUsers.filter((u) => u.active === isActive);
    }

    // Buscar por nombre o email
    if (search) {
      const searchLower = search.toLowerCase();
      allUsers = allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          u.username.toLowerCase().includes(searchLower)
      );
    }

    // Estadísticas
    const fullUsers = await getUsers();
    const stats = {
      total: fullUsers.length,
      active: fullUsers.filter((u) => u.active).length,
      inactive: fullUsers.filter((u) => !u.active).length,
      byRole: {
        admin: fullUsers.filter((u) => u.role === 'admin').length,
        worker: fullUsers.filter((u) => u.role === 'worker').length,
        viewer: fullUsers.filter((u) => u.role === 'viewer').length,
      },
    };

    res.json({
      success: true,
      users: allUsers,
      stats,
    });
  } catch (error) {
    logger.error('Error listando usuarios', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
});

// Obtener usuario por ID
app.get('/api/users/:id', verifyToken, requireRole('admin', 'worker'), async (req, res) => {
  try {
    const user = await findUserById(Number.parseInt(req.params.id, 10));
    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }
    // No exponer passwordHash
    // eslint-disable-next-line no-unused-vars
    const { passwordHash: _unused, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    logger.error('Error obteniendo usuario', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
});

// Crear usuario (solo admin) - Requiere base de datos en producción
app.post('/api/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { username, name, email, role } = req.body;

    // Validaciones
    if (!username || !name || !email) {
      return res
        .status(400)
        .json({ error: true, message: 'Username, nombre y email son requeridos' });
    }

    // Verificar duplicados
    const existingUser = await findUser(username);
    const existingEmail = await findUser(email);
    if (existingUser || existingEmail) {
      return res.status(400).json({ error: true, message: 'El usuario o email ya existe' });
    }

    // En producción, crear en base de datos con contraseña hasheada
    logger.info('Solicitud de crear usuario', {
      username,
      email,
      role,
      requestedBy: req.user.id,
    });

    res.status(501).json({
      error: true,
      message: 'Crear usuarios requiere base de datos PostgreSQL',
      code: 'NOT_IMPLEMENTED',
    });
  } catch (error) {
    logger.error('Error creando usuario', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
});

// Actualizar usuario (solo admin) - Requiere base de datos
app.put('/api/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    logger.info('Solicitud de actualizar usuario', { userId, updatedBy: req.user.id });

    res.status(501).json({
      error: true,
      message: 'Actualizar usuarios requiere base de datos PostgreSQL',
      code: 'NOT_IMPLEMENTED',
    });
  } catch (error) {
    logger.error('Error actualizando usuario', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
});

// Eliminar usuario (solo admin) - Requiere base de datos
app.delete('/api/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    
    if (userId === req.user.id) {
      return res.status(400).json({ error: true, message: 'No puedes eliminar tu propia cuenta' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    logger.info('Solicitud de eliminar usuario', { userId, deletedBy: req.user.id });

    res.status(501).json({
      error: true,
      message: 'Eliminar usuarios requiere base de datos PostgreSQL',
      code: 'NOT_IMPLEMENTED',
    });
  } catch (error) {
    logger.error('Error eliminando usuario', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
});

// Toggle estado activo del usuario - Requiere base de datos
app.patch('/api/users/:id/toggle-active', verifyToken, requireAdmin, async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    logger.info('Solicitud de toggle usuario', { userId, updatedBy: req.user.id });

    res.status(501).json({
      error: true,
      message: 'Modificar usuarios requiere base de datos PostgreSQL',
      code: 'NOT_IMPLEMENTED',
    });
  } catch (error) {
    logger.error('Error modificando usuario', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
});

// Resetear contraseña (solo admin) - Requiere base de datos
app.post('/api/users/:id/reset-password', verifyToken, requireAdmin, async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    logger.info('Solicitud de reset contraseña', { userId, resetBy: req.user.id });

    res.status(501).json({
      error: true,
      message: 'Resetear contraseña requiere base de datos PostgreSQL',
      code: 'NOT_IMPLEMENTED',
    });
  } catch (error) {
    logger.error('Error reseteando contraseña', { error: error.message });
    res.status(500).json({ error: true, message: 'Error interno del servidor' });
  }
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
app.use((err, req, res, _next) => {
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
