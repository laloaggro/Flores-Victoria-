/**
 * @fileoverview Refresh Token Routes for Auth Service
 * @description Endpoints para gestión de refresh tokens con rotación
 * 
 * @routes
 * - POST /auth/token/refresh - Intercambiar refresh token por nuevo access token
 * - POST /auth/token/revoke - Revocar un refresh token específico
 * - POST /auth/logout-all - Cerrar todas las sesiones del usuario
 * - GET /auth/sessions - Listar sesiones activas del usuario
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { asyncHandler } = require('@flores-victoria/shared/middleware/error-handler');
const { validateBody } = require('@flores-victoria/shared/middleware/validation');
const { UnauthorizedError } = require('@flores-victoria/shared/errors/AppError');
const { normalizeRole, getPermissions, getRoleInfo } = require('@flores-victoria/shared/config/roles');
const {
  initRefreshTokenStore,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserSessions,
  REFRESH_TOKEN_EXPIRY,
} = require('@flores-victoria/shared/services/refreshTokenService');
const { createAuditService, AUDIT_EVENTS } = require('@flores-victoria/shared/services/auditService');
const config = require('../config');
const { db } = require('../config/database');

const router = express.Router();

// Inicializar servicios
initRefreshTokenStore();
const auditService = createAuditService({ serviceName: 'auth-service' });

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().length(64).required(),
});

const revokeTokenSchema = Joi.object({
  refreshToken: Joi.string().length(64).required(),
});

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Genera un nuevo access token JWT
 * @param {Object} user - Datos del usuario
 * @returns {string} Access token
 */
function generateAccessToken(user) {
  const role = normalizeRole(user.role || 'customer');
  const permissions = getPermissions(role);
  
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: role,
      permissions: permissions,
      type: 'access',
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn || '15m',
      algorithm: 'HS256',
      issuer: 'flores-victoria-auth',
    }
  );
}

/**
 * Obtiene información del dispositivo del request
 * @param {Object} req - Request de Express
 * @returns {string} Información del dispositivo
 */
function getDeviceInfo(req) {
  const userAgent = req.headers['user-agent'] || 'unknown';
  // Simplificar user agent para mostrar
  if (userAgent.includes('Mobile')) return 'Mobile Device';
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari')) return 'Safari Browser';
  return userAgent.substring(0, 50);
}

/**
 * Obtiene la IP del request
 * @param {Object} req - Request de Express
 * @returns {string} Dirección IP
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.ip ||
         req.connection?.remoteAddress ||
         'unknown';
}

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /auth/token/refresh:
 *   post:
 *     summary: Intercambiar refresh token por nuevo access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token de 64 caracteres
 *     responses:
 *       200:
 *         description: Tokens renovados exitosamente
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post(
  '/token/refresh',
  validateBody(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    try {
      // Rotar el refresh token (invalida el anterior y genera uno nuevo)
      const result = await rotateRefreshToken(refreshToken);
      
      // Obtener datos actualizados del usuario
      const userResult = await db.query(
        'SELECT id, username, email, role FROM auth_users WHERE id = $1',
        [result.userId]
      );
      
      if (!userResult.rows[0]) {
        throw new UnauthorizedError('Usuario no encontrado');
      }
      
      const user = userResult.rows[0];
      
      // Generar nuevo access token
      const accessToken = generateAccessToken(user);
      
      // Audit log
      auditService.log({
        type: AUDIT_EVENTS.AUTH_TOKEN_REFRESH,
        userId: user.id,
        email: user.email,
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'],
      });

      res.json({
        status: 'success',
        message: 'Tokens renovados exitosamente',
        data: {
          accessToken,
          refreshToken: result.newRefreshToken,
          expiresIn: config.jwt.expiresIn || '15m',
          refreshExpiresIn: `${REFRESH_TOKEN_EXPIRY}s`,
        },
      });
    } catch (error) {
      // Si hay error de reutilización, registrar como evento de seguridad
      if (error.message.includes('ya utilizado')) {
        auditService.logSecurityEvent(
          AUDIT_EVENTS.SECURITY_TOKEN_REUSE_DETECTED,
          { error: error.message },
          getClientIP(req)
        );
      }
      
      throw new UnauthorizedError(error.message);
    }
  })
);

/**
 * @swagger
 * /auth/token/revoke:
 *   post:
 *     summary: Revocar un refresh token específico (logout de un dispositivo)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token revocado exitosamente
 */
router.post(
  '/token/revoke',
  validateBody(revokeTokenSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    // Extraer userId del access token si está presente
    const authHeader = req.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const accessToken = authHeader.split(' ')[1];
        const decoded = jwt.verify(accessToken, config.jwt.secret);
        userId = decoded.userId;
      } catch {
        // Si el access token expiró, aún permitir revocar el refresh token
      }
    }

    await revokeRefreshToken(refreshToken);
    
    // Audit log
    auditService.log({
      type: AUDIT_EVENTS.AUTH_TOKEN_REVOKED,
      userId,
      ipAddress: getClientIP(req),
    });

    res.json({
      status: 'success',
      message: 'Token revocado exitosamente',
    });
  })
);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Cerrar todas las sesiones del usuario
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las sesiones cerradas
 *       401:
 *         description: No autenticado
 */
router.post(
  '/logout-all',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de autenticación requerido');
    }

    const accessToken = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(accessToken, config.jwt.secret);
      
      await revokeAllUserTokens(decoded.userId);
      
      // Audit log
      auditService.logLogout(decoded.userId, decoded.email, getClientIP(req));

      res.json({
        status: 'success',
        message: 'Todas las sesiones han sido cerradas',
      });
    } catch (error) {
      throw new UnauthorizedError('Token inválido');
    }
  })
);

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Listar sesiones activas del usuario
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sesiones activas
 *       401:
 *         description: No autenticado
 */
router.get(
  '/sessions',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de autenticación requerido');
    }

    const accessToken = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(accessToken, config.jwt.secret);
      
      const sessions = await getUserSessions(decoded.userId);

      res.json({
        status: 'success',
        data: {
          sessions,
          count: sessions.length,
        },
      });
    } catch (error) {
      throw new UnauthorizedError('Token inválido');
    }
  })
);

module.exports = router;
