const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const db = require('./config/database');
const { router, setDatabase } = require('./routes/orders');
const { verifyToken } = require('./utils/jwt'); // Utilidad JWT local

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

// Middleware de autenticación
app.use('/api/orders', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido'
    });
  }
});

// Rutas
app.use('/api/orders', router);

// Inicializar controladores con base de datos
setDatabase(db);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Pedidos - Arreglos Victoria',
    version: '1.0.0'
  });
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Order Service' });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada'
  });
});

module.exports = app;