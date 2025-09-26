const winston = require('winston');
const { format, transports } = winston;
const { combine, timestamp, printf } = format;

// Configurar el formato del log (única declaración)
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Crear el logger
const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/auth-service.log' })
  ]
});

const { generateToken } = require('../utils/jwt');
const { comparePassword, hashPassword } = require('../utils/bcrypt');
const { db } = require('../config/database');
const User = require('../models/User');

/**
 * Controlador de autenticación
 */
class AuthController {
  constructor() {
    this.db = db;
    this.userModel = new User(db);
    
    // Bind methods to ensure correct 'this' context
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.googleAuth = this.googleAuth.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.logout = this.logout.bind(this);
  }

  /**
   * Registrar un nuevo usuario
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  register = async (req, res) => {
    try {
      logger.info('Solicitud de registro recibida:', req.body);
      const { name, email, password, role } = req.body;

      // Validar datos requeridos
      if (!name || !email || !password) {
        logger.warn('Datos faltantes en solicitud de registro');
        return res.status(400).json({
          status: 'fail',
          message: 'Nombre, email y contraseña son requeridos'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await this.userModel.findByEmail(email);
      if (existingUser) {
        logger.warn(`Intento de registro con email existente: ${email}`);
        return res.status(409).json({
          status: 'fail',
          message: 'El email ya está registrado'
        });
      }

      // Crear nuevo usuario
      const newUser = await this.userModel.create({
        username: name,
        email,
        password,
        role: role || 'user' // Por defecto 'user' si no se especifica
      });

      // Generar token JWT
      const token = generateToken({ 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email,
        role: newUser.role
      });

      logger.info(`Usuario registrado exitosamente: ${newUser.email}`);
      
      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
          },
          token
        }
      });
    } catch (error) {
      logger.error('Error en registro:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Iniciar sesión
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  login = async (req, res) => {
    try {
      logger.info('Solicitud de inicio de sesión recibida:', req.body);
      const { email, password } = req.body;

      // Validar datos requeridos
      if (!email || !password) {
        logger.warn('Datos faltantes en solicitud de inicio de sesión');
        return res.status(400).json({
          status: 'fail',
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario por email
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        logger.warn(`Intento de inicio de sesión con email no registrado: ${email}`);
        return res.status(401).json({
          status: 'fail',
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si es un usuario de autenticación social
      if (user.provider && user.provider !== 'local') {
        logger.warn(`Intento de inicio de sesión con credenciales para usuario de ${user.provider}: ${email}`);
        return res.status(401).json({
          status: 'fail',
          message: `Este usuario se registró con ${user.provider}. Por favor, inicia sesión con ${user.provider}.`
        });
      }

      // Verificar contraseña
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`Intento de inicio de sesión con contraseña incorrecta: ${email}`);
        return res.status(401).json({
          status: 'fail',
          message: 'Credenciales inválidas'
        });
      }

      // Generar token JWT
      const token = generateToken({ 
        id: user.id, 
        username: user.username, 
        email: user.email 
      });

      logger.info(`Inicio de sesión exitoso: ${user.email}`);
      
      res.status(200).json({
        status: 'success',
        message: 'Inicio de sesión exitoso',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      logger.error('Error en inicio de sesión:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Iniciar sesión con Google
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  googleAuth = async (req, res) => {
    try {
      logger.info('Solicitud de autenticación con Google recibida');
      const { googleId, email, name } = req.body;

      // Validar datos requeridos
      if (!googleId || !email || !name) {
        logger.warn('Datos faltantes en solicitud de autenticación con Google');
        return res.status(400).json({
          status: 'fail',
          message: 'ID de Google, email y nombre son requeridos'
        });
      }

      // Buscar usuario por ID de Google
      let user = await this.userModel.findByProviderId('google', googleId);
      
      // Si no existe, buscar por email
      if (!user) {
        user = await this.userModel.findByEmail(email);
        
        // Si existe un usuario con el mismo email pero sin proveedor, asociarlo con Google
        if (user && !user.provider) {
          // Actualizar usuario para asociarlo con Google
          // En una implementación real, aquí se actualizaría el usuario
          logger.info(`Usuario existente asociado con Google: ${email}`);
        } 
        // Si no existe, crear nuevo usuario
        else if (!user) {
          user = await this.userModel.create({
            username: name,
            email,
            provider: 'google',
            providerId: googleId
          });
          logger.info(`Nuevo usuario creado con autenticación de Google: ${email}`);
        }
        // Si existe un usuario con el mismo email pero de otro proveedor, error
        else if (user && user.provider && user.provider !== 'google') {
          logger.warn(`Email ya registrado con otro proveedor: ${email}`);
          return res.status(409).json({
            status: 'fail',
            message: `El email ya está registrado con ${user.provider}. Por favor, inicia sesión con ese método.`
          });
        }
      }

      // Generar token JWT
      const token = generateToken({ 
        id: user.id, 
        username: user.username, 
        email: user.email 
      });

      logger.info(`Autenticación con Google exitosa: ${email}`);
      
      res.status(200).json({
        status: 'success',
        message: 'Autenticación con Google exitosa',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      logger.error('Error en autenticación con Google:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener perfil de usuario
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  getProfile = async (req, res) => {
    try {
      logger.info(`Solicitud de perfil de usuario recibida para ID: ${req.userId}`);
      
      // Buscar usuario por ID
      const user = await this.userModel.findById(req.userId);
      if (!user) {
        logger.warn(`Usuario no encontrado: ${req.userId}`);
        return res.status(404).json({
          status: 'fail',
          message: 'Usuario no encontrado'
        });
      }

      logger.info(`Perfil de usuario obtenido exitosamente: ${user.email}`);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            provider: user.provider || 'local'
          }
        }
      });
    } catch (error) {
      logger.error('Error al obtener perfil de usuario:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cerrar sesión
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  logout = (req, res) => {
    try {
      logger.info(`Cierre de sesión para usuario ID: ${req.userId}`);
      
      // En una implementación real, aquí se invalidaría el token
      // Por ahora, simplemente respondemos exitosamente
      
      res.status(200).json({
        status: 'success',
        message: 'Cierre de sesión exitoso'
      });
    } catch (error) {
      logger.error('Error en cierre de sesión:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = AuthController;