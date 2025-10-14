const app = require('./app');
const config = require('./config');

// Iniciar el servidor
// Asegurarse de que siempre escuchamos en 0.0.0.0 independientemente de las variables de entorno
const PORT = parseInt(config.port, 10); // Asegurarse de que el puerto sea un número
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio de Reseñas corriendo en puerto ${PORT}`);
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
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});