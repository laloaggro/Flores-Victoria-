/**
 * @fileoverview Rutas de Cupones y Promociones - Flores Victoria
 * API para gestión y aplicación de cupones de descuento
 */

const express = require('express');
const router = express.Router();
const { 
  CouponService, 
  DISCOUNT_TYPES, 
  COUPON_TYPES, 
  COUPON_STATUS 
} = require('../services/coupon.service');

let couponService = null;

/**
 * Inicializa el servicio de cupones
 * @param {Object} options - {db, cache}
 */
function initializeCoupons(options) {
  couponService = new CouponService(options);
}

// Middleware de verificación
const requireCouponService = (req, res, next) => {
  if (!couponService) {
    return res.status(503).json({
      success: false,
      error: 'Servicio de cupones no inicializado',
    });
  }
  next();
};

// Middleware admin
const requireAdmin = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (!['admin', 'manager'].includes(role)) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado',
    });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS (CLIENTES)
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Valida un código de cupón
 *     tags: [Cupones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               cart:
 *                 type: object
 */
router.post('/validate', requireCouponService, async (req, res) => {
  try {
    const { code, cart } = req.body;
    const userId = req.user?.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Código de cupón requerido',
      });
    }

    const result = await couponService.validateCoupon(code, cart || {}, userId);
    
    res.json({
      success: result.valid,
      data: result,
    });
  } catch (error) {
    console.error('[Coupons] Error validating coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error validando cupón',
    });
  }
});

/**
 * @swagger
 * /coupons/available:
 *   get:
 *     summary: Lista cupones disponibles para el usuario
 *     tags: [Cupones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/available', requireCouponService, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Debes iniciar sesión para ver tus cupones',
      });
    }

    const coupons = await couponService.getAvailableCouponsForUser(userId);
    
    res.json({
      success: true,
      data: coupons.map(c => ({
        code: c.code,
        name: c.name,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        maxDiscount: c.maxDiscount,
        minPurchase: c.minPurchase,
        endDate: c.endDate,
      })),
    });
  } catch (error) {
    console.error('[Coupons] Error getting available coupons:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo cupones',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS DE ADMINISTRACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Lista todos los cupones (admin)
 *     tags: [Cupones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', requireCouponService, requireAdmin, async (req, res) => {
  try {
    const { status, type, active, limit } = req.query;
    
    const coupons = await couponService.listCoupons({
      status,
      type,
      active: active === 'true',
      limit: limit ? parseInt(limit) : undefined,
    });
    
    res.json({
      success: true,
      data: coupons,
      count: coupons.length,
    });
  } catch (error) {
    console.error('[Coupons] Error listing coupons:', error);
    res.status(500).json({
      success: false,
      error: 'Error listando cupones',
    });
  }
});

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Crea un nuevo cupón
 *     tags: [Cupones]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireCouponService, requireAdmin, async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user?.id,
    };

    // Validaciones básicas
    if (!couponData.name) {
      return res.status(400).json({
        success: false,
        error: 'Nombre del cupón requerido',
      });
    }

    if (!couponData.discountValue || couponData.discountValue <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor de descuento inválido',
      });
    }

    const coupon = await couponService.createCoupon(couponData);
    
    res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: coupon,
    });
  } catch (error) {
    console.error('[Coupons] Error creating coupon:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creando cupón',
    });
  }
});

/**
 * @swagger
 * /coupons/bulk:
 *   post:
 *     summary: Genera cupones en lote
 *     tags: [Cupones]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk', requireCouponService, requireAdmin, async (req, res) => {
  try {
    const { template, quantity } = req.body;

    if (!quantity || quantity < 1 || quantity > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Cantidad debe estar entre 1 y 1000',
      });
    }

    const coupons = await couponService.generateBulkCoupons({
      ...template,
      createdBy: req.user?.id,
    }, quantity);
    
    res.status(201).json({
      success: true,
      message: `${coupons.length} cupones generados`,
      data: {
        count: coupons.length,
        codes: coupons.map(c => c.code),
      },
    });
  } catch (error) {
    console.error('[Coupons] Error generating bulk coupons:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando cupones',
    });
  }
});

/**
 * @swagger
 * /coupons/seasonal:
 *   post:
 *     summary: Crea cupón de temporada
 *     tags: [Cupones]
 *     security:
 *       - bearerAuth: []
 */
