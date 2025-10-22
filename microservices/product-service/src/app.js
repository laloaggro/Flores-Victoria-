const express = require('express');

// Middleware común optimizado
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');

const app = express();

// ✨ Aplicar middleware común optimizado (reemplaza 13 líneas duplicadas)
applyCommonMiddleware(app);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Product Service is running!' });
});

app.get('/products', (req, res) => {
  // Simular obtención de productos
  const products = [
    { id: 1, name: 'Rosa Roja', price: 10.99 },
    { id: 2, name: 'Tulipán Blanco', price: 8.99 },
    { id: 3, name: 'Girasol', price: 12.99 },
  ];
  res.json(products);
});

// ✨ Configurar health checks optimizados
setupHealthChecks(app, 'product-service');

module.exports = app;
