
const app = require('./app');
const config = require('./config');
const { registerAudit, registerEvent } = require('../../../shared/mcp-helper');

let server;

const startServer = async () => {
  server = app.listen(config.port, '0.0.0.0', async () => {
    console.log(`Servicio de Productos corriendo en puerto ${config.port}`);
    await registerAudit('start', 'product-service', `Servicio de Productos iniciado en puerto ${config.port}`);
  });
};

startServer();

process.on('uncaughtException', async (err) => {
  console.error('Error no capturado:', err);
  await registerEvent('uncaughtException', { error: err.message, stack: err.stack });
  if (server) {
    server.close(async () => {
      console.log('Servidor cerrado debido a error no capturado');
      await registerAudit('shutdown', 'product-service', 'Cierre por uncaughtException');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  await registerEvent('unhandledRejection', { reason });
  if (server) {
    server.close(async () => {
      console.log('Servidor cerrado debido a promesa rechazada');
      await registerAudit('shutdown', 'product-service', 'Cierre por unhandledRejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Manejo de señales de cierre
const shutdown = () => {
  console.log('Apagando servidor...');
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado correctamente');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);