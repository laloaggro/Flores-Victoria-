const app = require('./app');
const config = require('./config');
const db = require('./config/database');
const User = require('./models/User');
const client = require('prom-client');

// Crear registro de métricas
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Crear métricas personalizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware para medir duración de solicitudes
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).observe(duration / 1000);
    httpRequestTotal.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).inc();
  });
  
  next();
});

// Endpoint para exponer métricas
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Crear tabla de usuarios si no existe
const initializeDatabase = async () => {
  try {
    const user = new User(db);
    await user.createTable();
    console.log('Tabla de usuarios inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  }
};

// Inicializar base de datos
initializeDatabase();

// Iniciar el servidor
const server = app.listen(config.port, () => {
  console.log(`Servicio de Usuarios corriendo en puerto ${config.port}`);
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