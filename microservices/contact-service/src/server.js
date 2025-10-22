const app = require('./app');
const config = require('./config');
const { registerAudit, registerEvent } = require('./mcp-helper');

// Iniciar el servidor
const server = app.listen(config.port, async () => {
  console.log(`Servicio de Contacto corriendo en puerto ${config.port}`);
  await registerAudit('start', 'contact-service', {
    port: config.port,
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', async (err) => {
  console.error('Error no capturado:', err);
  await registerEvent('uncaughtException', {
    service: 'contact-service',
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  await registerEvent('unhandledRejection', {
    service: 'contact-service',
    reason: reason.toString(),
  });
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...');
  await registerAudit('shutdown', 'contact-service', { reason: 'SIGTERM' });
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('Recibida señal SIGINT. Cerrando servidor...');
  await registerAudit('shutdown', 'contact-service', { reason: 'SIGINT' });
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});
