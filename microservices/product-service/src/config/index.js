// Configuración del servicio de productos
const config = {
  port: parseInt(process.env.PORT, 10) || 3009,
  database: {
    uri:
      process.env.PRODUCT_SERVICE_MONGODB_URI ||
      'mongodb://root:rootpassword@mongodb:27017/products_db?authSource=admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
  },
};

module.exports = config;
