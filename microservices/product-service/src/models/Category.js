const mongoose = require('mongoose');

// Schema para categorías de productos
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsqueda optimizada
// Note: name y slug ya tienen índice único por 'unique: true'
categorySchema.index({ active: 1 });

module.exports = mongoose.model('Category', categorySchema);
