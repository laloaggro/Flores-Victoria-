const mongoose = require('mongoose');

// Schema para productos con campos completos
const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0 // Precio en CLP (pesos chilenos)
  },
  original_price: {
    type: Number,
    min: 0 // Para mostrar descuentos
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews_count: {
    type: Number,
    default: 0,
    min: 0
  },
  size: {
    type: String,
    trim: true
  },
  delivery_time: {
    type: String,
    trim: true
  },
  flowers: [{
    type: String,
    trim: true
  }],
  colors: [{
    type: String,
    trim: true
  }],
  occasions: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  extras: [{
    type: String,
    trim: true
  }],
  care_instructions: {
    type: String,
    trim: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar búsquedas
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ occasions: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ active: 1 });
productSchema.index({ rating: -1 });

// Virtual para descuento porcentual
productSchema.virtual('discount_percentage').get(function() {
  if (this.original_price && this.original_price > this.price) {
    return Math.round(((this.original_price - this.price) / this.original_price) * 100);
  }
  return 0;
});

// Virtual para precio formateado en CLP
productSchema.virtual('formatted_price').get(function() {
  return `$${this.price.toLocaleString('es-CL')} CLP`;
});

// Método para incrementar vistas
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Método estático para buscar por categoría
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, active: true });
};

// Método estático para buscar por ocasión
productSchema.statics.findByOccasion = function(occasion) {
  return this.find({ occasions: occasion, active: true });
};

// Método estático para búsqueda de texto
productSchema.statics.searchProducts = function(query) {
  return this.find(
    { 
      $text: { $search: query },
      active: true 
    },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Product', productSchema);
