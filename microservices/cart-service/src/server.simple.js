const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { metricsMiddleware, metricsEndpoint } = require('../shared/metrics-simple');
const logger = require('./logger.simple');
const config = require('./config');
const { verifyToken } = require('./utils/jwt');
const CartController = require('./controllers/cartController');

const app = express();
const SERVICE_NAME = 'cart-service';

// Redis client placeholder (se conectará después)
let redisClient = null;
let cartController = null;

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'cart-service',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/api/cart/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'cart-service',
    version: '1.0.0',
    cache: redisClient ? 'redis' : 'memory',
  });
});

// Middleware de autenticación para rutas de carrito
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

// Rutas del carrito (protegidas con autenticación)
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    if (!cartController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de carrito no disponible - Redis no conectado',
      });
    }
    await cartController.getCart(req, res);
  } catch (error) {
    logger.error('Error obteniendo carrito:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

app.post('/api/cart/items', authMiddleware, async (req, res) => {
  try {
    if (!cartController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de carrito no disponible - Redis no conectado',
      });
    }
    await cartController.addItem(req, res);
  } catch (error) {
    logger.error('Error agregando item:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

app.delete('/api/cart/items/:productId', authMiddleware, async (req, res) => {
  try {
    if (!cartController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de carrito no disponible - Redis no conectado',
      });
    }
    await cartController.removeItem(req, res);
  } catch (error) {
    logger.error('Error eliminando item:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

app.delete('/api/cart', authMiddleware, async (req, res) => {
  try {
    if (!cartController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de carrito no disponible - Redis no conectado',
      });
    }
    await cartController.clearCart(req, res);
  } catch (error) {
    logger.error('Error limpiando carrito:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// Métricas Prometheus
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// Conectar a Redis de forma asíncrona
const connectRedis = async () => {
  try {
    const redis = require('./config/redis');
    redisClient = redis;
    cartController = new CartController(redisClient);
    logger.info('✅ Redis conectado');
    logger.info({ service: SERVICE_NAME }, 'Conexión a Redis establecida correctamente');
  } catch (error) {
    logger.warn('⚠️ Redis no disponible:', error.message);
    logger.info('ℹ️ Servicio continuará sin caché - las rutas de carrito no funcionarán');
  }
};

// Iniciar servidor
const PORT = process.env.PORT || config.port || 3005;
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, async () => {
  logger.info(`✅ Servicio de Carrito corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Cart routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/cart/status');
  logger.info('GET /api/cart (auth required)');
  logger.info('POST /api/cart/items (auth required)');
  logger.info('DELETE /api/cart/items/:productId (auth required)');
  logger.info('DELETE /api/cart (auth required)');

  // Conectar Redis después de iniciar el servidor
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
