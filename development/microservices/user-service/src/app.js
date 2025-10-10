const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const config = require('./config');
const { router } = require('./routes/users');
const { verifyToken } = require('./utils/jwt'); // Utilidad JWT local

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors());

// Limitar las solicitudes para prevenir ataques
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

// Middleware para parsear el body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para métricas
app.use(require('./middlewares/metrics'));

app.use(limiter);

// Middleware de documentación de API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas públicas
app.use('/api/users', router);

// Middleware de autenticación para rutas protegidas
app.use('/api/users/*', (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = verifyToken(token.replace('Bearer ', ''));
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido'
    });
  }
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'User Service' });
});

// Ruta raíz con información del servicio
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'User Service - Flores Victoria API',
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