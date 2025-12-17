// app.simple.js - Express app sin dependencias de shared
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const logger = require('./logger.simple');

const app = express();

// Conectar a MongoDB (non-blocking)
const MONGODB_URI =
  process.env.PRODUCT_SERVICE_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://mongodb:27017/flores-victoria';

setTimeout(() => {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      logger.info('🔗 Conectado a MongoDB');
    })
    .catch((error) => {
      logger.warn('⚠️ MongoDB no disponible:', error.message);
    });
}, 1000);

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'healthy',
    service: 'product-service',
    port: process.env.PORT || 8080,
    mongodb: mongoStatus,
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Product Service - Arreglos Victoria',
    version: '3.0.0-simple',
    endpoints: ['/health', '/api/products', '/debug/routes'],
  });
});

// Debug: ver rutas registradas
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === 'router') {
      const routerPath = middleware.regexp.source
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/');
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: routerPath + handler.route.path,
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });
  res.json({
    totalRoutes: routes.length,
    routes,
    timestamp: new Date().toISOString(),
  });
});

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Rutas de productos (versión simplificada)
try {
  const productRoutes = require('./routes/products.simple');
  app.use('/api/products', productRoutes);
  logger.info('✅ Product routes loaded');
} catch (error) {
  logger.error('❌ Error loading product routes:', error.message);
  logger.error('Stack:', error.stack);
}

// Error handling
app.use((err, req, res, next) => {
  logger.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
