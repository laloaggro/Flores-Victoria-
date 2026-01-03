const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');
const promotionRoutes = require('./routes');
const subscriptionRoutes = require('./src/routes/subscriptions');
const giftCardsRoutes = require('./src/routes/gift-cards');

const app = express();
const PORT = process.env.PROMOTION_SERVICE_PORT || 3019;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flores_victoria';

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
    timestamp: new Date().toISOString(),
  });
});

// Rutas
app.use('/api/promotions', promotionRoutes);
app.use('/api/promotions/subscriptions', subscriptionRoutes);
app.use('/api/gift-cards', giftCardsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎁 Promotion Service v3.3.0 running on port ${PORT}`);
  console.log(`📌 Gift Cards endpoint: /api/gift-cards`);
  console.log(`📌 Subscriptions endpoint: /api/promotions/subscriptions`);
});

module.exports = app;
// Railway rebuild trigger: 1767406049
