const express = require('express');

const database = require('./config/database');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const contactRoutes = require('./routes/contact');

// Crear aplicación Express
const app = express();

// Conectar a la base de datos
database
  .connectToDatabase()
  .then(() => {
    console.log('Base de datos conectada correctamente');
  })
  .catch((err) => {
    console.error('Error conectando a la base de datos:', err);
  });

// Aplicar middleware común optimizado
applyCommonMiddleware(app);

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
