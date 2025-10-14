const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Valida si una cadena es un email válido
 * @param {string} email - El email a validar
 * @returns {boolean} - True si es un email válido, false en caso contrario
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una contraseña cumple con los requisitos mínimos
 * @param {string} password - La contraseña a validar
 * @returns {boolean} - True si es una contraseña válida, false en caso contrario
 */
const validatePassword = (password) => {
  // Requisitos mínimos: 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} - Token JWT generado
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

/**
 * Verifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} - Datos decodificados del token
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Hashea una contraseña
 * @param {string} password - Contraseña a hashear
 * @returns {Promise<string>} - Contraseña hasheada
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compara una contraseña con su versión hasheada
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {Promise<boolean>} - True si coinciden, false en caso contrario
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  validateEmail,
  validatePassword,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword
};