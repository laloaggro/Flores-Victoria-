// REMOVIDO: const opentracing = require('opentracing'); - Causaba segfault
// Railway deployment: using nixpacks without Dockerfile

const { createLogger } = require('@flores-victoria/shared/logging/logger');
const { validateStartupSecrets } = require('@flores-victoria/shared/utils/secrets-validator');
const app = require('./app');
const config = require('./config');
const { connectToDatabase } = require('./config/database');

const logger = createLogger('auth-service');

// ✅ VALIDACIÓN DE SECRETOS MEJORADA
logger.info('🔐 Validando secretos requeridos en startup...');
validateStartupSecrets({
  jwt: true,           // JWT_SECRET (obligatorio)
  database: true,      // DATABASE_URL (obligatorio para auth-service)
  encryption: false,   // ENCRYPTION_KEY (opcional)
});

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
    // Escuchar en '::' para soportar IPv4 e IPv6 (requerido para Railway private networking)
    logger.info('==> PASO 1: Iniciando servidor HTTP...');
    const server = app.listen(config.port, '::', () => {
      logger.info(`==> PASO 2: Servidor escuchando en [::]${config.port}`);
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
    process.on('uncaughtException', (err) => {
      logger.error('Error no capturado:', { error: err.message, stack: err.stack });
      server.close(() => {
        logger.info('Servidor cerrado debido a error no capturado');
        process.exit(1);
      });
    });

    // Manejo de promesas rechazadas no capturadas
    process.on('unhandledRejection', (reason) => {
      logger.error('Promesa rechazada no manejada:', { reason: String(reason) });
      server.close(() => {
        logger.info('Servidor cerrado debido a promesa rechazada');
        process.exit(1);
      });
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      logger.info('SIGTERM recibida, cerrando servidor...');
      server.close(() => {
        logger.info('Proceso terminado por SIGTERM');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT recibida, cerrando servidor...');
      server.close(() => {
        logger.info('Proceso terminado por SIGINT');
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
