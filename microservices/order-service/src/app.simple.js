const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./logger');
const config = require('./config');

const app = express();

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simple
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'order-service' });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Order Service - Arreglos Victoria',
    version: '3.0.0-simple',
    endpoints: ['/health', '/'],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor',
  });
});

module.exports = app;
