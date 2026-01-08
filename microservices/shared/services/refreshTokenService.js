/**
 * @fileoverview Refresh Token Service for Flores Victoria
 * @description Sistema de refresh tokens con rotación automática y almacenamiento seguro
 * 
 * @features
 * - Generación de refresh tokens únicos
 * - Almacenamiento en Redis/Valkey con TTL
 * - Rotación automática en cada uso
 * - Revocación de tokens (logout, cambio de contraseña)
 * - Familia de tokens para detectar reutilización
 * 
 * @security
 * - Tokens hasheados antes de almacenar
 * - Detección de reutilización de tokens (token family)
 * - Revocación automática de toda la familia si se detecta reuso
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const crypto = require('crypto');
const Redis = require('ioredis');

// Configuración
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 días en segundos
const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const TOKEN_FAMILY_PREFIX = 'token_family:';
const USER_TOKENS_PREFIX = 'user_tokens:';

let redisClient = null;

/**
 * Inicializa el cliente Redis para refresh tokens
 * @param {Object} options - Opciones de configuración
 */
function initRefreshTokenStore(options = {}) {
  const valkeyUrl = process.env.VALKEY_URL;
  
  if (valkeyUrl) {
    redisClient = new Redis(valkeyUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });
  } else {
    redisClient = new Redis({
      host: options.host || process.env.VALKEY_HOST || 'localhost',
      port: options.port || process.env.VALKEY_PORT || 6379,
      password: options.password || process.env.VALKEY_PASSWORD,
      db: options.db || process.env.VALKEY_REFRESH_DB || 4,
      lazyConnect: true,
    });
  }

  redisClient.on('error', (err) => {
    console.warn('[RefreshTokenStore] Redis error:', err.message);
  });

  redisClient.on('ready', () => {
    console.log('[RefreshTokenStore] Redis conectado');
  });

  redisClient.connect().catch(() => {});
  
  return redisClient;
}

/**
 * Genera un refresh token seguro
 * @returns {string} Token de 64 caracteres hex
 */
function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashea un token para almacenamiento seguro
 * @param {string} token - Token en texto plano
 * @returns {string} Hash SHA256 del token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Genera un ID único para familia de tokens
 * @returns {string} UUID para la familia
 */
function generateTokenFamily() {
  return crypto.randomUUID();
}

/**
 * Crea y almacena un nuevo refresh token
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones adicionales
 * @param {string} options.tokenFamily - Familia de tokens (para rotación)
 * @param {string} options.deviceInfo - Información del dispositivo
 * @param {string} options.ipAddress - Dirección IP
 * @returns {Promise<Object>} Token y metadatos
 */
async function createRefreshToken(userId, options = {}) {
  if (!redisClient) {
    throw new Error('RefreshTokenStore no inicializado');
  }

  const token = generateRefreshToken();
  const hashedToken = hashToken(token);
  const tokenFamily = options.tokenFamily || generateTokenFamily();
  const now = Date.now();
  
  const tokenData = {
    userId: userId.toString(),
    tokenFamily,
    deviceInfo: options.deviceInfo || 'unknown',
    ipAddress: options.ipAddress || 'unknown',
    createdAt: now,
    lastUsedAt: now,
    isRotated: false,
  };

  // Almacenar token hasheado
  await redisClient.setex(
    `${REFRESH_TOKEN_PREFIX}${hashedToken}`,
    REFRESH_TOKEN_EXPIRY,
    JSON.stringify(tokenData)
  );

  // Agregar a la familia de tokens
  await redisClient.sadd(`${TOKEN_FAMILY_PREFIX}${tokenFamily}`, hashedToken);
  await redisClient.expire(`${TOKEN_FAMILY_PREFIX}${tokenFamily}`, REFRESH_TOKEN_EXPIRY);

  // Agregar a tokens del usuario
  await redisClient.sadd(`${USER_TOKENS_PREFIX}${userId}`, hashedToken);
  await redisClient.expire(`${USER_TOKENS_PREFIX}${userId}`, REFRESH_TOKEN_EXPIRY);

  return {
    refreshToken: token, // Token en texto plano para el cliente
    tokenFamily,
    expiresIn: REFRESH_TOKEN_EXPIRY,
  };
}

/**
 * Valida un refresh token y lo rota
 * @param {string} token - Refresh token en texto plano
 * @returns {Promise<Object>} Nuevo token y datos del usuario
 * @throws {Error} Si el token es inválido o reutilizado
 */
