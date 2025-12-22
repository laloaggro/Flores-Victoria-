const { createLogger } = require('@flores-victoria/shared/logging/logger');
const app = require('./app');
const config = require('./config');
const redisClient = require('./config/redis');

const logger = createLogger('cart-service');

// Iniciar el servidor
const server = app.listen(config.port, () => {
  logger.info(`Servicio de Carrito corriendo en puerto ${config.port}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('Error no capturado:', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', { reason: reason.toString() });
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    redisClient.quit(() => {
      logger.info('Conexión a Redis cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    redisClient.quit(() => {
      logger.info('Conexión a Redis cerrada');
      process.exit(0);
    });
  });
});
