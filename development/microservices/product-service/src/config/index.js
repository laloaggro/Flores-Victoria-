// Configuración del servicio de productos
require('dotenv').config();

const config = {
  port: process.env.PRODUCT_SERVICE_PORT || process.env.PORT || 3002,
  database: {
    uri:
      process.env.PRODUCT_SERVICE_MONGODB_URI ||
      'mongodb://root:rootpassword@mongodb:27017/products_db?authSource=admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos (configurable)
    max: process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? 100 : 1000), // Desarrollo: 1000, Producción: 100
  },
};

module.exports = config;
