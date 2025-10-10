const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { router, setDatabase } = require('./routes/reviews');
const { connectToDatabase } = require('./config/database');
const Review = require('./models/Review');
// Utilidad JWT compartida - ruta corregida
const { verifyToken } = require('../shared/security/jwt');

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet());

// Middleware CORS
app.use(cors());

// Middleware para parsear el body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 solicitudes por ventana
});
app.use(limiter);

// Middleware para métricas
app.use(require('./middlewares/metrics'));

// Middleware de documentación de API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

// Ruta raíz con información del servicio
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Review Service - Flores Victoria API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

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