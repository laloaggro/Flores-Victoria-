// Configuración del servicio de lista de deseos
const config = {
  port: process.env.PORT || 3005,
  valkey: {
    url: process.env.VALKEY_URL,
    host: process.env.VALKEY_HOST || 'valkey',
    port: process.env.VALKEY_PORT || 6379,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
  },
};

module.exports = config;
