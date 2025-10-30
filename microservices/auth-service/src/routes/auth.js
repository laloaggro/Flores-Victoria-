const bcrypt = require('bcrypt');
const express = require('express');
const Joi = require('joi');

const {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../../../../shared/errors/AppError');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { validateBody } = require('../../../../shared/middleware/validator');
const { createChildSpan } = require('../../../../shared/tracing');
const { db } = require('../config/database');

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const googleAuthSchema = Joi.object({
  googleId: Joi.string().required(),
  email: Joi.string().email().required(),
  name: Joi.string().optional(),
  picture: Joi.string().uri().optional(),
});

// ═══════════════════════════════════════════════════════════════
// DATABASE HELPERS
// ═══════════════════════════════════════════════════════════════

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

// Ruta de registro
router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const registerSpan = createChildSpan(req.span, 'register_user');
    registerSpan.setTag('user.email', email);

    try {
      // Verificar si el usuario ya existe
      const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        registerSpan.setTag('error', true);
        registerSpan.log({ event: 'error', message: 'User already exists' });
        registerSpan.finish();
        throw new ConflictError('El usuario ya existe', { email });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear nuevo usuario
      const result = await dbRun(
        'INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [name, email, hashedPassword, 'user']
      );

      registerSpan.log({ event: 'user_registered', 'user.id': result.lastID });
      registerSpan.finish();

      req.log.info('User registered', { userId: result.lastID, email });

      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        data: {
          id: result.lastID,
          name,
          email,
        },
      });
    } catch (error) {
      registerSpan.setTag('error', true);
      registerSpan.log({ event: 'error', message: error.message });
      registerSpan.finish();
      throw error;
    }
  })
);

// Ruta de inicio de sesión
router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const loginSpan = createChildSpan(req.span, 'login_user');
    loginSpan.setTag('user.email', email);

    try {
      // Buscar usuario en la base de datos
      const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        loginSpan.setTag('error', true);
        loginSpan.log({ event: 'error', message: 'Invalid credentials' });
        loginSpan.finish();
        throw new UnauthorizedError('Credenciales inválidas');
      }

      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        loginSpan.setTag('error', true);
        loginSpan.log({ event: 'error', message: 'Invalid credentials' });
        loginSpan.finish();
        throw new UnauthorizedError('Credenciales inválidas');
      }

      loginSpan.log({ event: 'user_logged_in', 'user.id': user.id });
      loginSpan.finish();

      req.log.info('User logged in', { userId: user.id, email });

      res.status(200).json({
        status: 'success',
        message: 'Inicio de sesión exitoso',
        data: {
          token: `simple_token_${user.id}_${Date.now()}`,
          user: {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role || 'user',
          },
        },
      });
    } catch (error) {
      loginSpan.setTag('error', true);
      loginSpan.log({ event: 'error', message: error.message });
      loginSpan.finish();
      throw error;
    }
  })
);

// Ruta de autenticación con Google
router.post(
  '/google',
  validateBody(googleAuthSchema),
  asyncHandler(async (req, res) => {
    const { googleId, email, name, picture } = req.body;

    const googleSpan = createChildSpan(req.span, 'google_auth');
    googleSpan.setTag('user.email', email);

    try {
      // Buscar usuario por email
      let user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

      if (!user) {
        // Crear nuevo usuario si no existe
        const result = await dbRun(
          'INSERT INTO users (username, email, password, role, picture, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
          [name || email.split('@')[0], email, `google_${googleId}`, 'user', picture || null]
        );

        user = {
          id: result.lastID,
          email,
          username: name || email.split('@')[0],
          role: 'user',
          picture: picture || null,
        };

        googleSpan.log({ event: 'user_created', 'user.id': user.id });
        req.log.info('New user created via Google', { userId: user.id, email });
      } else {
        // Si el usuario existe, actualizar su picture si viene una nueva
        if (picture && picture !== user.picture) {
          await dbRun('UPDATE users SET picture = ? WHERE id = ?', [picture, user.id]);
          user.picture = picture;
        }
        googleSpan.log({ event: 'existing_user', 'user.id': user.id });
        req.log.info('Existing user logged in via Google', { userId: user.id, email });
      }

      const token = `simple_token_${user.id}_${Date.now()}`;

      googleSpan.finish();

      res.json({
        status: 'success',
        message: 'Autenticación con Google exitosa',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            picture: user.picture || null,
          },
        },
      });
    } catch (error) {
      googleSpan.setTag('error', true);
      googleSpan.log({ event: 'error', message: error.message });
      googleSpan.finish();
      throw error;
    }
  })
);

// Endpoint de perfil (DEV): extrae el id del token simple y devuelve el usuario
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new UnauthorizedError('Falta token de autenticación');
    }

    // Formato esperado: simple_token_<id>_<timestamp>
    const match = token.match(/^simple_token_(\d+)_/);
    if (!match) {
      throw new UnauthorizedError('Token inválido');
    }

    const userId = parseInt(match[1], 10);
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      throw new NotFoundError('Usuario', { id: userId });
    }

    req.log.info('Profile retrieved', { userId: user.id });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role || 'user',
        },
      },
    });
  })
);

module.exports = router;
