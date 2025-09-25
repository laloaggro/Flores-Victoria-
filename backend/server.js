const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { MongoClient } = require('mongodb');

// Importar logger mejorado
const { logInfo, logError, logSystemStats } = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');

// Crear aplicación Express
const app = express();

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/floresvictoria?authSource=admin';
const client = new MongoClient(uri);

// Conectar a la base de datos
async function connectToDatabase() {
  try {
    await client.connect();
    logInfo('Conexión a MongoDB establecida correctamente', {
      mongodbUri: uri,
      environment: process.env.NODE_ENV || 'development'
    });
    console.log('Conectado a MongoDB');
  } catch (error) {
    logError('Error al conectar con MongoDB:', error);
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
}

connectToDatabase();

// Middleware de seguridad
app.use(helmet());

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Limitar las solicitudes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 solicitudes por ventana
});
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Configurar conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/floresVictoria?authSource=admin';


// Variables para el servidor
let server;

// Función para iniciar el servidor
function startServer(port) {
    try {
        server = app.listen(port, () => {
            logInfo(`Servidor backend iniciado en puerto ${port}`, {
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            });
            console.log(`Servidor corriendo en puerto ${port}`);
            console.log(`JWT_SECRET definida: ${!!process.env.JWT_SECRET}`);
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logError(`El puerto ${port} está ocupado. Por favor, detenga el proceso que lo está utilizando o especifique un puerto diferente.`, err);
                console.error(`El puerto ${port} está ocupado. Por favor, detenga el proceso que lo está utilizando o especifique un puerto diferente.`);
                process.exit(1);
            } else {
                logError(`Error al iniciar el servidor: ${err.message}`, err);
                console.error(`Error al iniciar el servidor: ${err.message}`);
                process.exit(1);
            }
        });
        
        
    } catch (error) {
        logError('Error al iniciar el servidor', error);
        console.error('Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Flores Victoria',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  logInfo(`Servidor backend iniciado en puerto ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
  console.log(`Documentación de la API: http://localhost:${PORT}/api/docs`);
  console.log(`JWT_SECRET definida: ${!!process.env.JWT_SECRET}`);
});


// Middleware para manejo de errores
app.use((err, req, res, next) => {
  logError('Error no manejado', err);
  console.error(err.stack);
  res.status(500).json({ 
    error: '¡Algo salió mal!',
    message: err.message 
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

