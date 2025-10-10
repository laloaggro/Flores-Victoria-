const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
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
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por ventana
  message: {
    status: 'fail',
    message: 'Demasiadas solicitudes, por favor inténtelo de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middleware para documentación de API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware para métricas
app.use(require('./middlewares/metrics'));

// Middleware de autenticación
app.use('/api/wishlist', (req, res, next) => {
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

// Inicializar controladores con Redis
setRedis(redisClient);

// Rutas
app.use('/api/wishlist', router);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Wishlist Service' });
});

// Ruta raíz con información del servicio
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Wishlist Service - Flores Victoria API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});

module.exports = app;