// Configuración del servicio de usuarios
const config = {
  port: process.env.USER_SERVICE_PORT || 3003,
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'flores_db',
    user: process.env.DB_USER || 'flores_user',
    password: process.env.DB_PASSWORD || 'flores_password',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'my_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
  },
};

module.exports = config;
