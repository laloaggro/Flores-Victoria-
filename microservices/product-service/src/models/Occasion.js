const mongoose = require('mongoose');

// Schema para ocasiones especiales
const occasionSchema = new mongoose.Schema({
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
occasionSchema.index({ name: 1 });
occasionSchema.index({ slug: 1 });
occasionSchema.index({ active: 1 });

module.exports = mongoose.model('Occasion', occasionSchema);