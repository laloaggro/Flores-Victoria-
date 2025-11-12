const { createLogger } = require('../shared/logging/logger');

const app = require('./app');
const config = require('./config');
const db = require('./config/database');
const { registerAudit, registerEvent } = require('./mcp-helper');
const Order = require('./models/Order');

const logger = createLogger('order-service');

// Crear tablas si no existen
const initializeDatabase = async () => {
  try {
    const order = new Order(db);
    await order.createTables();
    logger.info('Tablas de pedidos inicializadas correctamente');
  } catch (error) {
    logger.error('Error inicializando base de datos:', {
      error: error.message,
      stack: error.stack,
    });
  }
};

// Inicializar base de datos
initializeDatabase();

// Iniciar el servidor
const server = app.listen(config.port, async () => {
  logger.info(`Servicio de Pedidos corriendo en puerto ${config.port}`);
  await registerAudit('start', 'order-service', {
    port: config.port,
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', async (err) => {
  logger.error('Error no capturado:', { error: err.message, stack: err.stack });
  await registerEvent('uncaughtException', {
    service: 'order-service',
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', async (reason, _promise) => {
  logger.error('Promesa rechazada no manejada:', { reason: String(reason) });
  await registerEvent('unhandledRejection', {
    service: 'order-service',
    reason: reason.toString(),
  });
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM. Cerrando servidor...');
  await registerAudit('shutdown', 'order-service', { reason: 'SIGTERM' });
  server.close(() => {
    db.end(() => {
      logger.info('Conexión a base de datos cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  logger.info('Recibida señal SIGINT. Cerrando servidor...');
  await registerAudit('shutdown', 'order-service', { reason: 'SIGINT' });
  server.close(() => {
    db.end(() => {
      logger.info('Conexión a base de datos cerrada');
      process.exit(0);
    });
  });
});
