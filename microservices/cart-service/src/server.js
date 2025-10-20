const app = require('./app');
const config = require('./config');
const redisClient = require('./config/redis');
const { registerAudit, registerEvent } = require('./mcp-helper');

// Iniciar el servidor
const server = app.listen(config.port, async () => {
  console.log(`Servicio de Carrito corriendo en puerto ${config.port}`);
  await registerAudit('start', 'cart-service', {
    port: config.port,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', async (err) => {
  console.error('Error no capturado:', err);
  await registerEvent('uncaughtException', {
    service: 'cart-service',
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  await registerEvent('unhandledRejection', {
    service: 'cart-service',
    reason: reason.toString()
  });
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...');
  await registerAudit('shutdown', 'cart-service', { reason: 'SIGTERM' });
  server.close(() => {
    redisClient.quit(() => {
      console.log('Conexión a Redis cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('Recibida señal SIGINT. Cerrando servidor...');
  await registerAudit('shutdown', 'cart-service', { reason: 'SIGINT' });
  server.close(() => {
    redisClient.quit(() => {
      console.log('Conexión a Redis cerrada');
      process.exit(0);
    });
  });
});