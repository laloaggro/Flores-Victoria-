const app = require('./app');
const config = require('./config');
const logger = require('./logger.simple');

// Iniciar el servidor
const server = app.listen(config.port, () => {
  logger.info(`Servicio de Contacto corriendo en puerto ${config.port}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
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
