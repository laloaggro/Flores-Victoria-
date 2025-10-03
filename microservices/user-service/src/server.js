const app = require('./app');
const config = require('./config');
const db = require('./config/database');
const User = require('./models/User');

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