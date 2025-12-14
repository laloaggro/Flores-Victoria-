/**
 * @fileoverview Servicio de Autenticación de Dos Factores (2FA)
 * @description Implementación de TOTP para admin panel
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const crypto = require('crypto');

/**
 * Configuración de TOTP
 */
const TOTP_CONFIG = {
  issuer: 'Flores Victoria Admin',
  algorithm: 'SHA1',
  digits: 6,
  period: 30, // segundos
  window: 1, // ventana de tolerancia
  secretLength: 20, // bytes
};

/**
 * Base32 encoding/decoding
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Codifica bytes a Base32
 * @param {Buffer} buffer - Bytes a codificar
 * @returns {string}
 */
const base32Encode = (buffer) => {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
};

/**
 * Decodifica Base32 a bytes
 * @param {string} str - String Base32
 * @returns {Buffer}
 */
const base32Decode = (str) => {
  str = str.toUpperCase().replace(/\s/g, '');
  const output = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < str.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(str[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
};

/**
 * Genera un secreto TOTP
 * @returns {string} Secreto en Base32
 */
const generateSecret = () => {
  const buffer = crypto.randomBytes(TOTP_CONFIG.secretLength);
  return base32Encode(buffer);
};

/**
 * Calcula HMAC-based OTP
 * @param {Buffer} secret - Secreto decodificado
 * @param {number} counter - Contador
 * @returns {string}
 */
const hotp = (secret, counter) => {
  // Convertir counter a buffer de 8 bytes big-endian
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  // Calcular HMAC
  const hmac = crypto.createHmac(TOTP_CONFIG.algorithm.toLowerCase(), secret);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  // Generar código de N dígitos
  const otp = binary % Math.pow(10, TOTP_CONFIG.digits);
  return otp.toString().padStart(TOTP_CONFIG.digits, '0');
};

/**
 * Genera código TOTP para el momento actual
 * @param {string} secret - Secreto Base32
 * @param {number} [time] - Timestamp opcional
 * @returns {string}
 */
const generateTOTP = (secret, time = Date.now()) => {
  const secretBuffer = base32Decode(secret);
  const counter = Math.floor(time / 1000 / TOTP_CONFIG.period);
  return hotp(secretBuffer, counter);
};

/**
 * Verifica código TOTP
 * @param {string} token - Código a verificar
 * @param {string} secret - Secreto Base32
 * @param {number} [time] - Timestamp opcional
 * @returns {boolean}
 */
const verifyTOTP = (token, secret, time = Date.now()) => {
  if (!token || !secret) return false;
  if (token.length !== TOTP_CONFIG.digits) return false;

  const secretBuffer = base32Decode(secret);
  const counter = Math.floor(time / 1000 / TOTP_CONFIG.period);

  // Verificar con ventana de tolerancia
  for (let i = -TOTP_CONFIG.window; i <= TOTP_CONFIG.window; i++) {
    const code = hotp(secretBuffer, counter + i);
    if (token === code) {
      return true;
    }
  }

  return false;
};

/**
 * Genera URI para apps de autenticación
 * @param {Object} options - Opciones
 * @param {string} options.secret - Secreto Base32
 * @param {string} options.accountName - Email o nombre del usuario
 * @param {string} [options.issuer] - Nombre del emisor
 * @returns {string}
 */
const generateOTPAuthUri = ({ secret, accountName, issuer = TOTP_CONFIG.issuer }) => {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: TOTP_CONFIG.algorithm,
    digits: TOTP_CONFIG.digits.toString(),
    period: TOTP_CONFIG.period.toString(),
  });

  const label = encodeURIComponent(`${issuer}:${accountName}`);
  return `otpauth://totp/${label}?${params.toString()}`;
};

/**
 * Genera códigos de recuperación
 * @param {number} [count=8] - Cantidad de códigos
 * @returns {string[]}
 */
const generateRecoveryCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
};

