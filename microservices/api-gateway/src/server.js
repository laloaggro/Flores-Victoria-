const app = require('./app');
const PORT = process.env.PORT || 3000;
const { registerAudit, registerEvent } = require('./mcp-helper');

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`API Gateway corriendo en puerto ${PORT}`);
  // Auditoría MCP: inicio de servicio
  await registerAudit('start', 'api-gateway', `API Gateway iniciado en puerto ${PORT}`);
});

// Manejo de errores globales
process.on('uncaughtException', async (err) => {
  console.error('Error no capturado:', err);
  // Registrar evento MCP
  await registerEvent('uncaughtException', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...');
  // Auditoría MCP: cierre de servicio
  await registerAudit('shutdown', 'api-gateway', 'API Gateway cerrado por SIGTERM');
  process.exit(0);
});
