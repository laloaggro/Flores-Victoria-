const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');
const promotionRoutes = require('./routes');
const subscriptionRoutes = require('./src/routes/subscriptions');
const giftCardsRoutes = require('./src/routes/gift-cards');

const app = express();
// Railway usa PORT, desarrollo usa PROMOTION_SERVICE_PORT
const PORT = process.env.PORT || process.env.PROMOTION_SERVICE_PORT || 3019;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flores_victoria';

console.log('🚀 Iniciando Promotion Service v3.3.0...');
console.log(`📦 Puerto: ${PORT}`);
console.log(`🔗 MongoDB: ${MONGODB_URI.substring(0, 30)}...`);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Conectar a MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Promotion Service connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'promotion-service',
    version: '3.3.0',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Rutas principales
app.use('/api/promotions', promotionRoutes);

// Rutas de suscripciones
app.use('/api/promotions/subscriptions', subscriptionRoutes);

// Rutas de Gift Cards
console.log('🎁 Registrando rutas de Gift Cards...');
app.use('/api/gift-cards', giftCardsRoutes);
console.log('✅ Rutas de Gift Cards registradas en /api/gift-cards');

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    service: 'promotion-service',
    version: '3.3.0',
    routes: [
      '/api/promotions',
      '/api/promotions/subscriptions/*',
      '/api/gift-cards/*'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🎁 Promotion Service running on port ${PORT}`);
});

module.exports = app;
