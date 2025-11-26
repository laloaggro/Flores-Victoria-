const { createLogger } = require('@flores-victoria/shared/logging/logger');

const app = require('./app');
const config = require('./config');
const redisClient = require('./config/redis');
const { registerAudit, registerEvent } = require('./mcp-helper');

const logger = createLogger('cart-service');

// Iniciar el servidor
const server = app.listen(config.port, async () => {
  logger.info(`Servicio de Carrito corriendo en puerto ${config.port}`);
  await registerAudit('start', 'cart-service', {
    port: config.port,
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', async (err) => {
  logger.error('Error no capturado:', { error: err.message, stack: err.stack });
  await registerEvent('uncaughtException', {
    service: 'cart-service',
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  logger.error('Promesa rechazada no manejada:', { reason: reason.toString() });
  await registerEvent('unhandledRejection', {
    service: 'cart-service',
    reason: reason.toString(),
  });
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM. Cerrando servidor...');
  await registerAudit('shutdown', 'cart-service', { reason: 'SIGTERM' });
  server.close(() => {
    redisClient.quit(() => {
      logger.info('Conexión a Redis cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  logger.info('Recibida señal SIGINT. Cerrando servidor...');
  await registerAudit('shutdown', 'cart-service', { reason: 'SIGINT' });
  server.close(() => {
    redisClient.quit(() => {
      logger.info('Conexión a Redis cerrada');
      process.exit(0);
    });
  });
});
