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
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // límite de 50 solicitudes por ventana
  },
};

module.exports = config;
