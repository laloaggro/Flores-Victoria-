/**
 * Authentication Middleware for Notification Service
 * Protege endpoints de notificaciones - solo servicios internos autorizados
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'internal_service_key';

/**
 * Middleware de autenticación para servicios internos
 * Acepta: JWT token O API key interna
 */
const serviceAuth = (req, res, next) => {
  // Opción 1: API Key interna (para comunicación inter-servicio)
  const apiKey = req.headers['x-api-key'] || req.headers['x-internal-key'];
  if (apiKey === INTERNAL_API_KEY) {
    req.service = { type: 'internal', authenticated: true };
    return next();
  }

  // Opción 2: JWT token (para admin panel)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
      };

      // Solo admin puede enviar notificaciones manualmente
      if (req.user.role === 'admin') {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Se requiere rol de administrador',
        code: 'FORBIDDEN',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
      });
    }
  }

  return res.status(401).json({
    success: false,
    error: 'Autenticación requerida',
    code: 'UNAUTHORIZED',
  });
};

/**
 * Middleware de solo lectura - permite a usuarios autenticados ver su historial
 */
const readAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token requerido',
      code: 'MISSING_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      code: 'INVALID_TOKEN',
    });
  }
};

module.exports = {
  serviceAuth,
  readAuth,
};
