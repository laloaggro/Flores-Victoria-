const app = require('./app');
const config = require('./config');
const { connectToDatabase, closeDatabase } = require('./config/database');

// Función para iniciar el servidor
const startServer = async () => {
  let server;
  
  try {
    // Inicializar base de datos
    console.log('Intentando conectar a la base de datos...');
    await connectToDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    
    // Iniciar el servidor después de conectar a la base de datos
    server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`✅ Servicio de Autenticación corriendo en puerto ${config.port}`);
    });

    // Manejo de errores no capturados
    process.on('uncaughtException', async (err) => {
      console.error('❌ Error no capturado:', err);
      try {
        await closeDatabase();
        console.log('Base de datos cerrada por uncaughtException');
      } catch (dbErr) {
        console.error('Error cerrando base de datos:', dbErr);
      }
      
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      try {
        await closeDatabase();
        console.log('Base de datos cerrada por unhandledRejection');
      } catch (dbErr) {
        console.error('Error cerrando base de datos:', dbErr);
      }
      
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    // Manejo de señales de cierre
    const shutdown = async () => {
      console.log('Iniciando cierre del servidor...');
      try {
        // Cerrar base de datos primero
        await closeDatabase();
        
        if (server) {
          server.close(() => {
            console.log('Servidor cerrado correctamente');
            process.exit(0);
          });
          
          // Forzar cierre si no se cierra en 5 segundos
          setTimeout(() => {
            console.log('Forzando cierre del servidor');
            process.exit(0);
          }, 5000);
        } else {
          process.exit(0);
        }
      } catch (error) {
        console.error('Error durante el cierre:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    console.error('Detalles del error:', JSON.stringify(error, null, 2));
    
    // Esperar un poco antes de salir para permitir que el sistema de logging registre el error
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

// Iniciar el servidor
startServer();