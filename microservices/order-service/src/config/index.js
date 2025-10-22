// Configuración del servicio de pedidos
const config = {
  port: process.env.PORT || 3004,
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'flores_db',
    user: process.env.DB_USER || 'flores_user',
    password: process.env.DB_PASSWORD || 'flores_password',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
  },
};

module.exports = config;
