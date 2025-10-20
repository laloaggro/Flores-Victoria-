const app = require('./app');
const config = require('./config');
const db = require('./config/database');
const Order = require('./models/Order');
const { registerAudit, registerEvent } = require('./mcp-helper');

// Crear tablas si no existen
const initializeDatabase = async () => {
  try {
    const order = new Order(db);
    await order.createTables();
    console.log('Tablas de pedidos inicializadas correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  }
};

// Inicializar base de datos
initializeDatabase();

// Iniciar el servidor
const server = app.listen(config.port, async () => {
  console.log(`Servicio de Pedidos corriendo en puerto ${config.port}`);
  await registerAudit('start', 'order-service', {
    port: config.port,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', async (err) => {
  console.error('Error no capturado:', err);
  await registerEvent('uncaughtException', {
    service: 'order-service',
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  await registerEvent('unhandledRejection', {
    service: 'order-service',
    reason: reason.toString()
  });
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', async () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...');
  await registerAudit('shutdown', 'order-service', { reason: 'SIGTERM' });
  server.close(() => {
    db.end(() => {
      console.log('Conexión a base de datos cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('Recibida señal SIGINT. Cerrando servidor...');
  await registerAudit('shutdown', 'order-service', { reason: 'SIGINT' });
  server.close(() => {
    db.end(() => {
      console.log('Conexión a base de datos cerrada');
      process.exit(0);
    });
  });
});