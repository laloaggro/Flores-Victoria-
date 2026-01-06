/**
 * @fileoverview Rutas de Fidelización - Flores Victoria
 * API para programa de puntos y niveles de cliente
 */

const express = require('express');
const router = express.Router();
const { 
  LoyaltyService, 
  CUSTOMER_TIERS, 
  POINTS_CONFIG 
} = require('../services/loyalty.service');

let loyaltyService = null;

/**
 * Inicializa el servicio de fidelización
 */
function initializeLoyalty(options) {
  loyaltyService = new LoyaltyService(options);
}

// Middleware
const requireLoyalty = (req, res, next) => {
  if (!loyaltyService) {
    return res.status(503).json({ success: false, error: 'Servicio no disponible' });
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, error: 'Autenticación requerida' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user?.role?.toLowerCase())) {
    return res.status(403).json({ success: false, error: 'Acceso denegado' });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS (CLIENTES)
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /loyalty/dashboard:
 *   get:
 *     summary: Dashboard de fidelización del usuario
 *     tags: [Fidelización]
 */
router.get('/dashboard', requireLoyalty, requireAuth, async (req, res) => {
  try {
    const dashboard = await loyaltyService.getDashboard(req.user.id);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('[Loyalty] Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo dashboard' });
  }
});

/**
 * @swagger
 * /loyalty/account:
 *   get:
 *     summary: Información de la cuenta de puntos
 *     tags: [Fidelización]
 */
router.get('/account', requireLoyalty, requireAuth, async (req, res) => {
  try {
    const account = await loyaltyService.getOrCreateAccount(req.user.id);
    res.json({ success: true, data: account });
  } catch (error) {
    console.error('[Loyalty] Account error:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo cuenta' });
  }
});

/**
 * @swagger
 * /loyalty/history:
 *   get:
 *     summary: Historial de puntos
 *     tags: [Fidelización]
 */
router.get('/history', requireLoyalty, requireAuth, async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const history = await loyaltyService.getTransactionHistory(req.user.id, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('[Loyalty] History error:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo historial' });
  }
});

/**
 * @swagger
 * /loyalty/redeem:
 *   post:
 *     summary: Canjea puntos por descuento
 *     tags: [Fidelización]
 */
