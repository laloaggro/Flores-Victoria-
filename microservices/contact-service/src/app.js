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

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Contacto - Arreglos Victoria',
    version: '1.0.0'
  });
});
 
// Endpoint de salud (no valida SMTP aquí; solo disponibilidad de app y DB)
app.get('/health', (req, res) => {
  // Si la conexión a la DB está inicializada, devolver OK
  try {
    res.status(200).json({ status: 'OK', service: 'Contact Service' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', service: 'Contact Service', error: err.message });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada'
  });
});

module.exports = app;