const express = require('express');

const router = express.Router();
const { client } = require('../config/database');
const { User } = require('../models/User');

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
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nombre, email y contraseña son requeridos',
      });
    }

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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Validar campos requeridos
    if (!name || !email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nombre y email son requeridos',
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
});

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
router.delete('/:id', async (req, res) => {
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
