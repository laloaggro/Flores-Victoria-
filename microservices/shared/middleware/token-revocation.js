/**
 * @fileoverview Middleware de revocación de tokens JWT
 * @description Implementa un sistema de blacklist de tokens revocados
 *              usando Redis para invalidar tokens al logout
 * 
 * @example
 * // En auth routes
 * const { revokeToken, isTokenRevoked } = require('@flores-victoria/shared/middleware/token-revocation');
 * 
 * // En logout
 * router.post('/logout', async (req, res) => {
 *   const token = req.headers.authorization.split(' ')[1];
 *   await revokeToken(token);
 *   res.json({ message: 'Logout exitoso' });
 * });
 * 
 * // En middleware de verificación
 * router.use(isTokenRevoked);
 */

const jwt = require('jsonwebtoken');
const logger = require('../logging/logger').createLogger('token-revocation');

let redisClient = null;

/**
 * Inicializa el cliente Redis para almacenar tokens revocados
 * @param {Object} client - Cliente Redis
 */
function initRedisClient(client) {
  redisClient = client;
  logger.info('🔑 Token revocation Redis client inicializado');
}

/**
 * Revoca un token agregándolo a la blacklist en Redis
 * @param {string} token - Token JWT a revocar
 * @param {number} expiryTime - Tiempo de expiración del token (en segundos)
 * @returns {Promise<boolean>} true si fue revocado exitosamente
 */
async function revokeToken(token, expiryTime = null) {
  if (!redisClient) {
    logger.error('❌ Redis client no inicializado para revocación de tokens');
    throw new Error('Token revocation system not initialized');
  }

  try {
    // Decodificar token para obtener tiempo de expiración
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      logger.warn('⚠️ No se puede determinar expiración del token');
      expiryTime = 24 * 60 * 60; // 24 horas por defecto
    } else {
      // Calcular TTL basado en exp claim
      const now = Math.floor(Date.now() / 1000);
      expiryTime = decoded.exp - now;
    }

    // Asegurar que el TTL es al menos 1 segundo
    expiryTime = Math.max(expiryTime, 1);

    // Crear clave única para este token
    const tokenHash = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const key = `revoked_token:${tokenHash}`;

    // Guardar en Redis con expiración automática
    await redisClient.setex(key, expiryTime, '1');

    logger.info(`✅ Token revocado correctamente (TTL: ${expiryTime}s)`);
    return true;
  } catch (error) {
    logger.error('❌ Error revocando token', { error: error.message });
    throw error;
  }
}

/**
 * Verifica si un token ha sido revocado
 * @param {string} token - Token JWT a verificar
 * @returns {Promise<boolean>} true si el token ha sido revocado
 */
async function checkTokenRevoked(token) {
  if (!redisClient) {
    logger.debug('⚠️ Redis client no disponible, skipping revocation check');
    return false;
  }

  try {
    const tokenHash = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const key = `revoked_token:${tokenHash}`;
    const exists = await redisClient.exists(key);

    return exists === 1;
  } catch (error) {
    logger.error('❌ Error verificando revocación de token', {
      error: error.message,
    });
    // Por seguridad, asumir que está revocado si hay error
    return true;
  }
}

/**
 * Middleware que verifica si un token ha sido revocado
 * Debe usarse DESPUÉS del middleware de verificación de JWT
 */
function isTokenRevokedMiddleware() {
  return async (req, res, next) => {
    try {
      // Obtener token del header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.substring(7);

      // Verificar si está revocado
      const isRevoked = await checkTokenRevoked(token);
      if (isRevoked) {
        logger.warn('⚠️ Token revocado detectado en request');
        return res.status(401).json({
          error: true,
          message: 'Token revocado. Por favor, inicia sesión nuevamente.',
          code: 'TOKEN_REVOKED',
        });
      }

      next();
    } catch (error) {
      logger.error('Error en middleware de revocación', { error: error.message });
      // Continuar sin bloquear, pero loguear
      next();
    }
  };
}

/**
 * Revoca todos los tokens de un usuario
 * Útil cuando cambio de contraseña o acceso no autorizado detectado
 * @param {string} userId - ID del usuario
 * @returns {Promise<number>} Número de tokens revocados
 */
async function revokeUserTokens(userId) {
  if (!redisClient) {
    logger.error('Redis client no inicializado para revocación masiva');
    throw new Error('Token revocation system not initialized');
  }

  try {
    const key = `user_revoked_tokens:${userId}`;
    const ttl = 30 * 24 * 60 * 60; // 30 días
    
    await redisClient.setex(key, ttl, '1');

    logger.info(`✅ Todos los tokens del usuario ${userId} marcados para revocación`);
    return 1;
  } catch (error) {
    logger.error('Error revocando tokens de usuario', { error: error.message });
    throw error;
  }
}

/**
 * Verifica si todos los tokens de un usuario han sido revocados
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>}
 */
async function areUserTokensRevoked(userId) {
  if (!redisClient) {
    return false;
  }

  try {
    const key = `user_revoked_tokens:${userId}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Error verificando revocación de tokens de usuario', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Limpia la blacklist de tokens expirados (para mantenimiento)
 * Se ejecuta periódicamente por un job de cron
 * @returns {Promise<number>} Número de tokens limpiados
 */
async function cleanupRevokedTokens() {
  if (!redisClient) {
    return 0;
  }

  try {
    // Redis maneja automáticamente la expiración con SETEX
    // Esta función es para documentación y posible estadísticas futura
    logger.info('✅ Cleanup de tokens revocados completado (automático por Redis)');
    return 0;
  } catch (error) {
    logger.error('Error en cleanup de tokens revocados', { error: error.message });
    return 0;
  }
}

module.exports = {
  initRedisClient,
  revokeToken,
  checkTokenRevoked,
  isTokenRevokedMiddleware,
  revokeUserTokens,
  areUserTokensRevoked,
  cleanupRevokedTokens,
};
