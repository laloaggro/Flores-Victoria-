const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Valida si una cadena es un email válido / Validates if a string is a valid email
 * @param {string} email - El email a validar / The email to validate
 * @returns {boolean} - True si es un email válido, false en caso contrario / True if valid email, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una contraseña cumple con los requisitos mínimos / Validates if a password meets minimum requirements
 * Requisitos / Requirements: 8+ caracteres/chars, mayúscula/uppercase, minúscula/lowercase, número/number, carácter especial/special char
 * @param {string} password - La contraseña a validar / The password to validate
 * @returns {boolean} - True si es una contraseña válida, false en caso contrario / True if valid password, false otherwise
 */
const validatePassword = (password) => {
  // Regex actualizado para aceptar más caracteres especiales / Updated regex to accept more special characters
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Genera un token JWT para un usuario / Generates a JWT token for a user
 * @param {Object} payload - Datos a incluir en el token / Data to include in the token
 * @returns {string} - Token JWT generado / Generated JWT token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verifica un token JWT / Verifies a JWT token
 * @param {string} token - Token a verificar / Token to verify
 * @returns {Object} - Datos decodificados del token / Decoded token data
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.verify(token, secret);
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