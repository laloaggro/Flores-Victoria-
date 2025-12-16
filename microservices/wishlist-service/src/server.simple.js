const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { metricsMiddleware, metricsEndpoint } = require('../shared/metrics-simple');
const logger = require('./logger.simple');
const config = require('./config');
const { verifyToken } = require('./utils/jwt');
const WishlistController = require('./controllers/wishlistController');

const app = express();
const SERVICE_NAME = 'wishlist-service';

// Redis client placeholder
let redisClient = null;
let wishlistController = null;

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'wishlist-service',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/api/wishlist/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'wishlist-service',
    version: '1.0.0',
    cache: redisClient ? 'redis' : 'memory',
  });
});

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    // El token usa userId pero el controller espera id
    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido o expirado',
    });
  }
};

// Rutas de wishlist (protegidas)
app.get('/api/wishlist', authMiddleware, async (req, res) => {
  try {
    if (!wishlistController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de wishlist no disponible - Redis no conectado',
      });
    }
    await wishlistController.getWishlist(req, res);
  } catch (error) {
    logger.error('Error obteniendo wishlist:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

app.post('/api/wishlist/items', authMiddleware, async (req, res) => {
  try {
    if (!wishlistController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de wishlist no disponible - Redis no conectado',
      });
    }
    await wishlistController.addItem(req, res);
  } catch (error) {
    logger.error('Error agregando item:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

app.delete('/api/wishlist/items/:productId', authMiddleware, async (req, res) => {
  try {
    if (!wishlistController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de wishlist no disponible - Redis no conectado',
      });
    }
    await wishlistController.removeItem(req, res);
  } catch (error) {
    logger.error('Error eliminando item:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

app.delete('/api/wishlist', authMiddleware, async (req, res) => {
  try {
    if (!wishlistController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de wishlist no disponible - Redis no conectado',
      });
    }
    await wishlistController.clearWishlist(req, res);
  } catch (error) {
    logger.error('Error limpiando wishlist:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// Métricas Prometheus
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// Conectar a Redis
const connectRedis = async () => {
  try {
    const redis = require('./config/redis');
    redisClient = redis;
    wishlistController = new WishlistController(redisClient);
    logger.info('✅ Redis conectado');
    logger.info({ service: SERVICE_NAME }, 'Conexión a Redis establecida correctamente');
  } catch (error) {
    logger.warn('⚠️ Redis no disponible:', error.message);
    logger.info('ℹ️ Servicio continuará sin caché - las rutas de wishlist no funcionarán');
  }
};

// Iniciar servidor
const PORT = process.env.PORT || config.port || 3006;
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, async () => {
  logger.info(`✅ Servicio de Lista de Deseos corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Wishlist routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/wishlist/status');
  logger.info('GET /api/wishlist (auth required)');
  logger.info('POST /api/wishlist/items (auth required)');
  logger.info('DELETE /api/wishlist/items/:productId (auth required)');
  logger.info('DELETE /api/wishlist (auth required)');

  await connectRedis();
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('❌ Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('🛑 Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;
