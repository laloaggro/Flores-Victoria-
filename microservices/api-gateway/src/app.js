const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { specs, swaggerUi } = require('./config/swagger');
const routes = require('./routes');

// Crear aplicación Express
const app = express();

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Flores Victoria API Docs',
  })
);

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
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, _res) => req.ip === '127.0.0.1' || req.ip === '::1',
});

app.use(limiter);

// Health check endpoint - Liveness probe
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness check endpoint - Readiness probe
app.get('/ready', async (req, res) => {
  try {
    // Verificar conexiones a servicios
    const services = {
      auth: config.services.auth,
      product: config.services.product,
    };

    const checks = {
      status: 'ready',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      services,
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        rss: process.memoryUsage().rss,
      },
    };

    res.status(200).json(checks);
  } catch (error) {
    res.status(503).json({
      status: 'not-ready',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: '1.0.0',
  });
});

// Rutas
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway - Arreglos Victoria',
    version: '1.0.0',
  });
});

module.exports = app;
