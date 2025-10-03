const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  resetToken: {
    type: String
  },
  resetTokenExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Agregar índices para mejorar el rendimiento de las consultas
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);