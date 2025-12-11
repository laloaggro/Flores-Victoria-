/**
 * Promotion Service - Versión simplificada
 * Build: 1.0.0
 * 
 * Servidor Express con conexión MongoDB no bloqueante
 * y rutas integradas desde routes.js
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const config = require('./config');
const logger = require('./logger.simple');

// Importar rutas desde archivo separado
const promotionRoutes = require('../routes');

const app = express();

// Middleware de seguridad y parseo
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simple de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check - debe responder siempre, incluso sin DB
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    service: 'promotion-service',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  res.json(health);
});

// Rutas de promociones
app.use('/api/promotions', promotionRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error en request:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor sin bloquear por MongoDB
const server = app.listen(config.port, () => {
  logger.info(`🎁 Promotion Service iniciado en puerto ${config.port}`);
  logger.info(`📝 Entorno: ${config.nodeEnv}`);
});

// Conexión MongoDB asíncrona (no bloqueante)
setTimeout(async () => {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('✅ MongoDB conectado correctamente');
  } catch (error) {
    logger.error('❌ Error al conectar MongoDB:', error.message);
    logger.warn('⚠️ Servicio continuará sin base de datos');
  }
}, 1000);

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  logger.info('⚠️ SIGTERM recibido, cerrando servidor...');
  
  server.close(async () => {
    logger.info('🔌 Servidor HTTP cerrado');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('🔌 Conexión MongoDB cerrada');
    }
    
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('⚠️ SIGINT recibido, cerrando servidor...');
  
  server.close(async () => {
    logger.info('🔌 Servidor HTTP cerrado');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('🔌 Conexión MongoDB cerrada');
    }
    
    process.exit(0);
  });
});

module.exports = app;
