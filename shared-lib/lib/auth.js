/**
 * Authentication utilities
 * Centraliza la lógica de autenticación JWT para todos los microservicios
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;

    // Validar que JWT_SECRET está configurado
    if (!this.jwtSecret || this.jwtSecret === 'your_jwt_secret_key') {
      throw new Error(
        '❌ JWT_SECRET no está configurado o tiene el valor por defecto. ' +
          'Por favor, configura una clave segura en las variables de entorno.'
      );
    }

    // Validar longitud mínima del secret
    if (this.jwtSecret.length < 32) {
      console.warn('⚠️  JWT_SECRET es demasiado corto. Se recomienda al menos 32 caracteres.');
    }
  }

  /**
   * Genera un token JWT
   * @param {Object} payload - Datos a incluir en el token
   * @param {Object} options - Opciones adicionales
   * @returns {string} Token JWT
   */
  generateToken(payload, options = {}) {
    const defaultOptions = {
      expiresIn: this.jwtExpiresIn,
      issuer: 'flores-victoria-api',
      audience: 'flores-victoria-client',
    };

    const tokenOptions = { ...defaultOptions, ...options };

    return jwt.sign(payload, this.jwtSecret, tokenOptions);
  }

  /**
   * Verifica y decodifica un token JWT
   * @param {string} token - Token a verificar
   * @param {Object} options - Opciones de verificación
   * @returns {Object} Payload decodificado
   * @throws {Error} Si el token es inválido
   */
  verifyToken(token, options = {}) {
    try {
      const defaultOptions = {
        issuer: 'flores-victoria-api',
        audience: 'flores-victoria-client',
      };

      const verifyOptions = { ...defaultOptions, ...options };

      return jwt.verify(token, this.jwtSecret, verifyOptions);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else {
        throw error;
      }
    }
  }

  /**
   * Decodifica un token sin verificar (útil para debugging)
   * @param {string} token - Token a decodificar
   * @returns {Object} Payload decodificado
   */
  decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }

  /**
   * Hash de contraseña
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Contraseña hasheada
   */
  async hashPassword(password) {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Compara una contraseña con su hash
   * @param {string} password - Contraseña en texto plano
   * @param {string} hash - Hash almacenado
   * @returns {Promise<boolean>} True si coinciden
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Genera un refresh token
   * @param {Object} payload - Datos a incluir
   * @returns {string} Refresh token
   */
  generateRefreshToken(payload) {
    return this.generateToken(payload, {
      expiresIn: '30d',
    });
  }

  /**
   * Extrae el token del header Authorization
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} Token o null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Verifica si un token está próximo a expirar
   * @param {string} token - Token a verificar
   * @param {number} thresholdMinutes - Minutos antes de expiración
   * @returns {boolean} True si está próximo a expirar
   */
  isTokenExpiringSoon(token, thresholdMinutes = 60) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) return false;

      const expirationTime = decoded.payload.exp * 1000; // Convertir a ms
      const thresholdTime = Date.now() + thresholdMinutes * 60 * 1000;

      return expirationTime <= thresholdTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Genera un token de activación/recuperación (corta duración)
   * @param {Object} payload - Datos a incluir
   * @returns {string} Token
   */
  generateActivationToken(payload) {
    return this.generateToken(payload, {
      expiresIn: '1h',
    });
  }

  /**
   * Valida la estructura de un token JWT (sin verificar firma)
   * @param {string} token - Token a validar
   * @returns {boolean} True si tiene estructura válida
   */
  isValidTokenStructure(token) {
    if (!token || typeof token !== 'string') return false;

    const parts = token.split('.');
    return parts.length === 3;
  }
}

// Singleton
let authServiceInstance = null;

/**
 * Obtiene la instancia del servicio de autenticación
 * @returns {AuthService}
 */
function getAuthService() {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

module.exports = getAuthService();
module.exports.AuthService = AuthService;