async function rotateRefreshToken(token) {
  if (!redisClient) {
    throw new Error('RefreshTokenStore no inicializado');
  }

  const hashedToken = hashToken(token);
  const key = `${REFRESH_TOKEN_PREFIX}${hashedToken}`;
  
  // Obtener datos del token
  const tokenDataStr = await redisClient.get(key);
  
  if (!tokenDataStr) {
    throw new Error('Refresh token inválido o expirado');
  }

  const tokenData = JSON.parse(tokenDataStr);

  // Verificar si ya fue rotado (posible reutilización maliciosa)
  if (tokenData.isRotated) {
    // ¡Alerta de seguridad! Token ya fue usado
    // Revocar toda la familia de tokens
    await revokeTokenFamily(tokenData.tokenFamily, tokenData.userId);
    throw new Error('Token ya utilizado. Todos los tokens han sido revocados por seguridad.');
  }

  // Marcar el token actual como rotado (no eliminarlo aún por si hay problemas)
  tokenData.isRotated = true;
  tokenData.rotatedAt = Date.now();
  await redisClient.setex(key, 60, JSON.stringify(tokenData)); // Mantener 60s más

  // Crear nuevo refresh token en la misma familia
  const newTokenResult = await createRefreshToken(tokenData.userId, {
    tokenFamily: tokenData.tokenFamily,
    deviceInfo: tokenData.deviceInfo,
    ipAddress: tokenData.ipAddress,
  });

  return {
    userId: tokenData.userId,
    newRefreshToken: newTokenResult.refreshToken,
    tokenFamily: tokenData.tokenFamily,
    expiresIn: newTokenResult.expiresIn,
  };
}

/**
 * Revoca un refresh token específico
 * @param {string} token - Token a revocar
 */
async function revokeRefreshToken(token) {
  if (!redisClient) return;

  const hashedToken = hashToken(token);
  const key = `${REFRESH_TOKEN_PREFIX}${hashedToken}`;
  
  const tokenDataStr = await redisClient.get(key);
  if (tokenDataStr) {
    const tokenData = JSON.parse(tokenDataStr);
    await redisClient.srem(`${USER_TOKENS_PREFIX}${tokenData.userId}`, hashedToken);
    await redisClient.srem(`${TOKEN_FAMILY_PREFIX}${tokenData.tokenFamily}`, hashedToken);
  }
  
  await redisClient.del(key);
}

/**
 * Revoca toda una familia de tokens (usado en detección de reutilización)
 * @param {string} tokenFamily - ID de la familia
 * @param {string} userId - ID del usuario
 */
async function revokeTokenFamily(tokenFamily, userId) {
  if (!redisClient) return;

  const familyKey = `${TOKEN_FAMILY_PREFIX}${tokenFamily}`;
  const tokens = await redisClient.smembers(familyKey);
  
  // Eliminar todos los tokens de la familia
  for (const hashedToken of tokens) {
    await redisClient.del(`${REFRESH_TOKEN_PREFIX}${hashedToken}`);
    await redisClient.srem(`${USER_TOKENS_PREFIX}${userId}`, hashedToken);
  }
  
  await redisClient.del(familyKey);
  
  console.warn(`[Security] Token family ${tokenFamily} revoked for user ${userId}`);
}

/**
 * Revoca todos los refresh tokens de un usuario (logout de todos los dispositivos)
 * @param {string} userId - ID del usuario
 */
async function revokeAllUserTokens(userId) {
  if (!redisClient) return;

  const userTokensKey = `${USER_TOKENS_PREFIX}${userId}`;
  const tokens = await redisClient.smembers(userTokensKey);
  
  for (const hashedToken of tokens) {
    const tokenDataStr = await redisClient.get(`${REFRESH_TOKEN_PREFIX}${hashedToken}`);
    if (tokenDataStr) {
      const tokenData = JSON.parse(tokenDataStr);
      await redisClient.del(`${TOKEN_FAMILY_PREFIX}${tokenData.tokenFamily}`);
    }
    await redisClient.del(`${REFRESH_TOKEN_PREFIX}${hashedToken}`);
  }
  
  await redisClient.del(userTokensKey);
}

/**
 * Obtiene información de las sesiones activas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de sesiones activas
 */
async function getUserSessions(userId) {
  if (!redisClient) return [];

  const userTokensKey = `${USER_TOKENS_PREFIX}${userId}`;
  const tokens = await redisClient.smembers(userTokensKey);
  
  const sessions = [];
  for (const hashedToken of tokens) {
    const tokenDataStr = await redisClient.get(`${REFRESH_TOKEN_PREFIX}${hashedToken}`);
    if (tokenDataStr) {
      const tokenData = JSON.parse(tokenDataStr);
      if (!tokenData.isRotated) {
        sessions.push({
          deviceInfo: tokenData.deviceInfo,
          ipAddress: tokenData.ipAddress,
          createdAt: new Date(tokenData.createdAt).toISOString(),
          lastUsedAt: new Date(tokenData.lastUsedAt).toISOString(),
        });
      }
    }
  }
  
  return sessions;
}

module.exports = {
  initRefreshTokenStore,
  generateRefreshToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeTokenFamily,
  revokeAllUserTokens,
  getUserSessions,
  REFRESH_TOKEN_EXPIRY,
};
