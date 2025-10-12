const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const contactRoutes = require('./routes/contact');
const database = require('./config/database');
const { metricsMiddleware, metricsEndpoint } = require('./middlewares/metrics');
const { globalErrorHandler, AppError } = require('../shared/middlewares/errorHandler');

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

// Middleware de métricas
app.use(metricsMiddleware);

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

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'contact-service' });
});

// Endpoint para métricas
app.get('/metrics', metricsEndpoint);

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

// Ruta para manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor`, 404));
});

// Middleware de manejo de errores global
app.use(globalErrorHandler);

module.exports = app;