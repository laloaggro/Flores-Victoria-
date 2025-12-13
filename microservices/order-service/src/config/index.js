// Configuración del servicio de pedidos
const config = {
  port: process.env.PORT || 3004,
  mongodb: {
    uri:
      process.env.ORDER_SERVICE_MONGODB_URI ||
      process.env.MONGODB_URI ||
      'mongodb://mongodb:27017/order_db?authSource=admin',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
  },
};

module.exports = config;
