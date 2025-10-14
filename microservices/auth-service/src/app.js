 const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const authRoutes = require('./routes/auth');
const { db } = require('./config/database');
const { tracingMiddleware } = require('../shared/tracing/middleware');
const dotenv = require('dotenv');
const initTracer = require('@flores-victoria/tracing');
const metricsMiddleware = require('@flores-victoria/metrics/middleware');

// Inicializar tracer
initTracer('auth-service');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Agregar middleware de tracing
app.use(tracingMiddleware('auth-service'));

// Middleware de métricas
app.use(metricsMiddleware('auth-service'));

// Verificar conexión a la base de datos
db.serialize(() => {
  db.run('SELECT datetime("now")', (err, res) => {
    if (err) {
      console.error('Error conectando a la base de datos:', err.stack);
    } else {
      console.log('Conexión a la base de datos establecida correctamente');
    }
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
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  // Verificar estado de la base de datos
  db.serialize(() => {
    db.get('SELECT 1', (err, result) => {
      if (err) {
        return res.status(500).json({ 
          status: 'error', 
          service: 'auth-service',
          database: 'disconnected',
          message: 'Database connection failed'
        });
      }
      
      res.status(200).json({ 
        status: 'OK', 
        service: 'auth-service',
        database: 'connected'
      });
    });
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Autenticación - Arreglos Victoria',
    version: '1.0.0'
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