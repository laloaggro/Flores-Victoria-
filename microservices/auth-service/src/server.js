const opentracing = require('opentracing');

const { createLogger } = require('../../../shared/logging/logger');

const app = require('./app');
const config = require('./config');
const { connectToDatabase } = require('./config/database');
const { registerAudit, registerEvent } = require('./mcp-helper');

const logger = createLogger('auth-service');

// ✅ VALIDACIÓN DE SEGURIDAD: JWT_SECRET debe estar configurado
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET === 'your_jwt_secret_key' ||
  process.env.JWT_SECRET === 'my_secret_key' ||
  process.env.JWT_SECRET === 'secreto_por_defecto' ||
  process.env.JWT_SECRET === 'default_secret'
) {
  logger.error('CRITICAL: JWT_SECRET no está configurado o tiene un valor inseguro');
  logger.error('Por favor configura JWT_SECRET en .env con un valor aleatorio seguro');
  logger.error('Genera uno con: openssl rand -base64 32');
  process.exit(1);
}

logger.info('JWT_SECRET validado correctamente en auth-service');

// Obtener tracer ya inicializado
const tracer = opentracing.globalTracer();
opentracing.initGlobalTracer(tracer);

// Inicializar base de datos y luego iniciar el servidor
connectToDatabase()
  .then(() => {
    logger.info('Base de datos inicializada correctamente');

    // Iniciar el servidor después de conectar a la base de datos
    const server = app.listen(config.port, async () => {
      logger.info(`Servicio de Autenticación corriendo en puerto ${config.port}`);
      await registerAudit(
        'start',
        'auth-service',
        `Servicio de Autenticación iniciado en puerto ${config.port}`
      );
    });

    // Manejo de errores no capturados
    process.on('uncaughtException', async (err) => {
      logger.error('Error no capturado:', { error: err.message, stack: err.stack });
      await registerEvent('uncaughtException', { error: err.message, stack: err.stack });
      server.close(async () => {
        logger.info('Servidor cerrado debido a error no capturado');
        await registerAudit('shutdown', 'auth-service', 'Cierre por uncaughtException');
        process.exit(1);
      });
    });

    // Manejo de promesas rechazadas no capturadas
    process.on('unhandledRejection', async (reason) => {
      logger.error('Promesa rechazada no manejada:', { reason: String(reason) });
      await registerEvent('unhandledRejection', { reason });
      server.close(async () => {
        logger.info('Servidor cerrado debido a promesa rechazada');
        await registerAudit('shutdown', 'auth-service', 'Cierre por unhandledRejection');
        process.exit(1);
      });
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM recibida, cerrando servidor...');
      server.close(async () => {
        logger.info('Proceso terminado por SIGTERM');
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
      logger.info('SIGINT recibida, cerrando servidor...');
      server.close(async () => {
        logger.info('Proceso terminado por SIGINT');
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
    logger.error('Error inicializando base de datos:', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
