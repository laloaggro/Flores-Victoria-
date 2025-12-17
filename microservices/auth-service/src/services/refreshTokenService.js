/**
 * @fileoverview Refresh Token Service
 * @description Gestión de refresh tokens para auth-service
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const crypto = require('crypto');
const { db } = require('../config/database');

/**
 * Configuración de refresh tokens
 */
const REFRESH_TOKEN_CONFIG = {
  expiresInDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS, 10) || 30,
  tokenLength: 64,
  maxTokensPerUser: 5, // Límite de tokens activos por usuario
};

/**
 * Genera un refresh token seguro
 * @returns {Object} {token, hashedToken, expiresAt}
 */
const generateRefreshToken = () => {
  const token = crypto.randomBytes(REFRESH_TOKEN_CONFIG.tokenLength).toString('base64url');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_CONFIG.expiresInDays * 24 * 60 * 60 * 1000);

  return {
    token, // Este se envía al cliente
    hashedToken, // Este se almacena en DB
    expiresAt,
  };
};

/**
 * Hashea un token para comparación
 * @param {string} token - Token en texto plano
 * @returns {string} Token hasheado
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Crea la tabla de refresh tokens si no existe
 */
const createRefreshTokensTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      token_hash VARCHAR(128) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_used_at TIMESTAMP,
      user_agent VARCHAR(500),
      ip_address VARCHAR(45),
      is_revoked BOOLEAN DEFAULT FALSE,
      revoked_at TIMESTAMP,
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth_users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
  `;

  try {
    await db.query(createTableSQL);
    console.info('[RefreshToken] Table created/verified');
  } catch (error) {
    console.error('[RefreshToken] Error creating table:', error.message);
  }
};

/**
 * Almacena un refresh token en la base de datos
 * @param {number} userId - ID del usuario
 * @param {string} hashedToken - Token hasheado
 * @param {Date} expiresAt - Fecha de expiración
 * @param {Object} metadata - Metadatos adicionales
 * @returns {Promise<Object>} Token creado
 */
const storeRefreshToken = async (userId, hashedToken, expiresAt, metadata = {}) => {
  // Primero, limpiar tokens antiguos del usuario
  await cleanupUserTokens(userId);

  const insertSQL = `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, created_at
  `;

  const result = await db.query(insertSQL, [
    userId,
    hashedToken,
    expiresAt,
    metadata.userAgent || null,
    metadata.ipAddress || null,
  ]);

  return result.rows[0];
};

/**
 * Verifica y obtiene un refresh token
 * @param {string} token - Token en texto plano
 * @returns {Promise<Object|null>} Datos del token o null si inválido
 */
const verifyRefreshToken = async (token) => {
  const hashedToken = hashToken(token);

  const selectSQL = `
    SELECT rt.*, u.email, u.name, u.role
    FROM refresh_tokens rt
    JOIN auth_users u ON rt.user_id = u.id
    WHERE rt.token_hash = $1
      AND rt.is_revoked = FALSE
      AND rt.expires_at > NOW()
  `;

  const result = await db.query(selectSQL, [hashedToken]);

  if (result.rows.length === 0) {
    return null;
  }

  // Actualizar last_used_at
  await db.query('UPDATE refresh_tokens SET last_used_at = NOW() WHERE token_hash = $1', [
    hashedToken,
  ]);

  return result.rows[0];
};

/**
 * Revoca un refresh token específico
 * @param {string} token - Token a revocar
 * @returns {Promise<boolean>} true si se revocó
 */
const revokeRefreshToken = async (token) => {
  const hashedToken = hashToken(token);

  const updateSQL = `
    UPDATE refresh_tokens
    SET is_revoked = TRUE, revoked_at = NOW()
    WHERE token_hash = $1
    RETURNING id
  `;

  const result = await db.query(updateSQL, [hashedToken]);
  return result.rows.length > 0;
};

/**
 * Revoca todos los refresh tokens de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<number>} Número de tokens revocados
 */
const revokeAllUserTokens = async (userId) => {
  const updateSQL = `
    UPDATE refresh_tokens
    SET is_revoked = TRUE, revoked_at = NOW()
    WHERE user_id = $1 AND is_revoked = FALSE
  `;

  const result = await db.query(updateSQL, [userId]);
  return result.rowCount;
};

/**
 * Limpia tokens antiguos de un usuario (mantiene solo los más recientes)
 * @param {number} userId - ID del usuario
 */
const cleanupUserTokens = async (userId) => {
  // Obtener IDs de tokens a mantener (los N más recientes)
  const selectSQL = `
    SELECT id FROM refresh_tokens
    WHERE user_id = $1 AND is_revoked = FALSE
    ORDER BY created_at DESC
    LIMIT $2
  `;

  const tokensToKeep = await db.query(selectSQL, [userId, REFRESH_TOKEN_CONFIG.maxTokensPerUser]);
  const idsToKeep = tokensToKeep.rows.map((r) => r.id);

  if (idsToKeep.length === 0) {
    return;
  }

  // Revocar los demás
  const revokeSQL = `
    UPDATE refresh_tokens
    SET is_revoked = TRUE, revoked_at = NOW()
    WHERE user_id = $1
      AND is_revoked = FALSE
      AND id NOT IN (${idsToKeep.join(',')})
  `;

  await db.query(revokeSQL, [userId]);
};

/**
 * Limpia tokens expirados de toda la base de datos
 * @returns {Promise<number>} Número de tokens eliminados
 */
const cleanupExpiredTokens = async () => {
  const deleteSQL = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR is_revoked = TRUE
  `;

  const result = await db.query(deleteSQL);
  return result.rowCount;
};

/**
 * Obtiene todos los tokens activos de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de tokens
 */
const getUserActiveTokens = async (userId) => {
  const selectSQL = `
    SELECT id, created_at, last_used_at, user_agent, ip_address
    FROM refresh_tokens
    WHERE user_id = $1 AND is_revoked = FALSE AND expires_at > NOW()
    ORDER BY last_used_at DESC NULLS LAST
  `;

  const result = await db.query(selectSQL, [userId]);
  return result.rows;
};

/**
 * Rota un refresh token (revoca el anterior y genera uno nuevo)
 * @param {string} oldToken - Token actual
 * @param {Object} metadata - Metadatos para el nuevo token
 * @returns {Promise<Object|null>} Nuevo token o null si falló
 */
const rotateRefreshToken = async (oldToken, metadata = {}) => {
  const tokenData = await verifyRefreshToken(oldToken);

  if (!tokenData) {
    return null;
  }

  // Revocar token anterior
  await revokeRefreshToken(oldToken);

  // Generar nuevo token
  const newTokenData = generateRefreshToken();
  await storeRefreshToken(
    tokenData.user_id,
    newTokenData.hashedToken,
    newTokenData.expiresAt,
    metadata
  );

  return {
    token: newTokenData.token,
    expiresAt: newTokenData.expiresAt,
    user: {
      id: tokenData.user_id,
      email: tokenData.email,
      name: tokenData.name,
      role: tokenData.role,
    },
  };
};

module.exports = {
  generateRefreshToken,
  hashToken,
  createRefreshTokensTable,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  getUserActiveTokens,
  rotateRefreshToken,
  REFRESH_TOKEN_CONFIG,
};
