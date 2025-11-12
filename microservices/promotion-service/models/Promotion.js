const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'bogo', 'free_shipping'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicableCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    stackable: {
      type: Boolean,
      default: false,
    },
    autoApply: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    metadata: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      imageUrl: String,
      bannerUrl: String,
      terms: String,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// ÍNDICES OPTIMIZADOS PARA PROMOCIONES
// ============================================

// Índice único para códigos de promoción (búsqueda rápida en checkout)
promotionSchema.index(
  { code: 1 },
  {
    unique: true,
    name: 'code_unique',
  }
);

// Índice compuesto para validación de promociones activas
promotionSchema.index(
  {
    active: 1,
    startDate: 1,
    endDate: 1,
  },
  {
    name: 'active_promotions',
  }
);

// Índice para promociones auto-aplicables vigentes
promotionSchema.index(
  {
    autoApply: 1,
    active: 1,
    startDate: 1,
    endDate: 1,
  },
  {
    name: 'auto_apply_active',
  }
);

// Índice para búsqueda por código activo (caso más común)
promotionSchema.index(
  {
    code: 1,
    active: 1,
    endDate: 1,
  },
  {
    name: 'code_validation',
    partialFilterExpression: { active: true },
  }
);

// Índice por prioridad para aplicar múltiples promociones
promotionSchema.index(
  {
    active: 1,
    priority: -1,
  },
  {
    name: 'priority_order',
  }
);

// Índice para promociones por categoría
promotionSchema.index(
  {
    applicableCategories: 1,
    active: 1,
  },
  {
    name: 'category_promotions',
    sparse: true,
  }
);

// Índice para promociones con límite de uso
promotionSchema.index(
  {
    usageLimit: 1,
    usageCount: 1,
  },
  {
    name: 'usage_tracking',
    partialFilterExpression: {
      usageLimit: { $ne: null },
    },
  }
);

// Virtual para verificar si la promoción está vigente
promotionSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.active &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === null || this.usageCount < this.usageLimit)
  );
});

// Método para validar si aplica a un producto
promotionSchema.methods.appliesTo = function (product, category) {
  // Verificar si está en productos excluidos
  if (this.excludedProducts.some((id) => id.equals(product._id))) {
    return false;
  }

  // Si tiene productos específicos, verificar si está incluido
  if (this.applicableProducts.length > 0) {
    return this.applicableProducts.some((id) => id.equals(product._id));
  }

  // Si tiene categorías específicas, verificar
  if (this.applicableCategories.length > 0) {
    return this.applicableCategories.includes(category);
  }

  // Si no tiene restricciones, aplica a todos
  return true;
};

// Método para calcular descuento
promotionSchema.methods.calculateDiscount = function (subtotal, items) {
  if (!this.isValid || subtotal < this.minPurchaseAmount) {
    return 0;
  }

  let discount = 0;

  switch (this.type) {
    case 'percentage':
      discount = (subtotal * this.value) / 100;
      break;

    case 'fixed':
      discount = this.value;
      break;

    case 'bogo':
      // BOGO: Buy One Get One (compra 2, paga 1)
      const applicableItems = items.filter((item) => this.appliesTo(item.product, item.category));
      const pairs = Math.floor(applicableItems.reduce((sum, item) => sum + item.quantity, 0) / 2);
      const cheapestPrice = Math.min(...applicableItems.map((item) => item.price));
      discount = pairs * cheapestPrice;
      break;

    case 'free_shipping':
      // El descuento de envío se maneja en otro lugar
      discount = 0;
      break;
  }

  // Aplicar límite máximo si existe
  if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
    discount = this.maxDiscountAmount;
  }

  return Math.max(0, discount);
};

// Middleware para validar fechas
promotionSchema.pre('save', function (next) {
  if (this.endDate < this.startDate) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  }
  next();
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
