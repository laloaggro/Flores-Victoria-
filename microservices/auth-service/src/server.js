const app = require('./app');
const config = require('./config');
const { db, connectToDatabase } = require('./config/database');
const User = require('./models/User');

// Inicializar base de datos
connectToDatabase()
  .then(() => {
    console.log('Base de datos inicializada correctamente');
  })
  .catch((error) => {
    console.error('Error inicializando base de datos:', error);
  });

// Iniciar el servidor
const server = app.listen(config.port, () => {
  console.log(`Servicio de Autenticación corriendo en puerto ${config.port}`);
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
    db.close(() => {
      console.log('Conexión a base de datos cerrada');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    db.close(() => {
      console.log('Conexión a base de datos cerrada');
      process.exit(0);
    });
  });
});