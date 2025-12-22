const app = require('./app');
const logger = require('./logger.simple');
const config = require('./config');

const server = app.listen(config.port, () => {
  logger.info(`Servicio de Reseñas corriendo en puerto ${config.port}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM. Cerrando servidor...');
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
