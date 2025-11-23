const express = require('express');

const { createLogger } = require('../shared/logging/logger');
const { accessLog } = require('../shared/middleware/access-log');
const { withLogger } = require('../shared/middleware/request-id');

const database = require('./config/database');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const contactRoutes = require('./routes/contact');

// Crear aplicación Express
const app = express();

// Logger del servicio y wiring por request
const logger = createLogger('contact-service');

// Conectar a la base de datos
database
  .connectToDatabase()
  .then(() => {
    logger.info('Base de datos conectada correctamente', { service: 'contact-service' });
  })
  .catch((err) => {
    logger.error('Error conectando a la base de datos', { service: 'contact-service', err });
  });

// Aplicar middleware común optimizado
applyCommonMiddleware(app);
app.use(withLogger(logger));
app.use(accessLog(logger));

// Rutas
app.use('/api/contacts', contactRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Contacto - Arreglos Victoria',
    version: '1.0.0',
  });
});

// Configurar health checks mejorados
setupHealthChecks(app);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada',
  });
});

module.exports = app;
