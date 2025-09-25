const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const routes = require('./routes');
const { logger } = require('./middleware/logger');

// Crear aplicación Express
const app = express();

// Middleware para manejar solicitudes a .well-known
app.use('/.well-known', (req, res) => {
  res.status(404).end();
});

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
  skip: (req, res) => {
    // Excluir solicitudes locales
    const clientIP = req.ip || req.connection.remoteAddress;
    return clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('::ffff:127.0.0.1');
  }
});

app.use(limiter);

// Rutas
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway - Arreglos Victoria',
    version: '1.0.0'
  });
});

module.exports = app;