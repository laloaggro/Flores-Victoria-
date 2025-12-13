const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { metricsMiddleware, metricsEndpoint } = require('../shared/metrics-simple');
const logger = require('./logger.simple');
const config = require('./config');

const app = express();
const SERVICE_NAME = 'admin-dashboard-service';

// Middlewares básicos
app.use(helmet({ contentSecurityPolicy: false })); // Allow inline scripts for dashboard
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'admin-dashboard-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Info endpoint
app.get('/api/admin', (req, res) => {
  res.json({
    message: 'Dashboard de Administración - Flores Victoria',
    version: '1.0.0',
    endpoints: [
      'GET /health - Health check del dashboard',
      'GET /api/admin - Información del servicio',
      'GET /api/dashboard/status - Estado del sistema',
    ],
  });
});

// Dashboard status (simplified)
app.get('/api/dashboard/status', (req, res) => {
  res.json({
    status: 'operational',
    service: 'admin-dashboard-service',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Servir dashboard HTML en la ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

// Métricas Prometheus
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada',
    path: req.path,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  logger.error('Error no manejado:', { error: err.message });
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Error interno del servidor',
  });
});

// Iniciar servidor
const PORT = config.port || 3012;
const HOST = '0.0.0.0'; // Railway requiere binding a 0.0.0.0
const server = app.listen(PORT, HOST, () => {
  logger.info(`✅ Admin Dashboard Service corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Basic dashboard routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/admin');
  logger.info('GET /api/dashboard/status');
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('❌ Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('🛑 Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;
