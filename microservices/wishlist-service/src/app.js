const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const {  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
} = require('./shared/middleware/health-check');
const config = require('./config');
const redisClient = require('./config/redis');
const { router, setRedis } = require('./routes/wishlist');
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
    message: 'Demasiadas solicitudes, por favor inténtelo de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middleware de autenticación
app.use('/api/wishlist', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (_error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido',
    });
  }
});

// Inicializar controladores con Redis
setRedis(redisClient);

// Rutas
app.use('/api/wishlist', router);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servicio de Lista de Deseos - Arreglos Victoria',
    version: '1.0.0',
  });
});

// Health checks mejorados con módulo compartido

const cacheCheck = async () => {
  try {
    const redisClient = require('./config/redis');
    return redisClient && redisClient.status === 'ready';
  } catch (_error) {
    return false;
  }
};

// Health check completo - incluye Redis, memoria, CPU, uptime
app.get(
  '/health',
  createHealthCheck({
    serviceName: 'wishlist-service',
    cacheCheck,
  })
);

// Readiness check - verifica que puede recibir tráfico
app.get(
  '/ready',
  createReadinessCheck({
    serviceName: 'wishlist-service',
    cacheCheck,
  })
);

// Liveness check - solo verifica que el proceso está vivo
app.get('/live', createLivenessCheck('wishlist-service'));

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Ruta no encontrada',
  });
});

module.exports = app;
