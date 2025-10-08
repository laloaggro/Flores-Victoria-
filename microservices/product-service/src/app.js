// Ruta para crear un producto
app.post('/products',
  auditMiddleware('CREATE_PRODUCT', 'Product', (req, res) => ({
    productData: req.body
  })),
  async (req, res) => {
    try {
      const { name, price, category } = req.body;
      
      // Simular creación de producto
      const newProduct = {
        id: Date.now(), // ID temporal
        name,
        price,
        category
      };

      logger.info('Producto creado', { productId: newProduct.id });
      res.status(201).json(newProduct);
    } catch (error) {
      logger.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// Ruta para actualizar un producto
app.put('/products/:id',
  auditMiddleware('UPDATE_PRODUCT', 'Product', (req, res) => ({
    productId: req.params.id,
    productData: req.body
  })),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const { name, price, category } = req.body;
      
      // Simular actualización de producto
      const updatedProduct = {
        id: productId,
        name,
        price,
        category
      };

      logger.info('Producto actualizado', { productId });
      res.status(200).json(updatedProduct);
    } catch (error) {
      logger.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// Ruta para eliminar un producto
app.delete('/products/:id',
  auditMiddleware('DELETE_PRODUCT', 'Product', (req, res) => ({
    productId: req.params.id
  })),
  async (req, res) => {
    try {
      const productId = req.params.id;
      
      // Simular eliminación de producto
      logger.info('Producto eliminado', { productId });
      res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      logger.error('Error al eliminar producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);
const { createLogger } = require('../../logging/logger');

const logger = createLogger('audit-middleware');

/**
 * Middleware de auditoría
 * @param {string} auditType - Tipo de auditoría
 * @param {string} resourceType - Tipo de recurso
 * @param {function} dataExtractor - Función para extraer datos para el registro de auditoría
 */
function auditMiddleware(auditType, resourceType, dataExtractor) {
  return (req, res, next) => {
    try {
      // Extraer datos de la solicitud
      const auditData = {
        type: auditType,
        resourceType,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        userData: req.user ? {
          id: req.user.id,
          email: req.user.email
        } : null,
        data: dataExtractor(req, res)
      };
      
      // Registrar la auditoría
      logger.info(`Auditoría registrada: ${auditType}`, auditData);
      
      next();
    } catch (error) {
      logger.error('Error en middleware de auditoría:', error);
      next();
    }
  };
}

module.exports = auditMiddleware;
const redis = require('redis');
const { createLogger } = require('../logging/logger');

const logger = createLogger('redis-client');

// Crear cliente Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Manejar errores de conexión
redisClient.on('error', (err) => {
  logger.error('Error de conexión con Redis:', err);
});

// Conectar al cliente Redis
redisClient.connect().catch(console.error);

module.exports = { redisClient };
/**
 * Middleware de caché para rutas de productos
 * @param {string} cacheKeyPrefix - Prefijo para la clave de caché
 * @param {number} ttl - Tiempo de vida de la caché en segundos
 */
const redisClient = require('../../redis/client');

function cacheMiddleware(cacheKeyPrefix, ttl) {
  return async (req, res, next) => {
    try {
      // Construir la clave de caché
      let cacheKey = cacheKeyPrefix;
      if (req.params.id) {
        cacheKey += `:${req.params.id}`;
      }
      
      // Intentar obtener datos de la caché
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        req.app.locals.logger.info(`Obteniendo ${cacheKey} de la caché`);
        return res.status(200).json(JSON.parse(cachedData));
      }
      
      // Si no hay datos en caché, continuar con la solicitud normal
      req.cacheKey = cacheKey;
      req.cacheTtl = ttl;
      next();
    } catch (error) {
      req.app.locals.logger.error(`Error en cacheMiddleware para ${cacheKey}:`, error);
      next();
    }
  };
}

module.exports = { cacheMiddleware };
const express = require('express');
const mongoose = require('mongoose');
const prometheusMiddleware = require('./middlewares/metrics');
const { cacheMiddleware } = require('./middlewares/cache');
const auditMiddleware = require('./middlewares/audit');
const { createLogger } = require('../logging/logger');
const config = require('./config');

const logger = createLogger('product-service');
const app = express();

// Middleware
app.use(express.json());
app.use(prometheusMiddleware);

// Rutas
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'product-service' });
});

// Ruta para obtener productos con caché
app.get('/products', 
  auditMiddleware('GET_PRODUCTS', 'Product', (req, res) => ({
    query: req.query
  })),
  cacheMiddleware('products', 3600), 
  async (req, res) => {
  try {
    // Simular obtención de datos de la base de datos
    const products = [
      { id: 1, name: 'Ramo de Rosas', price: 25.99, category: 'flowers' },
      { id: 2, name: 'Arreglo de Tulipanes', price: 35.50, category: ' arrangements' },
      { id: 3, name: 'Orquídea en Maceta', price: 45.00, category: 'potted' }
    ];

    logger.info('Productos obtenidos de la base de datos');
    
    // Guardar en caché por 1 hora
    // No necesitamos guardar en caché si hay un error
    
    res.status(200).json(products);
  } catch (error) {
    logger.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un producto específico con caché
app.get('/products/:id', 
  auditMiddleware('GET_PRODUCT', 'Product', (req, res) => ({
    productId: req.params.id
  })),
  cacheMiddleware('product', 3600), 
  async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Simular obtención de datos de la base de datos
    const products = [
      { id: 1, name: 'Ramo de Rosas', price: 25.99, category: 'flowers' },
      { id: 2, name: 'Arreglo de Tulipanes', price: 35.50, category: 'arrangements' },
      { id: 3, name: 'Orquídea en Maceta', price: 45.00, category: 'potted' }
    ];
    
    const product = products.find(p => p.id == productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    logger.info(`Producto ${productId} obtenido de la base de datos`);
    
    // Guardar en caché por 1 hora
    // No necesitamos guardar en caché si hay un error
    
    res.status(200).json(product);
  } catch (error) {
    logger.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Conexión a MongoDB
mongoose.connect(config.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Conectado a MongoDB');
})
.catch((error) => {
  logger.error('Error al conectar a MongoDB:', error);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de productos ejecutándose en el puerto ${PORT}`);
});

module.exports = app;