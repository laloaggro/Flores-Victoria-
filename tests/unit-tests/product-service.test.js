const express = require('express');
const request = require('supertest');
const { cacheMiddleware } = require('../mocks/cache-middleware.mock');

// Mocks
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(),
  Schema: jest.fn(),
  model: jest.fn()
}));

// Crear un mock para el middleware de métricas
jest.mock('../../microservices/product-service/src/middlewares/metrics', () => ({
  metricsMiddleware: (req, res, next) => next(),
  metricsEndpoint: (req, res) => res.status(200).json({ metrics: true })
}));

// Crear un mock para el middleware de auditoría
jest.mock('../../microservices/product-service/src/middlewares/audit', () => {
  return jest.fn(() => (req, res, next) => next());
});

// Crear un mock para el logger
jest.mock('/shared/logging/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn()
  })
}));

// Crear un mock para la configuración
jest.mock('../../microservices/product-service/src/config', () => ({
  db: {
    uri: 'mongodb://localhost:27017/test'
  }
}));

describe('Product Service - Unit Tests', () => {
  let app;

  beforeEach(() => {
    // Reiniciar los mocks
    jest.clearAllMocks();
    
    // Importar la aplicación después de configurar los mocks
    app = require('../../microservices/product-service/src/app');
  });

  describe('Health Check Endpoint', () => {
    test('should return 200 and health status', async () => {
      await request(app)
        .get('/health')
        .expect(200)
        .expect({
          status: 'OK',
          service: 'product-service'
        });
    });
  });

  describe('Metrics Endpoint', () => {
    test('should return 200 and metrics data', async () => {
      await request(app)
        .get('/metrics')
        .expect(200);
    });
  });

  describe('Cache Middleware', () => {
    test('should call next when cache is disabled', async () => {
      const req = {
        app: {
          locals: {
            cache: null
          }
        }
      };
      const res = {};
      const next = jest.fn();
      
      const middleware = cacheMiddleware('test', 3600);
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('should return cached data when available', async () => {
      const cachedData = JSON.stringify({ id: 1, name: 'Test Product' });
      const req = {
        app: {
          locals: {
            cache: {
              get: jest.fn().mockResolvedValue(cachedData)
            },
            logger: {
              info: jest.fn()
            }
          }
        },
        params: {},
        query: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      const middleware = cacheMiddleware('test', 3600);
      await middleware(req, res, next);
      
      expect(req.app.locals.cache.get).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(JSON.parse(cachedData));
      expect(next).not.toHaveBeenCalled();
    });

    test('should call next when no cached data is available', async () => {
      const req = {
        app: {
          locals: {
            cache: {
              get: jest.fn().mockResolvedValue(null)
            },
            logger: {
              info: jest.fn(),
              error: jest.fn()
            }
          }
        },
        params: {},
        query: {}
      };
      const res = {};
      const next = jest.fn();
      
      const middleware = cacheMiddleware('test', 3600);
      await middleware(req, res, next);
      
      expect(req.app.locals.cache.get).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Product Routes', () => {
    test('should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        price: 29.99,
        category: 'test'
      };

      await request(app)
        .post('/products')
        .send(newProduct)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(newProduct.name);
          expect(res.body.price).toBe(newProduct.price);
          expect(res.body.category).toBe(newProduct.category);
        });
    });

    test('should get all products', async () => {
      await request(app)
        .get('/products')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    test('should get a specific product by ID', async () => {
      await request(app)
        .get('/products/1')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('price');
          expect(res.body).toHaveProperty('category');
        });
    });

    test('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/products/999')
        .expect(404)
        .expect({
          error: 'Producto no encontrado'
        });
    });
  });
});