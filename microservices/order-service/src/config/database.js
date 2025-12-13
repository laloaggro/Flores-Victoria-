const mongoose = require('mongoose');
const logger = require('../logger');

const MONGODB_URI =
  process.env.ORDER_SERVICE_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://admin:eXQCjUiUlCPIR9DLu0us6PffXgmdTA9Q@mongodb:27017/order_db?authSource=admin';

logger.info('📡 Conectando a MongoDB para Order Service');

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('✅ Conexión a MongoDB establecida correctamente');
  })
  .catch((err) => {
    logger.error('❌ Error al conectar con MongoDB', { err });
  });

mongoose.connection.on('error', (err) => {
  logger.error('❌ Error inesperado en MongoDB', { err });
});

module.exports = mongoose.connection;
