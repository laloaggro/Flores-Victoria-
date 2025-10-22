const express = require('express');

const config = require('./config');
const db = require('./config/database');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const { router, setDatabase } = require('./routes/orders');
const { verifyToken } = require('./utils/jwt'); // Utilidad JWT local

// Middleware común optimizado

// Crear aplicación Express
const app = express();

// ✨ Aplicar middleware común optimizado (reemplaza 21 líneas duplicadas)
applyCommonMiddleware(app, config);

// Middleware de autenticación
app.use('/api/orders', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido',
    });
  }
});

// ✨ Configurar health checks optimizados
setupHealthChecks(app, 'order-service');

// Rutas
app.use('/api/orders', router);

// Inicializar controladores con base de datos
setDatabase(db);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Pedidos - Arreglos Victoria',
    version: '1.0.0',
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada',
  });
});

module.exports = app;
