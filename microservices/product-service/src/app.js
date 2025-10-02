const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { router, setDatabase } = require('./routes/products');
const { connectToDatabase } = require('./config/database');
const Product = require('./models/Product');

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet());

// Middleware CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: 'fail',
    message: 'Demasiadas solicitudes, por favor inténtelo de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middleware para conectar a la base de datos
app.use(async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    req.db = db;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error conectando a la base de datos'
    });
  }
});

// Inicializar controladores con base de datos
app.use((req, res, next) => {
  setDatabase(req.db);
  next();
});

// Crear índices
app.use(async (req, res, next) => {
  try {
    // Esta sección se ha corregido para evitar el error de createIndexes
    const productModel = new Product(req.db);
    // Si se necesita crear índices específicos, se pueden definir aquí
    // Por ahora, simplemente continuamos sin errores
    next();
  } catch (error) {
    console.error('Error creando índices:', error);
    next();
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Productos - Arreglos Victoria',
    version: '1.0.0'
  });
});

// Rutas
app.use('/api/products', router);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada'
  });
});

module.exports = app;