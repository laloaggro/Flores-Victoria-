const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar tokens JWT
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con el siguiente middleware
 */
const authenticateToken = (req, res, next) => {
  // Obtener el token del header de autorización
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
    });
  }

  // Verificar el token
  jwt.verify(token, process.env.JWT_SECRET || 'my_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'fail',
        message: 'Token inválido',
      });
    }

    // Agregar información del usuario a la solicitud
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
};
