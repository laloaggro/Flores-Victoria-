const {
  logger: { createLogger },
} = require('@flores-victoria/shared');
const app = require('./app');
const { registerAudit, registerEvent } = require('./mcp-helper');

const logger = createLogger('api-gateway');
const PORT = process.env.PORT || 3000;

// ✅ VALIDACIÓN DE SEGURIDAD: JWT_SECRET debe estar configurado
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET === 'your_jwt_secret_key' ||
  process.env.JWT_SECRET === 'my_secret_key'
) {
  logger.error('CRITICAL: JWT_SECRET no está configurado o tiene un valor inseguro');
  logger.error('Por favor configura JWT_SECRET en .env con un valor aleatorio seguro');
  logger.error('Genera uno con: openssl rand -base64 32');
  process.exit(1);
}

logger.info('JWT_SECRET validado correctamente');

// Iniciar servidor
app.listen(PORT, async () => {
  logger.info(`API Gateway corriendo en puerto ${PORT}`);
  // Auditoría MCP: inicio de servicio
  await registerAudit('start', 'api-gateway', `API Gateway iniciado en puerto ${PORT}`);
});

// Manejo de errores globales
process.on('uncaughtException', async (err) => {
  logger.error('Error no capturado:', { error: err.message, stack: err.stack });
  // Registrar evento MCP
  await registerEvent('uncaughtException', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM. Cerrando servidor...');
  // Auditoría MCP: cierre de servicio
  await registerAudit('shutdown', 'api-gateway', 'API Gateway cerrado por SIGTERM');
  process.exit(0);
});
