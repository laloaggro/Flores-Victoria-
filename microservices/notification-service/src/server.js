// Servidor principal del Notification Service
const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');
const { metricsMiddleware, metricsEndpoint } = require('./middlewares/metrics');
const notificationRoutes = require('./routes/notifications');

// Crear aplicación Express
const app = express();

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de métricas
app.use(metricsMiddleware);

// Rutas
app.use('/api/v1/notifications', notificationRoutes);

// Endpoint para métricas
app.get('/metrics', metricsEndpoint);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Notification Service - Flores Victoria',
    version: '1.0.0'
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      service: 'notification-service',
      timestamp: new Date().toISOString()
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
});

// Ruta para manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `No se puede encontrar ${req.originalUrl} en este servidor`
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Notification Service ejecutándose en el puerto ${PORT}`);
});

module.exports = app;