router.post('/redeem', requireLoyalty, requireAuth, async (req, res) => {
  try {
    const { points, orderId } = req.body;

    if (!points || !orderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Puntos y orderId requeridos' 
      });
    }

    const result = await loyaltyService.redeemPoints(req.user.id, points, orderId);
    
    res.json({
      success: true,
      message: `¡Canjeaste ${result.pointsRedeemed} puntos!`,
      data: result,
    });
  } catch (error) {
    console.error('[Loyalty] Redeem error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /loyalty/calculate-discount:
 *   get:
 *     summary: Calcula descuento por nivel
 *     tags: [Fidelización]
 */
router.get('/calculate-discount', requireLoyalty, requireAuth, async (req, res) => {
  try {
    const cartTotal = parseFloat(req.query.cartTotal) || 0;
    const discount = await loyaltyService.calculateTierDiscount(req.user.id, cartTotal);
    res.json({ success: true, data: discount });
  } catch (error) {
    console.error('[Loyalty] Calculate discount error:', error);
    res.status(500).json({ success: false, error: 'Error calculando descuento' });
  }
});

/**
 * @swagger
 * /loyalty/check-shipping:
 *   get:
 *     summary: Verifica si aplica envío gratis
 *     tags: [Fidelización]
 */
router.get('/check-shipping', requireLoyalty, requireAuth, async (req, res) => {
  try {
    const cartTotal = parseFloat(req.query.cartTotal) || 0;
    const result = await loyaltyService.checkFreeShipping(req.user.id, cartTotal);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Loyalty] Check shipping error:', error);
    res.status(500).json({ success: false, error: 'Error verificando envío' });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS DE SISTEMA (INTERNAS)
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /loyalty/system/earn-purchase:
 *   post:
 *     summary: Registra puntos por compra (interno)
 *     tags: [Fidelización]
 */
router.post('/system/earn-purchase', requireLoyalty, async (req, res) => {
  try {
    const { userId, orderId, amount } = req.body;
    const result = await loyaltyService.earnPointsFromPurchase(userId, orderId, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Loyalty] Earn purchase error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /loyalty/system/earn-review:
 *   post:
 *     summary: Registra puntos por reseña (interno)
 *     tags: [Fidelización]
 */
router.post('/system/earn-review', requireLoyalty, async (req, res) => {
  try {
    const { userId, reviewId, hasPhoto } = req.body;
    const result = await loyaltyService.earnPointsFromReview(userId, reviewId, hasPhoto);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Loyalty] Earn review error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /loyalty/system/earn-referral:
 *   post:
 *     summary: Registra puntos por referido (interno)
 *     tags: [Fidelización]
 */
router.post('/system/earn-referral', requireLoyalty, async (req, res) => {
  try {
    const { referrerId, referredId } = req.body;
    const result = await loyaltyService.earnPointsFromReferral(referrerId, referredId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Loyalty] Earn referral error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /loyalty/system/birthday-bonus:
 *   post:
 *     summary: Otorga bonus de cumpleaños (interno)
 *     tags: [Fidelización]
 */
router.post('/system/birthday-bonus', requireLoyalty, async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await loyaltyService.grantBirthdayBonus(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Loyalty] Birthday bonus error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /loyalty/system/signup-bonus:
 *   post:
 *     summary: Otorga puntos de registro (interno)
 *     tags: [Fidelización]
 */
router.post('/system/signup-bonus', requireLoyalty, async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await loyaltyService.grantSignupBonus(userId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Loyalty] Signup bonus error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /loyalty/system/refund:
 *   post:
 *     summary: Devuelve puntos canjeados (cancelación)
 *     tags: [Fidelización]
 */
router.post('/system/refund', requireLoyalty, async (req, res) => {
  try {
    const { orderId } = req.body;
    const result = await loyaltyService.refundPoints(orderId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Loyalty] Refund error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS DE ADMINISTRACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /loyalty/admin/stats:
 *   get:
 *     summary: Estadísticas del programa
 *     tags: [Fidelización]
 */
router.get('/admin/stats', requireLoyalty, requireAdmin, async (req, res) => {
  try {
    const stats = await loyaltyService.getProgramStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[Loyalty] Stats error:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo estadísticas' });
  }
});

/**
 * @swagger
 * /loyalty/admin/adjust:
 *   post:
 *     summary: Ajusta puntos manualmente
 *     tags: [Fidelización]
 */
router.post('/admin/adjust', requireLoyalty, requireAdmin, async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    if (!userId || points === undefined || !reason) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId, points y reason requeridos' 
      });
    }

    const result = await loyaltyService.adjustPoints(
      userId, 
      points, 
      reason, 
      req.user.id
    );
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Loyalty] Adjust error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /loyalty/admin/user/{userId}:
 *   get:
 *     summary: Obtiene cuenta de un usuario
 *     tags: [Fidelización]
 */
router.get('/admin/user/:userId', requireLoyalty, requireAdmin, async (req, res) => {
  try {
    const account = await loyaltyService.getAccount(req.params.userId);
    
    if (!account) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    const history = await loyaltyService.getTransactionHistory(req.params.userId, 50);
    
    res.json({ 
      success: true, 
      data: { account, history } 
    });
  } catch (error) {
    console.error('[Loyalty] Get user error:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo usuario' });
  }
});

// ═══════════════════════════════════════════════════════════════
// INFORMACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /loyalty/tiers:
 *   get:
 *     summary: Lista todos los niveles del programa
 *     tags: [Fidelización]
 */
router.get('/tiers', (req, res) => {
  res.json({
    success: true,
    data: Object.values(CUSTOMER_TIERS),
  });
});

/**
 * @swagger
 * /loyalty/config:
 *   get:
 *     summary: Configuración del programa de puntos
 *     tags: [Fidelización]
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      pointsPerPurchase: `${POINTS_CONFIG.POINTS_PER_1000_CLP} punto por cada $1.000`,
      pointValue: `1 punto = $${POINTS_CONFIG.POINT_VALUE_CLP}`,
      minRedeem: POINTS_CONFIG.MIN_POINTS_REDEEM,
      bonuses: {
        review: POINTS_CONFIG.POINTS_FOR_REVIEW,
        reviewWithPhoto: POINTS_CONFIG.POINTS_FOR_REVIEW_WITH_PHOTO,
        referral: POINTS_CONFIG.POINTS_FOR_REFERRAL,
        signup: POINTS_CONFIG.POINTS_FOR_SIGNUP,
      },
      expiryDays: POINTS_CONFIG.POINTS_EXPIRY_DAYS,
    },
  });
});

module.exports = router;
module.exports.initializeLoyalty = initializeLoyalty;
