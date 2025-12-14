/**
 * @fileoverview Rutas de Autenticación de Dos Factores (2FA)
 * @description Endpoints para configurar y usar 2FA
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const express = require('express');

const router = express.Router();

const { TwoFactorService, generateTOTP, verifyTOTP } = require('../services/twoFactorService');

// Instancia del servicio (en producción inyectar repository)
let twoFactorService = null;

/**
 * Inicializa el servicio con el repositorio de usuarios
 * @param {Object} userRepository - Repositorio de usuarios
 */
const initializeTwoFactorRoutes = (userRepository) => {
  twoFactorService = new TwoFactorService(userRepository);
};

/**
 * Middleware para verificar autenticación
 */
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }
  next();
};

/**
 * Middleware para verificar rol de admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin privileges required',
    });
  }
  next();
};

/**
 * @route GET /api/auth/2fa/status
 * @description Verifica si el usuario tiene 2FA habilitado
 * @access Private
 */
router.get('/status', requireAuth, async (req, res) => {
  try {
    if (!twoFactorService) {
      return res.status(503).json({
        success: false,
        error: 'Two-factor service not initialized',
      });
    }

    const enabled = await twoFactorService.isTwoFactorEnabled(req.user.id);

    res.json({
      success: true,
      data: {
        enabled,
        userId: req.user.id,
      },
    });
  } catch (error) {
    console.error('[2FA] Error checking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check 2FA status',
    });
  }
});

/**
 * @route POST /api/auth/2fa/setup
 * @description Inicia la configuración de 2FA
 * @access Private (Admin only)
 */
router.post('/setup', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!twoFactorService) {
      return res.status(503).json({
        success: false,
        error: 'Two-factor service not initialized',
      });
    }

    // Verificar si ya tiene 2FA
    const alreadyEnabled = await twoFactorService.isTwoFactorEnabled(req.user.id);
    if (alreadyEnabled) {
      return res.status(400).json({
        success: false,
        error: '2FA is already enabled. Disable it first to reconfigure.',
      });
    }

    const setupData = await twoFactorService.setupTwoFactor(req.user.id, req.user.email);

    res.json({
      success: true,
      message: 'Scan the QR code with your authenticator app, then verify with a code',
      data: {
        secret: setupData.secret, // Para entrada manual
        qrCodeData: setupData.qrCodeData, // URI para QR
        recoveryCodes: setupData.recoveryCodes, // Mostrar una vez
      },
    });
  } catch (error) {
    console.error('[2FA] Error setting up:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup 2FA',
    });
  }
});

/**
 * @route POST /api/auth/2fa/confirm
 * @description Confirma la activación de 2FA con el primer código
 * @access Private (Admin only)
 */
router.post('/confirm', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }

    if (!twoFactorService) {
      return res.status(503).json({
        success: false,
        error: 'Two-factor service not initialized',
      });
    }

    const result = await twoFactorService.confirmTwoFactor(req.user.id, token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message,
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('[2FA] Error confirming:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm 2FA',
    });
  }
});

/**
 * @route POST /api/auth/2fa/verify
 * @description Verifica código 2FA durante login
 * @access Public (con token temporal de pre-auth)
 */
router.post('/verify', async (req, res) => {
  try {
    const { userId, token, preAuthToken } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        error: 'User ID and token are required',
      });
    }

    // En producción, verificar preAuthToken (token temporal de primer paso de login)
    if (!preAuthToken) {
      return res.status(400).json({
        success: false,
        error: 'Pre-authentication token is required',
      });
    }

    if (!twoFactorService) {
      return res.status(503).json({
        success: false,
        error: 'Two-factor service not initialized',
      });
    }

    const result = await twoFactorService.verifyTwoFactor(userId, token);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Si usó código de recuperación, avisar
    const response = {
      success: true,
      verified: true,
    };

    if (result.isRecoveryCode) {
      response.warning = 'You used a recovery code. Consider regenerating your recovery codes.';
    }

    res.json(response);
  } catch (error) {
    console.error('[2FA] Error verifying:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify 2FA',
    });
  }
});

/**
 * @route POST /api/auth/2fa/disable
 * @description Desactiva 2FA
 * @access Private (Admin only)
 */
router.post('/disable', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required to disable 2FA',
      });
    }

    if (!twoFactorService) {
      return res.status(503).json({
        success: false,
        error: 'Two-factor service not initialized',
      });
    }

    const result = await twoFactorService.disableTwoFactor(req.user.id, token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message,
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('[2FA] Error disabling:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable 2FA',
    });
  }
});

/**
 * @route POST /api/auth/2fa/recovery-codes
 * @description Regenera códigos de recuperación
 * @access Private (Admin only)
 */
router.post('/recovery-codes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }

    if (!twoFactorService) {
      return res.status(503).json({
        success: false,
        error: 'Two-factor service not initialized',
      });
    }

    const result = await twoFactorService.regenerateRecoveryCodes(req.user.id, token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message,
      });
    }

    res.json({
      success: true,
      message: 'Recovery codes regenerated. Save these securely!',
      data: {
        recoveryCodes: result.recoveryCodes,
      },
    });
  } catch (error) {
    console.error('[2FA] Error regenerating recovery codes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate recovery codes',
    });
  }
});

/**
 * @route POST /api/auth/2fa/validate
 * @description Valida un código TOTP (para testing)
 * @access Private (Admin only)
 */
router.post('/validate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    if (!twoFactorService) {
      return res.status(503).json({
        success: false,
        error: 'Two-factor service not initialized',
      });
    }

    const result = await twoFactorService.verifyTwoFactor(req.user.id, token);

    res.json({
      success: true,
      valid: result.valid,
      isRecoveryCode: result.isRecoveryCode || false,
    });
  } catch (error) {
    console.error('[2FA] Error validating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate token',
    });
  }
});

module.exports = router;
module.exports.initializeTwoFactorRoutes = initializeTwoFactorRoutes;
