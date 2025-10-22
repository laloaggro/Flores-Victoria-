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
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
  },
};

module.exports = config;
