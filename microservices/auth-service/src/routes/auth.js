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
// DESHABILITADO: Causa segfault (exit 139)
// const { createChildSpan } = require('../../../../shared/tracing');
const createChildSpan = (span, name) => null; // No-op para evitar segfault
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
// DATABASE HELPERS (PostgreSQL)
// ═══════════════════════════════════════════════════════════════

const dbGet = async (sql, params = []) => {
  const result = await db.query(sql, params);
  return result.rows[0] || null;
};

const dbRun = async (sql, params = []) => {
  const result = await db.query(sql, params);
  return { lastID: result.rows[0]?.id, rowCount: result.rowCount };
};

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

    // Tracing deshabilitado

    try {
      // Verificar si el usuario ya existe
      const existingUser = await dbGet('SELECT * FROM auth_users WHERE email = $1', [email]);
      if (existingUser) {
        throw new ConflictError('El usuario ya existe', { email });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear nuevo usuario
      const insertResult = await db.query(
        'INSERT INTO auth_users (username, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
        [name, email, hashedPassword, 'user']
      );
      const result = { lastID: insertResult.rows[0].id };

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

    // Tracing deshabilitado

    try {
      // Buscar usuario en la base de datos
      const user = await dbGet('SELECT * FROM auth_users WHERE email = $1', [email]);
      if (!user) {
        throw new UnauthorizedError('Credenciales inválidas');
      }

      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedError('Credenciales inválidas');
      }

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

    // Tracing deshabilitado

    try {
      // Buscar usuario por email
      let user = await dbGet('SELECT * FROM auth_users WHERE email = $1', [email]);

      if (!user) {
        // Crear nuevo usuario si no existe
        const insertResult = await db.query(
          'INSERT INTO auth_users (username, email, password, provider, provider_id, role, picture, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id',
          [name || email.split('@')[0], email, null, 'google', googleId, 'user', picture || null]
        );

        user = {
          id: insertResult.rows[0].id,
          email,
          username: name || email.split('@')[0],
          role: 'user',
          picture: picture || null,
        };

        req.log.info('New user created via Google', { userId: user.id, email });
      } else {
        // Si el usuario existe, actualizar su picture si viene una nueva
        if (picture && picture !== user.picture) {
          await db.query('UPDATE auth_users SET picture = $1, updated_at = NOW() WHERE id = $2', [picture, user.id]);
          user.picture = picture;
        }
        req.log.info('Existing user logged in via Google', { userId: user.id, email });
      }

      const token = `simple_token_${user.id}_${Date.now()}`;

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

    const userId = Number.parseInt(match[1], 10);
    const user = await dbGet('SELECT * FROM auth_users WHERE id = $1', [userId]);

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
