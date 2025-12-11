require('dotenv').config();

const app = require('./app.simple');
const config = require('./config');
require('./config/database'); // Conectar a MongoDB
const Order = require('./models/Order');
const logger = require('./logger');

// Inicializar colecciones e índices si no existen
const initializeDatabase = async () => {
  try {
    await Order.createTables(); // Método compatible que no hace nada en MongoDB
    logger.info('Base de datos MongoDB inicializada correctamente');
  } catch (error) {
    logger.error('Error inicializando base de datos:', error.message);
  }
};

// Inicializar base de datos
initializeDatabase();

// Iniciar el servidor
const server = app.listen(config.port, () => {
  logger.info(`✅ Servicio de Pedidos corriendo en puerto ${config.port}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('❌ Error no capturado:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Promesa rechazada no manejada:', String(reason));
  process.exit(1);
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('🛑 Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});
