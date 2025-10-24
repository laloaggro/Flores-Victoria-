const mongoose = require('mongoose');

// Schema para categorías de productos
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsqueda optimizada
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ active: 1 });

module.exports = mongoose.model('Category', categorySchema);