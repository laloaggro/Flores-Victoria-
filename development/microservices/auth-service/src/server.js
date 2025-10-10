const app = require('./app');
const config = require('./config');
const { connectToDatabase } = require('./config/database');

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Inicializar base de datos
    await connectToDatabase();
    console.log('Base de datos inicializada correctamente');
    
    // Iniciar el servidor después de conectar a la base de datos
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`Servicio de Autenticación corriendo en puerto ${config.port}`);
    });

    // Manejo de errores no capturados
    process.on('uncaughtException', (err) => {
      console.error('Error no capturado:', err);
      // No cerrar el proceso inmediatamente para permitir el reinicio controlado
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Promesa rechazada no manejada:', reason);
      // No cerrar el proceso inmediatamente para permitir el reinicio controlado
    });

    // Manejo de señales de cierre
    process.on('SIGTERM', () => {
      console.log('Recibida señal SIGTERM. Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('Recibida señal SIGINT. Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    // Esperar un poco antes de salir para permitir que el sistema de logging registre el error
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

// Iniciar el servidor
startServer();