// Configuración del servicio de carrito
const config = {
  port: process.env.PORT || 3005,
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
