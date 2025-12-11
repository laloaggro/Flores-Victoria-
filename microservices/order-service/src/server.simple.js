require('dotenv').config();

const app = require('./app.simple');
const config = require('./config');
const logger = require('./logger');

logger.info('🚀 Iniciando Order Service v3.0...');

// Iniciar el servidor inmediatamente sin MongoDB
const server = app.listen(config.port, () => {
  logger.info(`✅ Servicio de Pedidos corriendo en puerto ${config.port}`);
  logger.info(`🌐 Health check disponible en /health`);
});

// Intentar conectar a MongoDB en segundo plano (no bloqueante)
setTimeout(async () => {
  try {
    logger.info('📡 Intentando conectar a MongoDB...');
    require('./config/database');
    const Order = require('./models/Order');
    await Order.createTables();
    logger.info('✅ MongoDB conectado correctamente');
  } catch (error) {
    logger.warn('⚠️  MongoDB no disponible:', error.message);
  }
}, 1000);

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
