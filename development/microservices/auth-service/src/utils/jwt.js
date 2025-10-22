const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generar token JWT
 * @param {object} payload - Datos a incluir en el token
 * @returns {string} Token JWT generado
 */
const generateToken = (payload) => {
  // Establecer tiempo de expiración (24 horas por defecto)
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  // Generar token con secreto y tiempo de expiración
  return jwt.sign(payload, process.env.JWT_SECRET || 'secreto_por_defecto', {
    expiresIn,
  });
};

/**
 * Verificar token JWT
 * @param {string} token - Token a verificar
 * @returns {object} Payload decodificado o error
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
