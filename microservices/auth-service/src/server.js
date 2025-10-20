const app = require('./app');
const config = require('./config');
const { db, connectToDatabase } = require('./config/database');
const opentracing = require('opentracing');

// Obtener tracer ya inicializado
const tracer = opentracing.globalTracer();
opentracing.initGlobalTracer(tracer);

// Inicializar base de datos y luego iniciar el servidor
connectToDatabase()
  .then(() => {
    console.log('Base de datos inicializada correctamente');
    
    // Iniciar el servidor después de conectar a la base de datos
    const server = app.listen(config.port, () => {
      console.log(`Servicio de Autenticación corriendo en puerto ${config.port}`);
    });

    // Manejo de errores no capturados
    process.on('uncaughtException', (err) => {
      console.error('Error no capturado:', err);
      server.close(() => {
        console.log('Servidor cerrado debido a error no capturado');
        process.exit(1);
      });
    });

    // Manejo de promesas rechazadas no capturadas
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Promesa rechazada no manejada en:', promise, 'razón:', reason);
      server.close(() => {
        console.log('Servidor cerrado debido a promesa rechazada');
        process.exit(1);
      });
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      console.log('SIGTERM recibida, cerrando servidor...');
      server.close(() => {
        console.log('Proceso terminado por SIGTERM');
        // Cerrar tracer antes de salir
        if (tracer && typeof tracer.close === 'function') {
          tracer.close(() => {
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT recibida, cerrando servidor...');
      server.close(() => {
        console.log('Proceso terminado por SIGINT');
        // Cerrar tracer antes de salir
        if (tracer && typeof tracer.close === 'function') {
          tracer.close(() => {
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    });
  })
  .catch((error) => {
    console.error('Error inicializando base de datos:', error);
    process.exit(1);
  });