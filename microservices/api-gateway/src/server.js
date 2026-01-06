const { createLogger } = require('@flores-victoria/shared/logging');
const { validateStartupSecrets } = require('@flores-victoria/shared/utils/secrets-validator');
const app = require('./app');

const logger = createLogger('api-gateway');
const PORT = process.env.PORT || 3000;

// ✅ VALIDACIÓN DE SECRETOS MEJORADA
logger.info('🔐 Validando secretos requeridos en startup...');
validateStartupSecrets({
  jwt: true,      // JWT_SECRET (obligatorio)
  valkey: false,   // VALKEY_URL (opcional)
});

// Iniciar servidor - Escuchar en '::' para soportar IPv4 e IPv6 (Railway private networking)
const server = app.listen(PORT, '::', () => {
  logger.info(`API Gateway corriendo en [::]${PORT}`);
});

// ═══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════

let isShuttingDown = false;
const SHUTDOWN_TIMEOUT = 30000; // 30 seconds

async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn(`Shutdown ya en progreso, ignorando ${signal}`);
    return;
  }
  
  isShuttingDown = true;
  logger.info(`Recibida señal ${signal}. Iniciando graceful shutdown...`);

  // Timeout de seguridad
  const forceShutdownTimer = setTimeout(() => {
    logger.error('Timeout de shutdown alcanzado. Forzando cierre...');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    // 1. Dejar de aceptar nuevas conexiones
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          logger.error('Error cerrando servidor HTTP:', { error: err.message });
          reject(err);
        } else {
          logger.info('✅ Servidor HTTP cerrado correctamente');
          resolve();
        }
      });
    });

    clearTimeout(forceShutdownTimer);
    logger.info('✅ Graceful shutdown completado');
    process.exit(0);
  } catch (error) {
    logger.error('Error durante shutdown:', { error: error.message });
    clearTimeout(forceShutdownTimer);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores globales
process.on('uncaughtException', (err) => {
  logger.error('Error no capturado:', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', { reason, promise });
});
