const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const config = require('./config');
const { PORT } = require('./config');
const { connectToDatabase } = require('./config/database');
const { connectRabbitMQ } = require('./config/rabbitmq');
const Review = require('./models/Review');
const { router, setDatabase } = require('./routes/reviews');

const app = express();

// Middleware de seguridad
app.use(helmet());

// Middleware CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Middleware de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por ventana
});
app.use(limiter);

// Conectar a la base de datos
connectToDatabase()
  .then((db) => {
    setDatabase(db);
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  });

// Rutas
app.use('/api/reviews', router);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Review Service' });
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
