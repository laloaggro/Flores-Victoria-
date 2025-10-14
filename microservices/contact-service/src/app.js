const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const contactRoutes = require('./routes/contact');
const database = require('./config/database');

// Crear aplicación Express
const app = express();

// Conectar a la base de datos
database.connectToDatabase().then(() => {
  console.log('Base de datos conectada correctamente');
}).catch(err => {
  console.error('Error conectando a la base de datos:', err);
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servicio de contacto en funcionamiento',
    version: '1.0.0'
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servicio de contacto funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

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

// Rutas
app.use('/api/contacts', contactRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada'
  });
});

module.exports = app;