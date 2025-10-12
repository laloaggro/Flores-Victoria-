const express = require('express');
const mongoose = require('mongoose');
const { metricsMiddleware, metricsEndpoint } = require('./middlewares/metrics');
const auditMiddlewareLib = require('./middlewares/audit');
const { createLogger } = require('/shared/logging/logger');
const config = require('./config');
const { globalErrorHandler, AppError } = require('../shared/middlewares/errorHandler');
const recommendationRoutes = require('./routes/recommendations');

const logger = createLogger('product-service');
const app = express();

// Middleware
app.use(express.json());
app.use(metricsMiddleware);

// Importación del middleware de auditoría con inyección de logger
const auditMiddleware = (type, resource, extractor) => auditMiddlewareLib(type, resource, extractor, logger);

/**
 * Middleware de caché
 * @param {string} prefix - Prefijo para la clave de caché
 * @param {number} ttl - Tiempo de vida en segundos
 */
const cacheMiddleware = (prefix, ttl) => {
  return async (req, res, next) => {
    try {
      // Verificar si la caché está habilitada
      if (!req.app.locals.cache) {
        return next();
      }

      const cacheKey = `${prefix}:${JSON.stringify(req.params)}:${JSON.stringify(req.query)}`;
      
      // Intentar obtener datos de la caché
      const cachedData = await req.app.locals.cache.get(cacheKey);
      
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

// Rutas
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'product-service' });
});

// Endpoint para métricas
app.get('/metrics', metricsEndpoint);

// Ruta para crear un producto
app.post('/products',
  auditMiddleware('CREATE_PRODUCT', 'Product', (req, res) => ({
    productData: req.body
  })),
  async (req, res, next) => {
    try {
      const { name, price, category } = req.body;
      
      // Validar datos requeridos
      if (!name || !price || !category) {
        return next(new AppError('Nombre, precio y categoría son requeridos', 400));
      }
      
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
      next(new AppError('Error al crear producto', 500));
    }
  }
);

// Ruta para obtener productos con caché
app.get('/products', 
  auditMiddleware('GET_PRODUCTS', 'Product', (req, res) => ({
    query: req.query
  })),
  cacheMiddleware('products', 3600), 
  async (req, res, next) => {
  try {
    // Simular obtención de datos de la base de datos
    const products = [
      { id: 1, name: 'Ramo de Rosas', price: 25.99, category: 'flores' },
      { id: 2, name: 'Arreglo de Tulipanes', price: 35.50, category: 'arrangements' },
      { id: 3, name: 'Orquídea en Maceta', price: 45.00, category: 'potted' }
    ];

    logger.info('Productos obtenidos de la base de datos');
    
    // Guardar en caché por 1 hora
    // No necesitamos guardar en caché si hay un error
    
    res.status(200).json(products);
  } catch (error) {
    next(new AppError('Error al obtener productos', 500));
  }
});

// Ruta para obtener un producto específico con caché
app.get('/products/:id', 
  auditMiddleware('GET_PRODUCT', 'Product', (req, res) => ({
    productId: req.params.id
  })),
  cacheMiddleware('product', 3600), 
  async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Simular obtención de datos de la base de datos
    const products = [
      { id: 1, name: 'Ramo de Rosas', price: 25.99, category: 'flores' },
      { id: 2, name: 'Arreglo de Tulipanes', price: 35.50, category: 'arrangements' },
      { id: 3, name: 'Orquídea en Maceta', price: 45.00, category: 'potted' }
    ];
    
    const product = products.find(p => p.id == productId);
    
    if (!product) {
      return next(new AppError('Producto no encontrado', 404));
    }

    logger.info(`Producto ${productId} obtenido de la base de datos`);
    
    // Guardar en caché por 1 hora
    // No necesitamos guardar en caché si hay un error
    
    res.status(200).json(product);
  } catch (error) {
    next(new AppError('Error al obtener producto', 500));
  }
});

// Rutas para recomendaciones
app.use('/', recommendationRoutes);

// Ruta para manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor`, 404));
});

// Middleware de manejo de errores global
app.use(globalErrorHandler);

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

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de productos ejecutándose en el puerto ${PORT}`);
});

module.exports = app;