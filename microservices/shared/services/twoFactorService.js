/**
 * Two-Factor Authentication Service
 * TOTP (Time-based One-Time Password) para Flores Victoria
 * 
 * Implementación compatible con Google Authenticator, Authy, etc.
 */

const crypto = require('crypto');

// Configuración TOTP
const TOTP_CONFIG = {
  issuer: 'Flores Victoria',
  algorithm: 'sha1', // Compatible con la mayoría de apps
  digits: 6,
  period: 30, // Segundos
  window: 1, // Ventana de tolerancia (1 = acepta código anterior y siguiente)
};

// Caracteres para codificación Base32
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Genera una clave secreta aleatoria para TOTP
 * @param {number} length - Longitud en bytes (default 20 para 160 bits)
 * @returns {string} Clave en formato Base32
 */
function generateSecret(length = 20) {
  const buffer = crypto.randomBytes(length);
  return encodeBase32(buffer);
}

/**
 * Codifica un buffer a Base32
 * @param {Buffer} buffer 
 * @returns {string}
 */
function encodeBase32(buffer) {
  let bits = '';
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0');
  }
  
  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    result += BASE32_CHARS[Number.parseInt(chunk, 2)];
  }
  
  return result;
}

/**
 * Decodifica Base32 a Buffer
 * @param {string} str 
 * @returns {Buffer}
 */
function decodeBase32(str) {
  str = str.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  let bits = '';
  for (const char of str) {
    const index = BASE32_CHARS.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, '0');
  }
  
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  
  return Buffer.from(bytes);
}

/**
 * Genera un código TOTP para el tiempo actual
 * @param {string} secret - Clave secreta en Base32
 * @param {number} [counter] - Contador manual (para testing)
 * @returns {string} Código de 6 dígitos
 */
function generateTOTP(secret, counter = null) {
  const time = counter ?? Math.floor(Date.now() / 1000 / TOTP_CONFIG.period);
  const secretBuffer = decodeBase32(secret);
  
  // Convertir contador a buffer de 8 bytes
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(time));
  
  // HMAC-SHA1
  const hmac = crypto.createHmac(TOTP_CONFIG.algorithm, secretBuffer);
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  
  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0xf;
  const binary = (
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  );
  
  const otp = binary % Math.pow(10, TOTP_CONFIG.digits);
  return otp.toString().padStart(TOTP_CONFIG.digits, '0');
}

/**
 * Verifica un código TOTP
 * @param {string} secret - Clave secreta en Base32
 * @param {string} token - Código ingresado por el usuario
 * @returns {boolean}
 */
function verifyTOTP(secret, token) {
  if (!secret || !token) return false;
  
  const normalizedToken = token.replace(/\s/g, '');
  if (normalizedToken.length !== TOTP_CONFIG.digits) return false;
  
  const currentCounter = Math.floor(Date.now() / 1000 / TOTP_CONFIG.period);
  
  // Verificar con ventana de tolerancia
  for (let i = -TOTP_CONFIG.window; i <= TOTP_CONFIG.window; i++) {
    const expectedToken = generateTOTP(secret, currentCounter + i);
    if (timingSafeEqual(normalizedToken, expectedToken)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Comparación segura contra timing attacks
 * @param {string} a 
 * @param {string} b 
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Genera la URI para agregar a apps de autenticación
 * @param {string} secret - Clave secreta en Base32
 * @param {string} email - Email del usuario
 * @returns {string} URI otpauth://
 */
function generateOtpauthUri(secret, email) {
  const issuer = encodeURIComponent(TOTP_CONFIG.issuer);
  const account = encodeURIComponent(email);
  
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=${TOTP_CONFIG.algorithm.toUpperCase()}&digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.period}`;
}

/**
 * Genera códigos de respaldo (backup codes)
 * @param {number} count - Cantidad de códigos a generar
 * @returns {string[]} Array de códigos de 8 caracteres
 */
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Formato XXXX-XXXX para mejor legibilidad
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Hashea los códigos de respaldo para almacenamiento seguro
 * @param {string[]} codes 
 * @returns {string[]} Códigos hasheados
 */
function hashBackupCodes(codes) {
  return codes.map(code => 
    crypto.createHash('sha256').update(code.replace('-', '')).digest('hex')
  );
}

/**
 * Verifica un código de respaldo
 * @param {string} inputCode - Código ingresado
 * @param {string[]} hashedCodes - Códigos hasheados almacenados
 * @returns {{ valid: boolean, usedIndex: number }}
 */
function verifyBackupCode(inputCode, hashedCodes) {
  const normalizedInput = inputCode.replace(/[\s-]/g, '').toUpperCase();
  const inputHash = crypto.createHash('sha256').update(normalizedInput).digest('hex');
  
  for (let i = 0; i < hashedCodes.length; i++) {
    if (timingSafeEqual(inputHash, hashedCodes[i])) {
      return { valid: true, usedIndex: i };
    }
  }
  
  return { valid: false, usedIndex: -1 };
}

/**
 * Roles que requieren 2FA obligatorio
 */
const ROLES_REQUIRING_2FA = ['admin', 'manager', 'support'];

/**
 * Verifica si un rol requiere 2FA
 * @param {string} role 
 * @returns {boolean}
 */
function requires2FA(role) {
  return ROLES_REQUIRING_2FA.includes(role?.toLowerCase());
}

/**
 * Middleware factory para verificar 2FA
 * @param {Object} options
 * @param {Function} options.getUserById - Función para obtener usuario de DB
 * @returns {Function} Express middleware
 */
function create2FAMiddleware({ getUserById }) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No autenticado' }
        });
      }
      
      // Si el rol no requiere 2FA, continuar
      if (!requires2FA(req.user.role)) {
        return next();
      }
      
      // Obtener datos completos del usuario
      const user = await getUserById(req.user.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' }
        });
      }
      
      // Si tiene 2FA habilitado, verificar que se haya verificado en esta sesión
      if (user.two_factor_enabled) {
        // El token JWT debe incluir twoFactorVerified: true
        if (!req.user.twoFactorVerified) {
          return res.status(403).json({
            success: false,
            error: { 
              code: '2FA_REQUIRED', 
              message: 'Se requiere verificación de dos factores',
              requiresTwoFactor: true
            }
          });
        }
      } else if (requires2FA(user.role)) {
        // El usuario debería tener 2FA configurado pero no lo tiene
        return res.status(403).json({
          success: false,
          error: { 
            code: '2FA_SETUP_REQUIRED', 
            message: 'Debes configurar la autenticación de dos factores',
            requiresTwoFactorSetup: true
          }
        });
      }
      
      next();
    } catch (error) {
      console.error('[2FA Middleware] Error:', error);
      next(error);
    }
  };
}

module.exports = {
  // Constantes
  TOTP_CONFIG,
  ROLES_REQUIRING_2FA,
  
  // Funciones principales
  generateSecret,
  generateTOTP,
  verifyTOTP,
  generateOtpauthUri,
  
  // Códigos de respaldo
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
  
  // Utilidades
  requires2FA,
  create2FAMiddleware,
  
  // Para testing
  encodeBase32,
  decodeBase32,
};
