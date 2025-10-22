const express = require('express');

const { connectToDatabase } = require('./config/database');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const { router, setDatabase } = require('./routes/reviews');

const app = express();

// Aplicar middleware común optimizado
applyCommonMiddleware(app);

// Conectar a la base de datos
connectToDatabase()
  .then((db) => {
    setDatabase(db);
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  });

// Rutas
app.use('/api/reviews', router);

// Ruta de health check
// Configurar health checks mejorados
setupHealthChecks(app);

// Middleware de manejo de errores
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Ruta para manejar 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
