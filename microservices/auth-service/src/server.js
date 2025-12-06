// REMOVIDO: const opentracing = require('opentracing'); - Causaba segfault
// Railway deployment: using nixpacks without Dockerfile

const { createLogger } = require('@flores-victoria/shared/logging/logger');

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

// Tracer DESHABILITADO: Causa segfault (exit 139) con jaeger-client
// El servicio funciona sin tracing distribuido
logger.info('Tracing distribuido deshabilitado (causa exit 139)');

// Inicializar base de datos y luego iniciar el servidor
logger.info('💾 Iniciando connectToDatabase()...');
connectToDatabase()
  .then(() => {
    logger.info('✅ Base de datos inicializada correctamente - entrando al then()');
    logger.info('==> INICIANDO SERVIDOR HTTP...');

    // Iniciar el servidor después de conectar a la base de datos
    logger.info('==> PASO 1: Iniciando servidor HTTP...');
    const server = app.listen(config.port, () => {
      logger.info(`==> PASO 2: Servidor escuchando en puerto ${config.port}`);
      logger.info(`✅ Servicio de Autenticación corriendo en puerto ${config.port}`);
      logger.info('==> PASO 3: Callback de listen() completado');
    });
    
    logger.info('==> PASO 4: Configurando manejadores de eventos del servidor...');

    // Manejar errores del servidor HTTP
    server.on('error', (err) => {
      logger.error('Error en el servidor HTTP:', { error: err.message, stack: err.stack });
      process.exit(1);
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
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT recibida, cerrando servidor...');
      server.close(async () => {
        logger.info('Proceso terminado por SIGINT');
        await registerAudit('shutdown', 'auth-service', 'Cierre por SIGINT');
        process.exit(0);
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
