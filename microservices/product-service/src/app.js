const express = require('express');
const mongoose = require('mongoose');

// Middleware común optimizado
const { applyCommonMiddleware, setupHealthChecks } = require('./middleware/common');

const app = express();

// Conectar a MongoDB
const MONGODB_URI = process.env.PRODUCT_SERVICE_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://mongodb:27017/flores-victoria';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('🔗 Conectado a MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  });

// Aplicar middleware común optimizado (reemplaza 13 líneas duplicadas)
applyCommonMiddleware(app);

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static('uploads'));

// Importar rutas
const productRoutes = require('./routes/products');

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Product Service is running!' });
});

// Registrar rutas de productos
app.use('/products', productRoutes);

// ✨ Configurar health checks optimizados
setupHealthChecks(app, 'product-service');

module.exports = app;
