/**
 * @fileoverview Secrets Manager - Gestión segura de secretos
 * @description Utilidades para hashing, comparación y validación de secretos
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const crypto = require('crypto');

/**
 * Configuración por defecto para hashing
 */
const HASH_CONFIG = {
  algorithm: 'sha256',
  iterations: 10000,
  keyLength: 64,
  saltLength: 32,
};

/**
 * Clase para gestión segura de secretos y API keys
 */
class SecretsManager {
  /**
   * Genera un hash seguro para un secreto (API key, token, etc.)
   * No usar para passwords - usar bcrypt para eso
   * @param {string} secret - Secreto a hashear
   * @returns {string} Hash con salt en formato 'salt:hash'
   */
  static hash(secret) {
    const salt = crypto.randomBytes(HASH_CONFIG.saltLength).toString('hex');
    const hash = crypto
      .pbkdf2Sync(
        secret,
        salt,
        HASH_CONFIG.iterations,
        HASH_CONFIG.keyLength,
        HASH_CONFIG.algorithm
      )
      .toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifica un secreto contra su hash
   * @param {string} secret - Secreto a verificar
   * @param {string} storedHash - Hash almacenado en formato 'salt:hash'
   * @returns {boolean} true si coincide
   */
  static verify(secret, storedHash) {
    if (!secret || !storedHash) {
      return false;
    }

    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) {
      return false;
    }

    const hash = crypto
      .pbkdf2Sync(
        secret,
        salt,
        HASH_CONFIG.iterations,
        HASH_CONFIG.keyLength,
        HASH_CONFIG.algorithm
      )
      .toString('hex');

    // Comparación timing-safe para prevenir timing attacks
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  }

  /**
   * Genera una API key aleatoria segura
   * @param {number} length - Longitud en bytes (default: 32)
   * @param {string} prefix - Prefijo opcional (ej: 'fv_')
   * @returns {string} API key generada
   */
  static generateApiKey(length = 32, prefix = '') {
    const randomBytes = crypto.randomBytes(length);
    const key = randomBytes.toString('base64url');
    return prefix ? `${prefix}${key}` : key;
  }

  /**
   * Genera un secreto JWT seguro
   * @param {number} length - Longitud en bytes (default: 64)
   * @returns {string} Secreto JWT
   */
  static generateJwtSecret(length = 64) {
    return crypto.randomBytes(length).toString('base64');
  }

  /**
   * Genera un token de refresh seguro
   * @returns {Object} {token, expiresAt}
   */
  static generateRefreshToken(expiresInDays = 30) {
    const token = crypto.randomBytes(64).toString('base64url');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    return { token, expiresAt };
  }

  /**
   * Genera un código de verificación numérico
   * @param {number} digits - Número de dígitos (default: 6)
   * @returns {string} Código numérico
   */
  static generateVerificationCode(digits = 6) {
    const max = Math.pow(10, digits);
    const min = Math.pow(10, digits - 1);
    const randomNum = crypto.randomInt(min, max);
    return randomNum.toString();
  }

  /**
   * Genera un token para reset de password
   * @param {number} expiresInMinutes - Tiempo de expiración
   * @returns {Object} {token, hashedToken, expiresAt}
   */
  static generatePasswordResetToken(expiresInMinutes = 60) {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    return { token, hashedToken, expiresAt };
  }

  /**
   * Hashea un token de reset (para verificación)
   * @param {string} token - Token original
   * @returns {string} Token hasheado
   */
  static hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Encripta datos sensibles (AES-256-GCM)
   * @param {string} data - Datos a encriptar
   * @param {string} key - Clave de encriptación (32 bytes base64)
   * @returns {string} Datos encriptados en formato 'iv:authTag:encrypted'
   */
  static encrypt(data, key) {
    const keyBuffer = Buffer.from(key, 'base64');
    if (keyBuffer.length !== 32) {
      throw new Error('Encryption key must be 32 bytes');
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Desencripta datos
   * @param {string} encryptedData - Datos en formato 'iv:authTag:encrypted'
   * @param {string} key - Clave de encriptación
   * @returns {string} Datos desencriptados
   */
  static decrypt(encryptedData, key) {
    const keyBuffer = Buffer.from(key, 'base64');
    if (keyBuffer.length !== 32) {
      throw new Error('Encryption key must be 32 bytes');
    }

    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Genera una clave de encriptación AES-256
   * @returns {string} Clave en base64
   */
  static generateEncryptionKey() {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Valida la fortaleza de una API key
   * @param {string} apiKey - API key a validar
   * @returns {Object} {valid, issues}
   */
  static validateApiKeyStrength(apiKey) {
    const issues = [];

    if (!apiKey || apiKey.length < 32) {
      issues.push('API key must be at least 32 characters');
    }

    // Verificar entropía básica
    const uniqueChars = new Set(apiKey).size;
    if (uniqueChars < 10) {
      issues.push('API key has low entropy (too few unique characters)');
    }

    // Verificar patrones obvios
    const obviousPatterns = [
      /^[a-f0-9]+$/i, // Solo hex puede ser débil
      /^(.)\1+$/, // Repetición de un solo carácter
      /^(abc|123|test|demo|sample)/i, // Patrones comunes
    ];

    for (const pattern of obviousPatterns) {
      if (pattern.test(apiKey)) {
        issues.push('API key contains obvious patterns');
        break;
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Máscara para mostrar secretos parcialmente
   * @param {string} secret - Secreto a enmascarar
   * @param {number} visibleChars - Caracteres visibles al inicio y fin
   * @returns {string} Secreto enmascarado
   */
  static mask(secret, visibleChars = 4) {
    if (!secret || secret.length <= visibleChars * 2) {
      return '***';
    }

    const start = secret.substring(0, visibleChars);
    const end = secret.substring(secret.length - visibleChars);
    const masked = '*'.repeat(Math.min(secret.length - visibleChars * 2, 10));

    return `${start}${masked}${end}`;
  }
}

module.exports = SecretsManager;
