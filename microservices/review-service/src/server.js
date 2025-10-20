const app = require('./app');
const config = require('./config');
const { registerAudit, registerEvent } = require('./mcp-helper');

const server = app.listen(config.port, async () => {
  console.log(`Servicio de Reseñas corriendo en puerto ${config.port}`);
  await registerAudit('start', 'review-service', `Servicio de Reseñas iniciado en puerto ${config.port}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', async (err) => {
  console.error('Error no capturado:', err);
  await registerEvent('uncaughtException', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', async () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...');
  await registerAudit('shutdown', 'review-service', 'Servicio de Reseñas cerrado por SIGTERM');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});