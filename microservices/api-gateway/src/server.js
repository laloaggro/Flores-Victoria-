const app = require('./app');
const PORT = process.env.PORT || 3000;
const client = require('prom-client');

// Configurar Prometheus
client.collectDefaultMetrics({ register: client.register });

// Endpoint para métricas
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error al generar métricas:', error);
    res.status(500).end();
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API Gateway corriendo en puerto ${PORT}`);
});

// Manejo de errores globales
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...');
  process.exit(0);
});