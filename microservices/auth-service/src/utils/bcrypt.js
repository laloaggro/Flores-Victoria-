const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hashea una contraseña
 * @param {string} password - Contraseña a hashear
 * @returns {Promise<string>} - Contraseña hasheada
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error al hashear la contraseña');
  }
};

/**
 * Compara una contraseña con su versión hasheada
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {Promise<boolean>} - true si coinciden, false si no
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Error al comparar las contraseñas');
  }
};

module.exports = {
  hashPassword,
  comparePassword
};