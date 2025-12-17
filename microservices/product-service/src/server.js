require('dotenv').config();

// Initialize Sentry FIRST (before any other imports)

const { createLogger } = require('@flores-victoria/shared/logging/logger');
const app = require('./app');
const config = require('./config');
const { captureException } = require('./config/sentry');
// const { registerAudit, registerEvent } = require('./mcp-helper');

const logger = createLogger('product-service');
let server;

const startServer = async () => {
  server = app.listen(config.port, '0.0.0.0', async () => {
    logger.info(`Servicio de Productos corriendo en puerto ${config.port}`);
    // MCP audit disabled temporarily (causes crashes)
    // await registerAudit(
    //   'start',
    //   'product-service',
    //   `Servicio de Productos iniciado en puerto ${config.port}`
    // );
  });
};

startServer();

process.on('uncaughtException', async (err) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
  });
  logger.error('Error no capturado:', { error: err.message, stack: err.stack });

  // Send to Sentry
  captureException(err, {
    tags: { type: 'uncaughtException' },
    level: 'fatal',
  });

  // Don't exit in development - just log the error
  if (process.env.NODE_ENV === 'production') {
    if (server) {
      server.close(() => {
        logger.info('Servidor cerrado debido a error no capturado');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
});

process.on('unhandledRejection', async (reason) => {
  console.error('🚨 UNHANDLED REJECTION:', {
    reason,
    type: typeof reason,
    string: String(reason),
  });
  logger.error('Promesa rechazada no manejada:', { reason: String(reason) });

  // Send to Sentry
  captureException(new Error(`Unhandled Rejection: ${reason}`), {
    tags: { type: 'unhandledRejection' },
    level: 'error',
    extra: { reason },
  });

  // Don't exit in development - just log the error
  if (process.env.NODE_ENV === 'production') {
    if (server) {
      server.close(() => {
        logger.info('Servidor cerrado debido a promesa rechazada');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
});

// Manejo de señales de cierre
const shutdown = () => {
  logger.info('Apagando servidor...');
  if (server) {
    server.close(() => {
      logger.info('Servidor cerrado correctamente');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
