const app = require('./app');
const logger = require('./logger');
const config = require('./config');
const logger = require('./logger');
const redisClient = require('./config/redis');
const logger = require('./logger');
const { registerAudit, registerEvent } = require('./mcp-helper');
const logger = require('./logger');

// Iniciar el servidor
const server = app.listen(config.port, async () => {
  logger.info(`Servicio de Lista de Deseos corriendo en puerto ${config.port}`);
  await registerAudit('start', 'wishlist-service', {
    port: config.port,
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', async (err) => {
  logger.error('Error no capturado:', err);
  await registerEvent('uncaughtException', {
    service: 'wishlist-service',
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  await registerEvent('unhandledRejection', {
    service: 'wishlist-service',
    reason: reason.toString(),
  });
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM. Cerrando servidor...');
  await registerAudit('shutdown', 'wishlist-service', { reason: 'SIGTERM' });
  server.close(() => {
    redisClient.quit(() => {
      logger.info('Conexión a Redis cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  logger.info('Recibida señal SIGINT. Cerrando servidor...');
  await registerAudit('shutdown', 'wishlist-service', { reason: 'SIGINT' });
  server.close(() => {
    redisClient.quit(() => {
      logger.info('Conexión a Redis cerrada');
      process.exit(0);
    });
  });
});
