const express = require('express');

const config = require('./config');
const redisClient = require('./config/redis');
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');
const { router, setRedis } = require('./routes/cart');
const { verifyToken } = require('./utils/jwt'); // Utilidad JWT local

// Middleware común optimizado

// Crear aplicación Express
const app = express();

// ✨ Aplicar middleware común optimizado (reemplaza 21 líneas duplicadas)
applyCommonMiddleware(app, config);

// Middleware de autenticación
app.use('/api/cart', (req, res, next) => {
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

// Inicializar controladores con Redis
setRedis(redisClient);

// ✨ Configurar health checks optimizados
setupHealthChecks(app, 'cart-service');

// Rutas principales
app.use('/api/cart', router);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Carrito - Arreglos Victoria',
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
