const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Contact Service API - Flores Victoria',
      version: '1.0.0',
      description: 'API documentation for the Contact Service of Flores Victoria',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/contact.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const config = require('./config');
const contactRoutes = require('./routes/contact');
const database = require('./config/database');

// Crear aplicación Express
const app = express();

// Conectar a la base de datos
database.connectToDatabase().then(() => {
  console.log('Base de datos conectada correctamente');
}).catch(err => {
  console.error('Error conectando a la base de datos:', err);
});

// Middleware de seguridad
app.use(helmet());

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
    message: 'Demasiadas solicitudes, por favor inténtelo de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rutas
app.use('/api/contacts', contactRoutes);

// Middleware de documentación de API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta raíz con información del servicio
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Servicio de Contacto - Arreglos Victoria',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Contact Service' });
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