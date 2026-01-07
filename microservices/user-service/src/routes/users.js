const express = require('express');
const Joi = require('joi');
const { validateBody, validateParams } = require('../../../shared/middleware/validation');
const { authMiddleware, adminOnly, selfOrAdmin, serviceAuth } = require('../middleware/auth');

const router = express.Router();
const { client } = require('../config/database');
const { User } = require('../models/User');

// Validation schemas
const userIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID de usuario inválido',
    'any.required': 'ID de usuario requerido',
  }),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido',
  }),
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.email': 'Email inválido',
    'any.required': 'El email es requerido',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.max': 'La contraseña no puede exceder 128 caracteres',
    'any.required': 'La contraseña es requerida',
  }),
  role: Joi.string().valid('customer', 'admin').default('customer'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  email: Joi.string().email().lowercase().trim(),
  role: Joi.string().valid('customer', 'admin'),
})
  .min(1)
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar',
  });

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User ID
 *           example: "user_abc123"
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "María González"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "maria@example.com"
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           default: customer
 *           example: "customer"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-21T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-21T10:00:00Z"
 *
 *     UserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: "María González"
 *         email:
 *           type: string
 *           format: email
 *           example: "maria@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: "securePassword123"
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           default: customer
 *           example: "customer"
 *
 *     UserUpdate:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: "María González"
 *         email:
 *           type: string
 *           format: email
 *           example: "maria@example.com"
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           example: "customer"
 */

// Crear instancia del modelo de usuario
const userModel = new User(client);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
// GET / - List all users (admin only or internal service)
router.get('/', serviceAuth, async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo usuarios',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics for admin dashboard
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 */
// GET /stats - User statistics for admin dashboard (MUST be before /:id)
router.get('/stats', serviceAuth, async (req, res) => {
  try {
    // Total de usuarios
    const totalResult = await client.query('SELECT COUNT(*) as total FROM users');
    const total = parseInt(totalResult.rows[0].total) || 0;

    // Usuarios activos (con actividad en últimos 30 días)
    const activeResult = await client.query(`
      SELECT COUNT(*) as active 
      FROM users 
      WHERE updated_at >= NOW() - INTERVAL '30 days'
    `);
    const active = parseInt(activeResult.rows[0].active) || 0;

    // Nuevos usuarios hoy
    const todayResult = await client.query(`
      SELECT COUNT(*) as new_today 
      FROM users 
      WHERE created_at >= CURRENT_DATE
    `);
    const newToday = parseInt(todayResult.rows[0].new_today) || 0;

    // Nuevos usuarios esta semana
    const weekResult = await client.query(`
      SELECT COUNT(*) as new_week 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const newWeek = parseInt(weekResult.rows[0].new_week) || 0;

    // Usuarios por rol
    const roleResult = await client.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    const byRole = roleResult.rows.reduce((acc, row) => {
      acc[row.role] = parseInt(row.count);
      return acc;
    }, {});

    // Tendencia (comparar semanas)
    const lastWeekResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '14 days' 
      AND created_at < NOW() - INTERVAL '7 days'
    `);
    const lastWeek = parseInt(lastWeekResult.rows[0].count) || 0;

    let trend = 0;
    if (lastWeek > 0) {
      trend = Math.round(((newWeek - lastWeek) / lastWeek) * 100);
    }

    const stats = {
      total,
      active,
      newToday,
      newWeek,
      byRole,
      trend: `${trend >= 0 ? '+' : ''}${trend}%`,
      generated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error generating user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de usuarios',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
// GET /:id - Get user by ID (authenticated user can see own profile, admin can see any)
router.get('/:id', authMiddleware, selfOrAdmin, validateParams(userIdSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo usuario',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       409:
 *         description: Email already registered
 */
router.post('/', validateBody(createUserSchema), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'El email ya está registrado',
      });
    }

    // Crear usuario
    const userData = { name, email, password, role };
    const user = await userModel.create(userData);

    res.status(201).json({
      status: 'success',
      message: 'Usuario creado exitosamente',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creando usuario',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       409:
 *         description: Email already in use
 */
// PUT /:id - Update user (user can update own profile, admin can update any)
router.put(
  '/:id',
  authMiddleware,
  selfOrAdmin,
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      // Solo admin puede cambiar roles
      if (role && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'fail',
          message: 'Solo administradores pueden cambiar roles',
        });
      }

      // Verificar si el usuario existe
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          status: 'fail',
          message: 'Usuario no encontrado',
        });
      }

      // Verificar si el email ya está en uso por otro usuario
      const userWithEmail = await userModel.findByEmail(email);
      if (userWithEmail && userWithEmail.id != id) {
        return res.status(409).json({
          status: 'fail',
          message: 'El email ya está registrado por otro usuario',
        });
      }

      // Actualizar usuario
      const userData = { name, email, role };
      const user = await userModel.update(id, userData);

      res.status(200).json({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error actualizando usuario',
        error: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario eliminado exitosamente
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
// DELETE /:id - Delete user (admin only)
router.delete('/:id', authMiddleware, adminOnly, validateParams(userIdSchema), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado',
      });
    }

    // Eliminar usuario
    const user = await userModel.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Usuario eliminado exitosamente',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error eliminando usuario',
      error: error.message,
    });
  }
});

module.exports = router;
