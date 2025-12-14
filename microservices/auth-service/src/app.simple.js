// app.simple.js - Express app sin dependencias de shared
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('./logger.simple');

const app = express();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_flores_victoria_local_only_32chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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
    version: '3.1.0-simple',
    endpoints: ['/health', '/auth/register', '/auth/login', '/auth/profile'],
  });
});

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

// Registro de usuario
app.post('/auth/register', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    const { name, email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email y password son requeridos',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await pool.query('SELECT id FROM auth_users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: 'fail',
        message: 'El usuario ya existe',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await pool.query(
      'INSERT INTO auth_users (username, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, username, email, role, created_at',
      [name || email.split('@')[0], email, hashedPassword, 'user']
    );

    const user = result.rows[0];

    // Generar token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    logger.info(`Usuario registrado: ${email}`);

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error('Error en registro:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al registrar usuario',
    });
  }
});

// Login de usuario
app.post('/auth/login', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email y password son requeridos',
      });
    }

    // Buscar usuario
    const result = await pool.query('SELECT * FROM auth_users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Credenciales inválidas',
      });
    }

    const user = result.rows[0];

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'fail',
        message: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    logger.info(`Usuario autenticado: ${email}`);

    res.json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error('Error en login:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al iniciar sesión',
    });
  }
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'fail',
        message: 'Token inválido o expirado',
      });
    }
    req.user = user;
    next();
  });
};

// Obtener perfil del usuario autenticado
app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('./config/database');
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM auth_users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado',
      });
    }

    const user = result.rows[0];

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    logger.error('Error al obtener perfil:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener perfil',
    });
  }
});

// Verificar token
app.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    message: 'Token válido',
    data: {
      user: req.user,
    },
  });
});

logger.info('✅ Auth routes loaded (register, login, profile, verify)');

// Error handling
app.use((err, req, res, _next) => {
  logger.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
