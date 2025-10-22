// Configuración del servicio de reseñas
const config = {
  port: process.env.PORT || 3007,
  database: {
    uri:
      process.env.REVIEW_SERVICE_MONGODB_URI ||
      'mongodb://root:rootpassword@mongodb:27017/reviews_db?authSource=admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos (configurable)
    max: process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? 100 : 1000), // Desarrollo: 1000, Producción: 100
  },
};

module.exports = config;
