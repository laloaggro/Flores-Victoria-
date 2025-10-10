const jwt = require('jsonwebtoken');
const winston = require('winston');
const { format, transports } = winston;
const { combine, timestamp, printf } = format;

// Configurar el formato del log
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
    new transports.File({ filename: 'logs/auth-middleware.log' })
  ]
});

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.warn('Token no proporcionado en la solicitud');
      return res.status(401).json({
        status: 'fail',
        message: 'Token de acceso requerido'
      });
    }

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto', (err, decoded) => {
      if (err) {
        logger.warn('Token inválido o expirado');
        return res.status(403).json({
          status: 'fail',
          message: 'Token inválido o expirado'
        });
      }

      // Agregar información del usuario a la solicitud
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.username = decoded.username;
      
      logger.info(`Token verificado para usuario: ${decoded.email}`);
      next();
    });
  } catch (error) {
    logger.error('Error en autenticación:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  authenticateToken
};