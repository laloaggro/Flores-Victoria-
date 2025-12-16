const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { metricsMiddleware, metricsEndpoint } = require('../shared/metrics-simple');
const logger = require('./logger.simple');
const config = require('./config');
const { connectToDatabase } = require('./config/database');
const ReviewController = require('./controllers/reviewController');

const app = express();
const SERVICE_NAME = 'review-service';

// Database connection placeholder
let db = null;
let reviewController = null;

// Railway usa proxy reverso, necesario para express-rate-limit
app.set('trust proxy', 1);

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'review-service',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/api/reviews/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'review-service',
    version: '1.0.0',
    database: db ? 'mongodb' : 'disconnected',
  });
});

// Middleware de autenticación (opcional para rutas públicas)
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
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

// Ruta pública: obtener reseñas de un producto
app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    if (!reviewController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de reseñas no disponible - MongoDB no conectado',
      });
    }
    await reviewController.getReviewsByProduct(req, res);
  } catch (error) {
    logger.error('Error obteniendo reseñas:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// Ruta protegida: crear reseña
app.post('/api/reviews/product/:productId', authMiddleware, async (req, res) => {
  try {
    if (!reviewController) {
      return res.status(503).json({
        status: 'fail',
        message: 'Servicio de reseñas no disponible - MongoDB no conectado',
      });
    }
    await reviewController.createReview(req, res);
  } catch (error) {
    logger.error('Error creando reseña:', error.message);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// Métricas Prometheus
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// Conectar a MongoDB
const connectDB = async () => {
  try {
    db = await connectToDatabase();
    reviewController = new ReviewController(db);
    logger.info('✅ MongoDB conectado');
    logger.info({ service: SERVICE_NAME }, 'ReviewController inicializado correctamente');
  } catch (error) {
    logger.warn('⚠️ MongoDB no disponible:', error.message);
    logger.info('ℹ️ Servicio continuará sin conexión - las rutas de reseñas no funcionarán');
  }
};

// Iniciar servidor
const PORT = process.env.PORT || config.port || 3007;
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, async () => {
  logger.info(`✅ Servicio de Reseñas corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Review routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/reviews/status');
  logger.info('GET /api/reviews/product/:productId (public)');
  logger.info('POST /api/reviews/product/:productId (auth required)');

  await connectDB();
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
