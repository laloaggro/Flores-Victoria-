// Configuración del servicio de autenticación
require('dotenv').config();

const config = {
  port: process.env.AUTH_SERVICE_PORT || process.env.PORT || 3001,
  database: {
    path: process.env.AUTH_DB_PATH || './db/auth.db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'my_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos (configurable)
    max: process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? 50 : 1000), // Desarrollo: 1000, Producción: 50
  },
};

module.exports = config;
