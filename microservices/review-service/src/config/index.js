// Configuración del servicio de reseñas
const config = {
  port: process.env.PORT || 3006,
  database: {
    uri:
      process.env.REVIEW_SERVICE_MONGODB_URI ||
      process.env.MONGODB_URI ||
      `mongodb://${process.env.MONGO_USER || 'root'}:${process.env.MONGO_PASSWORD || 'changeme'}@${process.env.MONGO_HOST || 'mongodb'}:${process.env.MONGO_PORT || '27017'}/reviews_db?authSource=admin`,
    options: {},
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