router.post('/seasonal', requireCouponService, requireAdmin, async (req, res) => {
  try {
    const seasonData = {
      ...req.body,
      createdBy: req.user?.id,
    };

    const coupon = await couponService.createSeasonalCoupon(seasonData);
    
    res.status(201).json({
      success: true,
      message: 'Cupón de temporada creado',
      data: coupon,
    });
  } catch (error) {
    console.error('[Coupons] Error creating seasonal coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando cupón de temporada',
    });
  }
});

/**
 * @swagger
 * /coupons/{id}:
 *   get:
 *     summary: Obtiene detalle de un cupón
 *     tags: [Cupones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', requireCouponService, requireAdmin, async (req, res) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado',
      });
    }

    // Obtener estadísticas
    const stats = await couponService.getCouponStats(req.params.id);
    
    res.json({
      success: true,
      data: {
        ...coupon,
        stats,
      },
    });
  } catch (error) {
    console.error('[Coupons] Error getting coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo cupón',
    });
  }
});

/**
 * @swagger
 * /coupons/{id}/status:
 *   put:
 *     summary: Actualiza estado de un cupón
 *     tags: [Cupones]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status', requireCouponService, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!Object.values(COUPON_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado no válido',
        validStatuses: Object.values(COUPON_STATUS),
      });
    }

    await couponService.updateCouponStatus(req.params.id, status);
    
    res.json({
      success: true,
      message: 'Estado actualizado',
    });
  } catch (error) {
    console.error('[Coupons] Error updating status:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando estado',
    });
  }
});

/**
 * @swagger
 * /coupons/{id}/stats:
 *   get:
 *     summary: Obtiene estadísticas de un cupón
 *     tags: [Cupones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/stats', requireCouponService, requireAdmin, async (req, res) => {
  try {
    const stats = await couponService.getCouponStats(req.params.id);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Coupons] Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// RUTAS ESPECIALES (SISTEMA)
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /coupons/system/first-purchase:
 *   post:
 *     summary: Genera cupón de primera compra (interno)
 *     tags: [Cupones]
 */
router.post('/system/first-purchase', requireCouponService, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId requerido',
      });
    }

    const coupon = await couponService.generateFirstPurchaseCoupon(userId);
    
    res.status(201).json({
      success: true,
      data: {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountValue: coupon.discountValue,
        endDate: coupon.endDate,
      },
    });
  } catch (error) {
    console.error('[Coupons] Error generating first purchase coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando cupón',
    });
  }
});

/**
 * @swagger
 * /coupons/system/birthday:
 *   post:
 *     summary: Genera cupón de cumpleaños (interno)
 *     tags: [Cupones]
 */
router.post('/system/birthday', requireCouponService, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId requerido',
      });
    }

    const coupon = await couponService.generateBirthdayCoupon(userId);
    
    res.status(201).json({
      success: true,
      data: {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountValue: coupon.discountValue,
        endDate: coupon.endDate,
      },
    });
  } catch (error) {
    console.error('[Coupons] Error generating birthday coupon:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando cupón',
    });
  }
});

/**
 * @swagger
 * /coupons/system/referral:
 *   post:
 *     summary: Genera cupones de referidos (interno)
 *     tags: [Cupones]
 */
router.post('/system/referral', requireCouponService, async (req, res) => {
  try {
    const { referrerId, referredId } = req.body;

    if (!referrerId || !referredId) {
      return res.status(400).json({
        success: false,
        error: 'referrerId y referredId requeridos',
      });
    }

    const { newUserCoupon, referrerCoupon } = await couponService.generateReferralCoupons(
      referrerId, 
      referredId
    );
    
    res.status(201).json({
      success: true,
      data: {
        newUser: {
          code: newUserCoupon.code,
          description: newUserCoupon.description,
        },
        referrer: {
          code: referrerCoupon.code,
          description: referrerCoupon.description,
        },
      },
    });
  } catch (error) {
    console.error('[Coupons] Error generating referral coupons:', error);
    res.status(500).json({
      success: false,
      error: 'Error generando cupones',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// INFORMACIÓN DE REFERENCIA
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /coupons/info/types:
 *   get:
 *     summary: Lista tipos de cupones disponibles
 *     tags: [Cupones]
 */
router.get('/info/types', (req, res) => {
  res.json({
    success: true,
    data: {
      discountTypes: DISCOUNT_TYPES,
      couponTypes: COUPON_TYPES,
      statuses: COUPON_STATUS,
    },
  });
});

module.exports = router;
module.exports.initializeCoupons = initializeCoupons;
