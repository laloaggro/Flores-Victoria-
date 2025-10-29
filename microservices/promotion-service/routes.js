const express = require('express');

const router = express.Router();
const { body, validationResult, query } = require('express-validator');

const Promotion = require('./models/Promotion');

// Middleware de validación de errores
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/promotions - Listar todas las promociones
router.get(
  '/',
  query('active').optional().isBoolean(),
  query('autoApply').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { active, autoApply, page = 1, limit = 20 } = req.query;
      const query = {};

      if (active !== undefined) {
        query.active = active === 'true';
      }

      if (autoApply !== undefined) {
        query.autoApply = autoApply === 'true';
      }

      const skip = (page - 1) * limit;
      const promotions = await Promotion.find(query)
        .sort({ priority: -1, startDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Promotion.countDocuments(query);

      res.json({
        promotions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching promotions:', error);
      res.status(500).json({ error: 'Error al obtener promociones' });
    }
  }
);

// GET /api/promotions/active - Obtener promociones activas y vigentes
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }],
    }).sort({ priority: -1, autoApply: -1 });

    res.json({ promotions });
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ error: 'Error al obtener promociones activas' });
  }
});

// GET /api/promotions/:code - Obtener promoción por código
router.get('/:code', async (req, res) => {
  try {
    const promotion = await Promotion.findOne({
      code: req.params.code.toUpperCase(),
    });

    if (!promotion) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    res.json({ promotion });
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ error: 'Error al obtener promoción' });
  }
});

// POST /api/promotions/validate - Validar código promocional
router.post(
  '/validate',
  body('code').isString().trim().notEmpty(),
  body('subtotal').isFloat({ min: 0 }),
  body('items').optional().isArray(),
  body('userId').optional().isMongoId(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { code, subtotal, items = [], userId } = req.body;

      const promotion = await Promotion.findOne({
        code: code.toUpperCase(),
      });

      if (!promotion) {
        return res.status(404).json({
          valid: false,
          error: 'Código promocional no válido',
        });
      }

      // Verificar si está activa
      if (!promotion.active) {
        return res.status(400).json({
          valid: false,
          error: 'Esta promoción ya no está disponible',
        });
      }

      // Verificar fechas
      const now = new Date();
      if (now < promotion.startDate) {
        return res.status(400).json({
          valid: false,
          error: 'Esta promoción aún no ha comenzado',
        });
      }

      if (now > promotion.endDate) {
        return res.status(400).json({
          valid: false,
          error: 'Esta promoción ha expirado',
        });
      }

      // Verificar límite de uso
      if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
        return res.status(400).json({
          valid: false,
          error: 'Esta promoción ya alcanzó su límite de uso',
        });
      }

      // Verificar monto mínimo
      if (subtotal < promotion.minPurchaseAmount) {
        return res.status(400).json({
          valid: false,
          error: `Compra mínima de $${promotion.minPurchaseAmount} requerida`,
        });
      }

      // Calcular descuento
      const discount = promotion.calculateDiscount(subtotal, items);

      res.json({
        valid: true,
        promotion: {
          code: promotion.code,
          name: promotion.name,
          type: promotion.type,
          value: promotion.value,
          discount,
          freeShipping: promotion.type === 'free_shipping',
        },
      });
    } catch (error) {
      console.error('Error validating promotion:', error);
      res.status(500).json({ error: 'Error al validar promoción' });
    }
  }
);

// POST /api/promotions - Crear nueva promoción (requiere autenticación admin)
router.post(
  '/',
  body('name').isString().trim().notEmpty(),
  body('description').isString().trim().notEmpty(),
  body('code').isString().trim().notEmpty().isLength({ min: 3, max: 20 }),
  body('type').isIn(['percentage', 'fixed', 'bogo', 'free_shipping']),
  body('value').isFloat({ min: 0 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('minPurchaseAmount').optional().isFloat({ min: 0 }),
  body('maxDiscountAmount').optional().isFloat({ min: 0 }),
  body('usageLimit').optional().isInt({ min: 1 }),
  body('perUserLimit').optional().isInt({ min: 1 }),
  body('autoApply').optional().isBoolean(),
  body('stackable').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const promotionData = {
        ...req.body,
        code: req.body.code.toUpperCase(),
      };

      const promotion = new Promotion(promotionData);
      await promotion.save();

      res.status(201).json({
        message: 'Promoción creada exitosamente',
        promotion,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          error: 'Ya existe una promoción con este código',
        });
      }
      console.error('Error creating promotion:', error);
      res.status(500).json({ error: 'Error al crear promoción' });
    }
  }
);

// PUT /api/promotions/:id - Actualizar promoción
router.put(
  '/:id',
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString().trim().notEmpty(),
  body('active').optional().isBoolean(),
  body('value').optional().isFloat({ min: 0 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const promotion = await Promotion.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!promotion) {
        return res.status(404).json({ error: 'Promoción no encontrada' });
      }

      res.json({
        message: 'Promoción actualizada exitosamente',
        promotion,
      });
    } catch (error) {
      console.error('Error updating promotion:', error);
      res.status(500).json({ error: 'Error al actualizar promoción' });
    }
  }
);

// DELETE /api/promotions/:id - Eliminar promoción
router.delete('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    res.json({ message: 'Promoción eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Error al eliminar promoción' });
  }
});

// POST /api/promotions/:id/apply - Incrementar contador de uso
router.post('/:id/apply', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }

    res.json({
      message: 'Promoción aplicada',
      promotion,
    });
  } catch (error) {
    console.error('Error applying promotion:', error);
    res.status(500).json({ error: 'Error al aplicar promoción' });
  }
});

// GET /api/promotions/stats - Estadísticas de promociones
router.get('/stats/overview', async (req, res) => {
  try {
    const now = new Date();

    const [total, active, expired, upcoming] = await Promise.all([
      Promotion.countDocuments(),
      Promotion.countDocuments({
        active: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
      Promotion.countDocuments({ endDate: { $lt: now } }),
      Promotion.countDocuments({ startDate: { $gt: now } }),
    ]);

    const topPromotions = await Promotion.find()
      .sort({ usageCount: -1 })
      .limit(5)
      .select('name code usageCount usageLimit type');

    res.json({
      stats: {
        total,
        active,
        expired,
        upcoming,
      },
      topPromotions,
    });
  } catch (error) {
    console.error('Error fetching promotion stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
