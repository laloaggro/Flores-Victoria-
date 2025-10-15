const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const authRoutes = require('./routes/auth');
const { db, connectToDatabase } = require('./config/database');
const dotenv = require('dotenv');
const initTracer = require('@flores-victoria/tracing');
const metricsMiddleware = require('@flores-victoria/metrics/middleware');

// Inicializar tracer
initTracer('auth-service');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Middleware de métricas
app.use(metricsMiddleware('auth-service'));

// Verificar conexión a la base de datos
connectToDatabase()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente');
  })
  .catch((err) => {
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
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  // Verificar estado de la base de datos
  try {
    const client = await db.connect();
    await client.query('SELECT 1');
    client.release();
    
    res.status(200).json({ 
      status: 'OK', 
      service: 'auth-service',
      database: 'connected'
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      service: 'auth-service',
      database: 'disconnected',
      message: 'Database connection failed',
      error: err.message
    });
  }
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