/**
 * Hashea códigos de recuperación para almacenamiento seguro
 * @param {string[]} codes - Códigos en texto plano
 * @returns {string[]} Códigos hasheados
 */
const hashRecoveryCodes = (codes) => {
  return codes.map((code) => crypto.createHash('sha256').update(code.replace('-', '')).digest('hex'));
};

/**
 * Verifica un código de recuperación
 * @param {string} code - Código ingresado
 * @param {string[]} hashedCodes - Códigos hasheados almacenados
 * @returns {{valid: boolean, index: number}}
 */
const verifyRecoveryCode = (code, hashedCodes) => {
  const normalizedCode = code.replace('-', '').toUpperCase();
  const inputHash = crypto.createHash('sha256').update(normalizedCode).digest('hex');

  const index = hashedCodes.findIndex((hash) => hash === inputHash);
  return {
    valid: index !== -1,
    index,
  };
};

/**
 * Servicio principal de 2FA
 */
class TwoFactorService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Inicia la configuración de 2FA para un usuario
   * @param {string} userId - ID del usuario
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>}
   */
  async setupTwoFactor(userId, email) {
    const secret = generateSecret();
    const otpAuthUri = generateOTPAuthUri({
      secret,
      accountName: email,
    });
    const recoveryCodes = generateRecoveryCodes();
    const hashedRecoveryCodes = hashRecoveryCodes(recoveryCodes);

    // Guardar secreto temporalmente (sin activar)
    await this._savePendingSetup(userId, {
      secret,
      hashedRecoveryCodes,
      createdAt: new Date(),
    });

    return {
      secret,
      otpAuthUri,
      recoveryCodes, // Mostrar solo una vez
      qrCodeData: otpAuthUri, // Para generar QR en frontend
    };
  }

  /**
   * Confirma la activación de 2FA verificando el primer código
   * @param {string} userId - ID del usuario
   * @param {string} token - Código TOTP
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async confirmTwoFactor(userId, token) {
    const pendingSetup = await this._getPendingSetup(userId);

    if (!pendingSetup) {
      return { success: false, message: '2FA setup not initiated' };
    }

    // Verificar que el setup no haya expirado (15 min)
    const setupAge = Date.now() - new Date(pendingSetup.createdAt).getTime();
    if (setupAge > 15 * 60 * 1000) {
      await this._deletePendingSetup(userId);
      return { success: false, message: '2FA setup expired' };
    }

    // Verificar código
    if (!verifyTOTP(token, pendingSetup.secret)) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Activar 2FA
    await this._activateTwoFactor(userId, {
      secret: pendingSetup.secret,
      hashedRecoveryCodes: pendingSetup.hashedRecoveryCodes,
    });

    await this._deletePendingSetup(userId);

    return { success: true, message: '2FA activated successfully' };
  }

  /**
   * Verifica código 2FA durante login
   * @param {string} userId - ID del usuario
   * @param {string} token - Código TOTP o recovery code
   * @returns {Promise<{valid: boolean, isRecoveryCode?: boolean}>}
   */
  async verifyTwoFactor(userId, token) {
    const twoFactorData = await this._getTwoFactorData(userId);

    if (!twoFactorData || !twoFactorData.enabled) {
      return { valid: false, message: '2FA not enabled' };
    }

    // Intentar verificar como TOTP
    if (verifyTOTP(token, twoFactorData.secret)) {
      return { valid: true, isRecoveryCode: false };
    }

    // Intentar como código de recuperación
    const recoveryResult = verifyRecoveryCode(token, twoFactorData.hashedRecoveryCodes || []);

    if (recoveryResult.valid) {
      // Eliminar código usado
      await this._removeUsedRecoveryCode(userId, recoveryResult.index);
      return { valid: true, isRecoveryCode: true };
    }

    return { valid: false };
  }

  /**
   * Desactiva 2FA para un usuario
   * @param {string} userId - ID del usuario
   * @param {string} token - Código para confirmar
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async disableTwoFactor(userId, token) {
    const verifyResult = await this.verifyTwoFactor(userId, token);

    if (!verifyResult.valid) {
      return { success: false, message: 'Invalid verification code' };
    }

    await this._deactivateTwoFactor(userId);

    return { success: true, message: '2FA disabled successfully' };
  }

  /**
   * Regenera códigos de recuperación
   * @param {string} userId - ID del usuario
   * @param {string} token - Código para confirmar
   * @returns {Promise<Object>}
   */
  async regenerateRecoveryCodes(userId, token) {
    const verifyResult = await this.verifyTwoFactor(userId, token);

    if (!verifyResult.valid) {
      return { success: false, message: 'Invalid verification code' };
    }

    const newCodes = generateRecoveryCodes();
    const hashedCodes = hashRecoveryCodes(newCodes);

    await this._updateRecoveryCodes(userId, hashedCodes);

    return {
      success: true,
      recoveryCodes: newCodes,
    };
  }

  /**
   * Verifica si el usuario tiene 2FA habilitado
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async isTwoFactorEnabled(userId) {
    const data = await this._getTwoFactorData(userId);
    return data?.enabled === true;
  }

  // Métodos de persistencia (implementar según el repositorio)

  async _savePendingSetup(userId, data) {
    if (this.userRepository?.savePendingTwoFactorSetup) {
      return this.userRepository.savePendingTwoFactorSetup(userId, data);
    }
    // Fallback: guardar en memoria (solo para desarrollo)
    if (!this._pendingSetups) this._pendingSetups = new Map();
    this._pendingSetups.set(userId, data);
  }

  async _getPendingSetup(userId) {
    if (this.userRepository?.getPendingTwoFactorSetup) {
      return this.userRepository.getPendingTwoFactorSetup(userId);
    }
    return this._pendingSetups?.get(userId);
  }

  async _deletePendingSetup(userId) {
    if (this.userRepository?.deletePendingTwoFactorSetup) {
      return this.userRepository.deletePendingTwoFactorSetup(userId);
    }
    this._pendingSetups?.delete(userId);
  }

  async _activateTwoFactor(userId, data) {
    if (this.userRepository?.activateTwoFactor) {
      return this.userRepository.activateTwoFactor(userId, data);
    }
    if (!this._twoFactorData) this._twoFactorData = new Map();
    this._twoFactorData.set(userId, { ...data, enabled: true });
  }

  async _getTwoFactorData(userId) {
    if (this.userRepository?.getTwoFactorData) {
      return this.userRepository.getTwoFactorData(userId);
    }
    return this._twoFactorData?.get(userId);
  }

  async _deactivateTwoFactor(userId) {
    if (this.userRepository?.deactivateTwoFactor) {
      return this.userRepository.deactivateTwoFactor(userId);
    }
    this._twoFactorData?.delete(userId);
  }

  async _removeUsedRecoveryCode(userId, index) {
    if (this.userRepository?.removeRecoveryCode) {
      return this.userRepository.removeRecoveryCode(userId, index);
    }
    const data = this._twoFactorData?.get(userId);
    if (data?.hashedRecoveryCodes) {
      data.hashedRecoveryCodes.splice(index, 1);
    }
  }

  async _updateRecoveryCodes(userId, hashedCodes) {
    if (this.userRepository?.updateRecoveryCodes) {
      return this.userRepository.updateRecoveryCodes(userId, hashedCodes);
    }
    const data = this._twoFactorData?.get(userId);
    if (data) {
      data.hashedRecoveryCodes = hashedCodes;
    }
  }
}

module.exports = {
  TwoFactorService,
  generateSecret,
  generateTOTP,
  verifyTOTP,
  generateOTPAuthUri,
  generateRecoveryCodes,
  hashRecoveryCodes,
  verifyRecoveryCode,
  base32Encode,
  base32Decode,
  TOTP_CONFIG,
};
