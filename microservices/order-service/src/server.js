require('dotenv').config();

const app = require('./app.simple');
const config = require('./config');
require('./config/database'); // Conectar a MongoDB
const Order = require('./models/Order');
const logger = require('./logger');

// Funciones stub para eventos y auditoría (futura integración con servicio de eventos)
const registerEvent = async (eventType, data) => {
  logger.debug(`Event: ${eventType}`, data);
};

const registerAudit = async (action, service, data) => {
  logger.debug(`Audit: ${action} - ${service}`, data);
};

// Placeholder para conexión de base de datos (MongoDB usa mongoose internamente)
const db = {
  end: (callback) => {
    logger.info('Cerrando conexiones...');
    if (callback) callback();
  },
};

// Inicializar colecciones e índices si no existen
const initializeDatabase = async () => {
  try {
    await Order.createTables(); // Método compatible que no hace nada en MongoDB
    logger.info('Base de datos MongoDB inicializada correctamente');
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
const server = app.listen(config.port, () => {
  logger.info(`Servicio de Pedidos corriendo en puerto ${config.port}`);
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
