const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { AppError } = require('../shared/middlewares/errorHandler');

const router = express.Router();

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Acceso denegado. No se proporcionó token.', 401));
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return next(new AppError('Token inválido', 403));
    }
    req.user = user;
    next();
  });
};

// Registro de usuario
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return next(new AppError('Nombre, email y contraseña son requeridos', 400));
    }
    
    // Verificar si el usuario ya existe
    const db = require('../config/database');
    const userModel = new User(db);
    const existingUser = await userModel.findByEmail(email);
    
    if (existingUser) {
      return next(new AppError('El email ya está registrado', 400));
    }
    
    // Crear nuevo usuario
    const newUser = await userModel.create(name, email, password);
    
    // Generar token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    next(new AppError('Error al registrar usuario', 500));
  }
});

// Inicio de sesión
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new AppError('Email y contraseña son requeridos', 400));
    }
    
    // Buscar usuario
    const db = require('../config/database');
    const userModel = new User(db);
    const user = await userModel.findByEmail(email);
    
    if (!user) {
      return next(new AppError('Credenciales inválidas', 401));
    }
    
    // Verificar contraseña
    const isPasswordValid = await userModel.comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return next(new AppError('Credenciales inválidas', 401));
    }
    
    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(new AppError('Error al iniciar sesión', 500));
  }
});

// Obtener perfil de usuario
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const db = require('../config/database');
    const userModel = new User(db);
    const user = await userModel.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(new AppError('Error al obtener perfil de usuario', 500));
  }
});

module.exports = router;