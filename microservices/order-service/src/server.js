const app = require('./app');
const config = require('./config');
const db = require('./config/database');
const Order = require('./models/Order');
const client = require('prom-client');

// Configurar Prometheus
client.collectDefaultMetrics({ register: client.register });

// Endpoint para métricas
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error al generar métricas:', error);
    res.status(500).end();
  }
});

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
const server = app.listen(config.port, () => {
  console.log(`Servicio de Pedidos corriendo en puerto ${config.port}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    db.end(() => {
      console.log('Conexión a base de datos cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    db.end(() => {
      console.log('Conexión a base de datos cerrada');
      process.exit(0);
    });
  });
});