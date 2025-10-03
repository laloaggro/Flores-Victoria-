// Importar dependencias
const { celebrate, Joi, Segments } = require('celebrate');
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Formato E.164 para números de teléfono

// Validación para registro de usuario
const validateUserCelebrate = celebrate({
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(phoneRegex).optional(),
  }),
});

// Validación para inicio de sesión
const validateLoginCelebrate = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

// Exportar validaciones
module.exports = {
  validateUser: validateUserCelebrate,
  validateLogin: validateLoginCelebrate
};
// Importaciones
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');

// Importar validaciones desde middleware
const { validateUser, validateLogin } = require('../middleware/validation');

// Inicializar express router
const router = express.Router();

// Conectar a MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/floresvictoria?authSource=admin';
const client = new MongoClient(uri);

let db;
let usersCollection;

// Inicializar la base de datos cuando se cargue el módulo
async function initDatabase() {
  try {
    await client.connect();
    console.log('Conectado a MongoDB para autenticación');
    db = client.db('floresvictoria');
    usersCollection = db.collection('users');
  } catch (error) {
    console.error('Error al conectar con MongoDB para autenticación:', error.message);
  }
}

// Inicializar la base de datos
initDatabase();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *             example:
 *               username: "juanperez"
 *               email: "juan@example.com"
 *               password: "contraseña123"
 *               phone: "+521234567890"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El usuario o email ya existe
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para registro de usuarios
router.post('/register', validateUser, async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;


    // Verificar si el usuario ya existe
    const existingUser = await usersCollection.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(409).json({ error: 'El usuario o email ya existe' });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const newUser = {
      _id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role: 'user',
      phone: phone || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await usersCollection.insertOne(newUser);

    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para inicio de sesión
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;


    // Buscar usuario por email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'secreto_por_defecto',
      { expiresIn: '24h' }
    );

    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      token, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
// Ruta para obtener perfil de usuario
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');
    
    // Buscar usuario por ID
    const user = await usersCollection.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    console.error('Error al obtener perfil:', error.message);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

module.exports = router;