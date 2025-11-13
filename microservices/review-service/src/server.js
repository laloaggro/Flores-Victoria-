const app = require('./app');
const logger = require('./logger');
const config = require('./config');
const { registerAudit, registerEvent } = require('./mcp-helper');

const server = app.listen(config.port, async () => {
  logger.info(`Servicio de Reseñas corriendo en puerto ${config.port}`);
  await registerAudit(
    'start',
    'review-service',
    `Servicio de Reseñas iniciado en puerto ${config.port}`
  );
});

// Manejo de errores no capturados
process.on('uncaughtException', async (err) => {
  logger.error('Error no capturado:', err);
  await registerEvent('uncaughtException', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM. Cerrando servidor...');
  await registerAudit('shutdown', 'review-service', 'Servicio de Reseñas cerrado por SIGTERM');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});
