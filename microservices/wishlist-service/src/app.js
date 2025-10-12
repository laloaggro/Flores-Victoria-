const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const redisClient = require('./config/redis');
const { router, setRedis } = require('./routes/wishlist');
const { verifyToken } = require('./utils/jwt'); // Utilidad JWT local
const { metricsMiddleware, metricsEndpoint } = require('./middlewares/metrics');
const { globalErrorHandler, AppError } = require('../shared/middlewares/errorHandler');

// Crear aplicación Express
const app = express();

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
  res.status(200).json({ status: 'OK', service: 'wishlist-service' });
});

// Endpoint para métricas
app.get('/metrics', metricsEndpoint);

// Middleware de autenticación
app.use('/api/wishlist', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new AppError('Token no proporcionado', 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Token inválido', 401));
  }
});

// Usar rutas de lista de deseos
app.use('/api/wishlist', router);

// Ruta para manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor`, 404));
});

// Middleware de manejo de errores global
app.use(globalErrorHandler);

module.exports = app;