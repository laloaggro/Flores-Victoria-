const opentracing = require('opentracing');

const app = require('./app');
const config = require('./config');
const { db, connectToDatabase } = require('./config/database');
const { registerAudit, registerEvent } = require('./mcp-helper');

// Obtener tracer ya inicializado
const tracer = opentracing.globalTracer();
opentracing.initGlobalTracer(tracer);

// Inicializar base de datos y luego iniciar el servidor
connectToDatabase()
  .then(() => {
    console.log('Base de datos inicializada correctamente');

    // Iniciar el servidor después de conectar a la base de datos
    const server = app.listen(config.port, async () => {
      console.log(`Servicio de Autenticación corriendo en puerto ${config.port}`);
      await registerAudit(
        'start',
        'auth-service',
        `Servicio de Autenticación iniciado en puerto ${config.port}`
      );
    });

    // Manejo de errores no capturados
    process.on('uncaughtException', async (err) => {
      console.error('Error no capturado:', err);
      await registerEvent('uncaughtException', { error: err.message, stack: err.stack });
      server.close(async () => {
        console.log('Servidor cerrado debido a error no capturado');
        await registerAudit('shutdown', 'auth-service', 'Cierre por uncaughtException');
        process.exit(1);
      });
    });

    // Manejo de promesas rechazadas no capturadas
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Promesa rechazada no manejada en:', promise, 'razón:', reason);
      await registerEvent('unhandledRejection', { reason });
      server.close(async () => {
        console.log('Servidor cerrado debido a promesa rechazada');
        await registerAudit('shutdown', 'auth-service', 'Cierre por unhandledRejection');
        process.exit(1);
      });
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', async () => {
      console.log('SIGTERM recibida, cerrando servidor...');
      server.close(async () => {
        console.log('Proceso terminado por SIGTERM');
        await registerAudit('shutdown', 'auth-service', 'Cierre por SIGTERM');
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

    process.on('SIGINT', async () => {
      console.log('SIGINT recibida, cerrando servidor...');
      server.close(async () => {
        console.log('Proceso terminado por SIGINT');
        await registerAudit('shutdown', 'auth-service', 'Cierre por SIGINT');
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
