<<<<<<< HEAD
const { Counter, Histogram, register } = require('prom-client');

// Contador para solicitudes HTTP
const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status'],
});

// Histograma para tiempos de respuesta
const httpResponseTimeHistogram = new Histogram({
  name: 'http_response_time_seconds',
  help: 'Tiempos de respuesta HTTP',
  labelNames: ['method', 'route'],
});

// Middleware para registrar métricas
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  // Ruta de la solicitud
  const route = req.route ? req.route.path : 'unknown';
  
  // Método HTTP
  const method = req.method;
  
  // Registrar finalización de la respuesta
  res.on('finish', () => {
    const status = res.statusCode;
    
    // Incrementar el contador de solicitudes
    httpRequestCounter.inc({ method, route, status });
    
    // Registrar el tiempo de respuesta
    const duration = (Date.now() - start) / 1000; // en segundos
    httpResponseTimeHistogram.observe({ method, route }, duration);
  });
  
  next();
}

// Endpoint para exponer métricas
async function metricsEndpoint(req, res) {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  } catch (err) {
    console.error('Error al obtener métricas:', err);
    res.status(500).end('Error al obtener métricas');
  }
}

module.exports = { metricsMiddleware, metricsEndpoint };
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { router, setDatabase } = require('./routes/reviews');
const { connectToDatabase } = require('./config/database');
const Review = require('./models/Review');
// Utilidad JWT compartida - ruta corregida
const { verifyToken } = require('../shared/security/jwt');
const { metricsMiddleware, metricsEndpoint } = require('./middlewares/metrics');
const { globalErrorHandler, AppError } = require('../shared/middlewares/errorHandler');

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet());

// Middleware CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Middleware de métricas
app.use(metricsMiddleware);

// Middleware de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 solicitudes por ventana
});
app.use(limiter);

// Middleware de autenticación
app.use('/api/reviews', (req, res, next) => {
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

// Conectar a la base de datos
connectToDatabase().then(db => {
  setDatabase(db);
}).catch(err => {
  console.error('Error al conectar a la base de datos:', err);
  process.exit(1);
});

// Rutas
app.use('/api/reviews', router);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Review Service' });
});

// Endpoint para métricas
app.get('/metrics', metricsEndpoint);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Ruta para manejar 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;