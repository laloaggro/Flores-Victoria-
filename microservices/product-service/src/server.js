const app = require('./app');
const config = require('./config');

// Variable para almacenar el servidor
let server;

// Iniciar el servidor
const startServer = () => {
  server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`Servicio de Productos corriendo en puerto ${config.port}`);
  });
};

startServer();

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado debido a error no capturado');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado debido a promesa rechazada');
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