const logger = require('@flores-victoria/logging');
const metricsMiddleware = require('@flores-victoria/metrics/middleware');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');
// Corrigiendo las rutas de importación usando los nombres de paquetes

const { init, middleware: tracingMiddleware } = require('../shared/tracing');

const config = require('./config');
const authRoutes = require('./routes/auth');

// Cargar variables de entorno
dotenv.config();

// Inicializar tracer
const tracer = init('auth-service');

// Crear aplicación Express
const app = express();

// Middleware de tracing
app.use(tracingMiddleware('auth-service'));

// Middleware de métricas
app.use(metricsMiddleware('auth-service'));

// No hay código de verificación de conexión a la base de datos

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
    message: 'Demasiadas solicitudes, por favor inténtelo de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rutas
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'auth-service',
    database: 'not configured',
  });
});

// Health check endpoint via API prefix (for gateway compatibility)
app.get('/api/auth/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'auth-service',
    via: '/api/auth/health',
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Autenticación - Arreglos Victoria',
    version: '1.0.0',
  });
});

// Ruta para métricas
app.get('/metrics', async (req, res) => {
  try {
    const { register } = require('@flores-victoria/metrics');
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

module.exports = app;
