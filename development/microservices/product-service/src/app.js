const express = require('express');
const mongoose = require('mongoose');

const { createLogger } = require('../../shared/logging/logger');

const config = require('./config');
const auditMiddlewareLib = require('./middlewares/audit');
const { metricsMiddleware } = require('./middlewares/metrics');

const logger = createLogger('product-service');
const app = express();

// Inicializar locals
app.locals.logger = logger;

// Middleware
app.use(express.json());
app.use(metricsMiddleware);

// Importación del middleware de auditoría con inyección de logger
const auditMiddleware = (type, resource, extractor) =>
  auditMiddlewareLib(type, resource, extractor, logger);

/**
 * Middleware de caché
 * @param {string} prefix - Prefijo para la clave de caché
 * @param {number} ttl - Tiempo de vida en segundos
 */
const cacheMiddleware = (prefix, ttl) => async (req, res, next) => {
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

// Rutas
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'product-service',
    timestamp: new Date().toISOString(),
  });
});

// Endpoint para verificar conectividad con otros servicios
app.get('/connectivity-check', async (req, res) => {
  const services = [
    { name: 'mongodb', host: process.env.MONGODB_URI ? 'mongodb' : 'localhost', port: 27017 },
    { name: 'auth-service', host: 'auth-service', port: 3001 },
    { name: 'user-service', host: 'user-service', port: 3003 },
  ];

  const checkService = (host, port) =>
    new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      const timeout = 2000;

      const timer = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, timeout);

      socket.connect(port, host, () => {
        clearTimeout(timer);
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        clearTimeout(timer);
        socket.destroy();
        resolve(false);
      });
    });

  const results = {};
  for (const service of services) {
    try {
      results[service.name] = await checkService(service.host, service.port);
    } catch (error) {
      results[service.name] = false;
    }
  }

  res.status(200).json({
    service: 'product-service',
    connectivity: results,
  });
});

// Ruta para crear un producto
app.post(
  '/products',
  auditMiddleware('CREATE_PRODUCT', 'Product', (req, res) => ({
    productData: req.body,
  })),
  async (req, res) => {
    try {
      const { name, price, category } = req.body;

      // Simular creación de producto
      const newProduct = {
        id: Date.now(), // ID temporal
        name,
        price,
        category,
      };

      logger.info('Producto creado', { productId: newProduct.id });
      res.status(201).json(newProduct);
    } catch (error) {
      logger.error('Error al crear producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// Ruta para obtener productos con caché
app.get(
  '/products',
  auditMiddleware('GET_PRODUCTS', 'Product', (req, res) => ({
    query: req.query,
  })),
  cacheMiddleware('products', 3600),
  async (req, res) => {
    try {
      // Simular obtención de datos de la base de datos
      const products = [
        { id: 1, name: 'Ramo de Rosas', price: 25.99, category: 'flowers' },
        { id: 2, name: 'Arreglo de Tulipanes', price: 35.5, category: ' arrangements' },
        { id: 3, name: 'Orquídea en Maceta', price: 45.0, category: 'potted' },
      ];

      logger.info('Productos obtenidos de la base de datos');

      // Guardar en caché por 1 hora
      // No necesitamos guardar en caché si hay un error

      res.status(200).json(products);
    } catch (error) {
      logger.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// Ruta para obtener un producto específico con caché
app.get(
  '/products/:id',
  auditMiddleware('GET_PRODUCT', 'Product', (req, res) => ({
    productId: req.params.id,
  })),
  cacheMiddleware('product', 3600),
  async (req, res) => {
    try {
      const productId = req.params.id;

      // Simular obtención de datos de la base de datos
      const products = [
        { id: 1, name: 'Ramo de Rosas', price: 25.99, category: 'flowers' },
        { id: 2, name: 'Arreglo de Tulipanes', price: 35.5, category: 'arrangements' },
        { id: 3, name: 'Orquídea en Maceta', price: 45.0, category: 'potted' },
      ];

      const product = products.find((p) => p.id == productId);

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
  }
);

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de productos ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
