const express = require('express');

const sequelize = require('./config/database');
const config = require('./config/index');
const { router: userRoutes } = require('./routes/users');

const app = express();
const PORT = config.port;

// Middleware
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

// Conexión a la base de datos y arranque del servidor
console.log('Iniciando conexión a la base de datos...');
sequelize
  .connect()
  .then(async () => {
    // Inicializar base de datos después de conectar
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Servicio de usuarios ejecutándose en el puerto ${PORT}`);
      console.log(`Conectado a la base de datos: ${config.database.name}`);
    });

    // Manejo de señales de cierre
    process.on('SIGTERM', () => {
      console.log('Recibida señal SIGTERM. Cerrando servidor...');
      server.close(() => {
        sequelize.client.end(() => {
          console.log('Conexión a base de datos cerrada');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('Recibida señal SIGINT. Cerrando servidor...');
      server.close(() => {
        sequelize.client.end(() => {
          console.log('Conexión a base de datos cerrada');
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    console.error('Error E003: No se pudo conectar con la base de datos:', err.message);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  });

const client = require('prom-client');

// Crear registro de métricas
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Crear métricas personalizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Middleware para medir duración de solicitudes
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
      .observe(duration / 1000);
    httpRequestTotal
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
      .inc();
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
    // Importar el modelo de usuario
    const User = require('./models/User');
    const user = new User(sequelize.client);
    await user.createTable();
    console.log('Tabla de usuarios inicializada correctamente');
  } catch (error) {
    console.error('Error E004: Error inicializando base de datos:', error);
  }
};

// Inicializar base de datos
initializeDatabase();

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error E005: Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Error E006: Promesa rechazada no manejada:', reason);
  process.exit(1);
});
