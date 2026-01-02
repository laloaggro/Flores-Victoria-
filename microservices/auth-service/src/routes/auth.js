const bcrypt = require('bcrypt');
const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('@flores-victoria/shared/errors/AppError');
const { asyncHandler } = require('@flores-victoria/shared/middleware/error-handler');
const { validateBody } = require('@flores-victoria/shared/middleware/validation');
const { normalizeRole, getPermissions, getRoleInfo } = require('@flores-victoria/shared/config/roles');
const { db } = require('../config/database');
const config = require('../config');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "María González"
 *         email:
 *           type: string
 *           format: email
 *           example: "maria@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           maxLength: 100
 *           example: "securePassword123"
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "maria@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "securePassword123"
 *
 *     GoogleAuthInput:
 *       type: object
 *       required:
 *         - googleId
 *         - email
 *       properties:
 *         googleId:
 *           type: string
 *           example: "108241652687135695123"
 *         email:
 *           type: string
 *           format: email
 *           example: "maria@gmail.com"
 *         name:
 *           type: string
 *           example: "María González"
 *         picture:
 *           type: string
 *           format: uri
 *           example: "https://lh3.googleusercontent.com/..."
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Inicio de sesión exitoso
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT authentication token
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "user_123"
 *                 name:
 *                   type: string
 *                   example: "María González"
 *                 email:
 *                   type: string
 *                   example: "maria@example.com"
 *                 role:
 *                   type: string
 *                   example: "user"
 */

// ═════════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═════════════════════════════════════════════════════════════════

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

/**
 * Ejecuta una consulta SQL y retorna la primera fila o null
 * @param {string} sql - Consulta SQL parametrizada
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise<Object|null>} Primera fila del resultado o null
 * @example
 * const user = await dbGet('SELECT * FROM auth_users WHERE id = $1', [userId]);
 */
const dbGet = async (sql, params = []) => {
  const result = await db.query(sql, params);
  return result.rows[0] || null;
};

/**
 * Genera un token JWT para un usuario
 * @param {Object} user - Objeto de usuario
 * @param {number} user.id - ID del usuario
 * @param {string} user.email - Email del usuario
 * @param {string} [user.role='user'] - Rol del usuario
 * @param {Object} [options={}] - Opciones adicionales
 * @param {string} [options.provider] - Proveedor de autenticación (e.g., 'google')
 * @returns {string} Token JWT firmado
 */
const generateToken = (user, options = {}) => {
  const role = normalizeRole(user.role || 'customer');
  const permissions = getPermissions(role);
  
  const payload = {
    userId: user.id,
    email: user.email,
    role: role,
    permissions: permissions, // Incluir permisos en el token
    ...(options.provider && { provider: options.provider }),
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    algorithm: 'HS256',
    issuer: 'flores-victoria-auth',
  });
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado del token
 * @throws {UnauthorizedError} Si el token es inválido o ha expirado
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],
      issuer: 'flores-victoria-auth',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expirado');
    }
    throw new UnauthorizedError('Token inválido');
  }
};

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: Usuario registrado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_123"
 *                     name:
 *                       type: string
 *                       example: "María González"
 *                     email:
 *                       type: string
 *                       example: "maria@example.com"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Tracing deshabilitado

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
  })
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Tracing deshabilitado

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

    // Generar JWT real con información del usuario
    const token = generateToken(user);
    const role = normalizeRole(user.role || 'customer');
    const roleInfo = getRoleInfo(role);
    const permissions = getPermissions(role);

    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        expiresIn: config.jwt.expiresIn,
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: role,
          roleInfo: roleInfo,
          permissions: permissions,
        },
      },
    });
  })
);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login or register with Google OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthInput'
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post(
  '/google',
  validateBody(googleAuthSchema),
  asyncHandler(async (req, res) => {
    const { googleId, email, name, picture } = req.body;

    // Tracing deshabilitado

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
        await db.query('UPDATE auth_users SET picture = $1, updated_at = NOW() WHERE id = $2', [
          picture,
          user.id,
        ]);
        user.picture = picture;
      }
      req.log.info('Existing user logged in via Google', { userId: user.id, email });
    }

    // Generar JWT real para autenticación Google
    const token = generateToken(user, { provider: 'google' });

    res.json({
      status: 'success',
      message: 'Autenticación con Google exitosa',
      data: {
        token,
        expiresIn: config.jwt.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          picture: user.picture || null,
        },
      },
    });
  })
);

// Endpoint de perfil: verifica JWT y devuelve información del usuario
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new UnauthorizedError('Falta token de autenticación');
    }

    // Verificar y decodificar el token
    const decoded = verifyToken(token);

    const userId = decoded.userId;
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

// ═══════════════════════════════════════════════════════════════
// SEED ENDPOINT - Create admin users for initial setup
// ═══════════════════════════════════════════════════════════════

const seedAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(100).required(),
  name: Joi.string().min(2).max(100).default('Admin'),
  seedKey: Joi.string().required(), // Secret key to authorize seeding
});

/**
 * @swagger
 * /auth/seed-admin:
 *   post:
 *     summary: Create an admin user (protected by seed key)
 *     tags: [Authentication]
 *     description: |
 *       Creates an admin user for initial system setup.
 *       Requires a valid SEED_KEY environment variable.
 *       This endpoint should be disabled in production after initial setup.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - seedKey
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@flores-victoria.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "SecureAdmin123!"
 *               name:
 *                 type: string
 *                 example: "Admin Principal"
 *               seedKey:
 *                 type: string
 *                 description: Secret key from SEED_KEY environment variable
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *       400:
 *         description: Invalid input or seed key
 *       409:
 *         description: Admin user already exists
 */
router.post(
  '/seed-admin',
  validateBody(seedAdminSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name, seedKey } = req.body;

    // Validate seed key
    const validSeedKey = process.env.SEED_KEY || 'flores-victoria-seed-2025';
    if (seedKey !== validSeedKey) {
      throw new UnauthorizedError('Clave de seed inválida');
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM auth_users WHERE email = $1', [email]);
    if (existingUser) {
      // If exists but not admin, upgrade to admin
      if (existingUser.role !== 'admin') {
        await db.query('UPDATE auth_users SET role = $1, updated_at = NOW() WHERE id = $2', [
          'admin',
          existingUser.id,
        ]);
        req.log.info('User upgraded to admin', { userId: existingUser.id, email });
        return res.json({
          status: 'success',
          message: 'Usuario actualizado a administrador',
          data: {
            id: existingUser.id,
            email: existingUser.email,
            role: 'admin',
          },
        });
      }
      throw new ConflictError('El usuario admin ya existe', { email });
    }

    // Hash password with higher rounds for admin
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const insertResult = await db.query(
      'INSERT INTO auth_users (username, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      [name, email, hashedPassword, 'admin']
    );
    const userId = insertResult.rows[0].id;

    req.log.info('Admin user created via seed', { userId, email });

    res.status(201).json({
      status: 'success',
      message: 'Usuario administrador creado exitosamente',
      data: {
        id: userId,
        name,
        email,
        role: 'admin',
      },
    });
  })
);

// ═══════════════════════════════════════════════════════════════
// LIST USERS (Admin only) - For admin panel
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user, viewer]
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new UnauthorizedError('Falta token de autenticación');
    }

    const decoded = verifyToken(token);

    // Check admin role
    if (decoded.role !== 'admin') {
      throw new UnauthorizedError('Acceso denegado - Solo administradores');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const roleFilter = req.query.role;

    let query = 'SELECT id, username, email, role, created_at FROM auth_users';
    let countQuery = 'SELECT COUNT(*) as total FROM auth_users';
    const params = [];

    if (roleFilter) {
      query += ' WHERE role = $1';
      countQuery += ' WHERE role = $1';
      params.push(roleFilter);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [usersResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, roleFilter ? [roleFilter] : []),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        users: usersResult.rows.map((u) => ({
          id: u.id,
          name: u.username,
          email: u.email,
          role: u.role,
          createdAt: u.created_at,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  })
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and revoke token
 *     tags: [Authentication]
 *     description: |
 *       Invalida el token JWT del usuario y lo agrega a la blacklist.
 *       Después de logout, el token ya no será válido incluso si no ha expirado.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT a revocar (opcional, se puede obtener del header)
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Logout exitoso. Tu sesión ha sido invalidada."
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    try {
      // Obtener token del header o del body
      let token = req.body.token;
      
      if (!token) {
        const authHeader = req.headers['authorization'] || '';
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.slice(7);
        }
      }

      if (!token) {
        throw new UnauthorizedError('Token no proporcionado. Por favor, envía el token en el header Authorization o en el body.');
      }

      // Verificar que el token es válido antes de revocarlo
      try {
        verifyToken(token);
      } catch (error) {
        throw new UnauthorizedError('Token inválido o expirado');
      }

      // Importar el módulo de revocación de tokens
      const { revokeToken } = require('@flores-victoria/shared/middleware/token-revocation');

      // Revocar el token
      await revokeToken(token);

      req.log.info('User logged out successfully', { token: token.substring(0, 20) + '...' });

      res.status(200).json({
        status: 'success',
        message: 'Logout exitoso. Tu sesión ha sido invalidada.',
      });
    } catch (error) {
      // Log del error pero no revelar detalles de seguridad
      req.log.error('Logout error', { error: error.message });
      
      // Para errores de autorización, devolver 401
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({
          error: true,
          message: error.message,
          code: error.code || 'UNAUTHORIZED',
        });
      }

      // Para otros errores, devolver 500
      throw error;
    }
  })
);

module.exports = router;
