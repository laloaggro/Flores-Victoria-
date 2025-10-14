const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/users');
const { initTracer } = require('@flores-victoria/tracing');
const metricsMiddleware = require('@flores-victoria/metrics/middleware');

// Inicializar tracer
initTracer('user-service');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware('user-service'));

// Rutas
app.use('/api/users', userRoutes);

// Ruta para métricas
app.get('/metrics', async (req, res) => {
  try {
    const { register } = require('@flores-victoria/metrics');
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

module.exports = app;