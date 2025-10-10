const crypto = require('crypto');

/**
 * Utilidades de OAuth 2.0
 */
class OAuth2 {
  /**
   * Generar un código de autorización
   * @param {string} clientId - ID del cliente
   * @param {string} userId - ID del usuario
   * @param {array} scopes - Scopes solicitados
   * @param {string} redirectUri - URI de redirección
   * @returns {object} Código de autorización y metadatos
   */
  static generateAuthorizationCode(clientId, userId, scopes, redirectUri) {
    const code = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 600000; // 10 minutos
    
    return {
      code,
      clientId,
      userId,
      scopes,
      redirectUri,
      expiresAt
    };
  }

  /**
   * Generar tokens de acceso y refresh
   * @param {string} userId - ID del usuario
   * @param {array} scopes - Scopes concedidos
   * @returns {object} Tokens de acceso y refresh
   */
  static generateTokens(userId, scopes) {
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const accessTokenExpiresAt = Date.now() + 3600000; // 1 hora
    const refreshTokenExpiresAt = Date.now() + 2592000000; // 30 días
    
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      userId,
      scopes
    };
  }

  /**
   * Validar código de autorización
   * @param {object} storedCode - Código almacenado
   * @param {string} providedCode - Código proporcionado
   * @param {string} redirectUri - URI de redirección
   * @returns {boolean} Si el código es válido
   */
  static validateAuthorizationCode(storedCode, providedCode, redirectUri) {
    // Verificar que el código no haya expirado
    if (Date.now() > storedCode.expiresAt) {
      return false;
    }
    
    // Verificar que coincidan el código y la URI de redirección
    return storedCode.code === providedCode && storedCode.redirectUri === redirectUri;
  }

  /**
   * Validar token de acceso
   * @param {object} storedToken - Token almacenado
   * @param {string} providedToken - Token proporcionado
   * @returns {boolean} Si el token es válido
   */
  static validateAccessToken(storedToken, providedToken) {
    // Verificar que el token no haya expirado
    if (Date.now() > storedToken.accessTokenExpiresAt) {
      return false;
    }
    
    // Verificar que coincidan los tokens
    return storedToken.accessToken === providedToken;
  }
}

module.exports = OAuth2;