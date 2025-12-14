const mongoose = require('mongoose');

// Schema para productos con campos completos
const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Precio en CLP (pesos chilenos)
    },
    original_price: {
      type: Number,
      min: 0, // Para mostrar descuentos
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    size: {
      type: String,
      trim: true,
    },
    delivery_time: {
      type: String,
      trim: true,
    },
    flowers: [
      {
        type: String,
        trim: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    occasions: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    extras: [
      {
        type: String,
        trim: true,
      },
    ],
    care_instructions: {
      type: String,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// ÍNDICES OPTIMIZADOS PARA BÚSQUEDAS RÁPIDAS
// ============================================

// Índice de texto completo para búsquedas (name + description)
productSchema.index(
  { name: 'text', description: 'text' },
  {
    weights: { name: 10, description: 5 }, // name tiene más peso en búsquedas
    name: 'product_text_search',
  }
);

// Índices simples para filtros comunes
productSchema.index({ category: 1 });
productSchema.index({ occasions: 1 });
productSchema.index({ active: 1 });
productSchema.index({ featured: 1 });

// Índices compuestos para consultas combinadas frecuentes
// Catálogo activo ordenado por precio
productSchema.index(
  { active: 1, category: 1, price: 1 },
  {
    name: 'catalog_category_price',
  }
);

// Productos destacados activos ordenados por rating
productSchema.index(
  { active: 1, featured: 1, rating: -1 },
  {
    name: 'featured_products',
  }
);

// Búsqueda por ocasión con stock disponible
productSchema.index(
  { occasions: 1, active: 1, stock: 1 },
  {
    name: 'occasion_available',
  }
);

// Productos con descuento (original_price > price)
productSchema.index(
  { active: 1, original_price: 1, price: 1 },
  {
    name: 'discounted_products',
    partialFilterExpression: {
      original_price: { $exists: true, $gt: 0 },
      price: { $gt: 0 },
    },
  }
);

// Índice para ordenar por popularidad (rating + reviews)
productSchema.index(
  { active: 1, rating: -1, reviews_count: -1 },
  {
    name: 'popular_products',
  }
);

// Índice parcial para productos con bajo stock
productSchema.index(
  { active: 1, stock: 1 },
  {
    name: 'low_stock',
    partialFilterExpression: { stock: { $lt: 10 } },
  }
);

// Índice compuesto para queries de categoría + precio (optimización de rango)
productSchema.index({ category: 1, price: 1, active: 1 }, { name: 'category_price_active' });

// Índice compuesto para ocasiones + featured (queries comunes)
productSchema.index({ occasions: 1, featured: 1, active: 1 }, { name: 'occasions_featured' });

// Índice para ordenamiento por rating + sales
productSchema.index({ rating: -1, sales: -1, active: 1 }, { name: 'popular_products' });

// Índice para productos destacados ordenados por creación
productSchema.index({ featured: 1, createdAt: -1, active: 1 }, { name: 'featured_recent' });

// Virtual para descuento porcentual
productSchema.virtual('discount_percentage').get(function () {
  if (this.original_price && this.original_price > this.price) {
    return Math.round(((this.original_price - this.price) / this.original_price) * 100);
  }
  return 0;
});

// Virtual para precio formateado en CLP
productSchema.virtual('formatted_price').get(function () {
  return `$${this.price.toLocaleString('es-CL')} CLP`;
});

// Método para incrementar vistas
productSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// ============================================
// MÉTODOS ESTÁTICOS OPTIMIZADOS CON LEAN()
// ============================================

/**
 * Campos base para listados (excluye campos pesados)
 */
const LIST_PROJECTION = {
  id: 1,
  name: 1,
  description: 1,
  price: 1,
  original_price: 1,
  category: 1,
  stock: 1,
  featured: 1,
  rating: 1,
  reviews_count: 1,
  images: { $slice: 1 }, // Solo primera imagen para listados
  occasions: 1,
  colors: 1,
  _id: 0,
};

/**
 * Buscar productos destacados activos
 * @returns {Query} Query optimizada con lean()
 */
productSchema.statics.findFeatured = function () {
  return this.find({ featured: true, active: true }).select(LIST_PROJECTION).lean();
};

/**
 * Buscar por categoría
 * @param {string} category - Nombre de la categoría
 * @returns {Query} Query optimizada
 */
productSchema.statics.findByCategory = function (category) {
  return this.find({ category, active: true }).select(LIST_PROJECTION).lean();
};

/**
 * Buscar por ocasión
 * @param {string} occasion - Nombre de la ocasión
 * @returns {Query} Query optimizada
 */
productSchema.statics.findByOccasion = function (occasion) {
  return this.find({ occasions: occasion, active: true }).select(LIST_PROJECTION).lean();
};

/**
 * Búsqueda de texto completo
 * @param {string} query - Texto de búsqueda
 * @returns {Query} Query optimizada con score
 */
productSchema.statics.searchProducts = function (query) {
  return this.find(
    {
      $text: { $search: query },
      active: true,
    },
    { score: { $meta: 'textScore' } }
  )
    .select({ ...LIST_PROJECTION, score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .lean();
};

/**
 * Obtener producto por ID con todos los detalles
 * @param {string} productId - ID del producto
 * @returns {Promise<Object|null>} Producto o null
 */
productSchema.statics.findByProductId = function (productId) {
  return this.findOne({ id: productId, active: true }).lean();
};

/**
 * Obtener productos con bajo stock
 * @param {number} threshold - Umbral de stock bajo (default: 10)
 * @returns {Query} Query optimizada
 */
productSchema.statics.findLowStock = function (threshold = 10) {
  return this.find({ active: true, stock: { $lt: threshold } })
    .select({ id: 1, name: 1, stock: 1, category: 1 })
    .sort({ stock: 1 })
    .lean();
};

/**
 * Obtener productos con descuento
 * @returns {Query} Query optimizada
 */
productSchema.statics.findDiscounted = function () {
  return this.find({
    active: true,
    original_price: { $exists: true, $gt: 0 },
    $expr: { $gt: ['$original_price', '$price'] },
  })
    .select(LIST_PROJECTION)
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = mongoose.model('Product', productSchema);
