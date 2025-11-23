/**
 * Tests para API Gateway Routes
 */

const request = require('supertest');
const express = require('express');

// Mock de dependencias
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => (req, res, next) => next()),
}));

jest.mock('../../../../../shared/middleware/rate-limiter', () => ({
  criticalLimiter: jest.fn(() => (req, res, next) => next()),
  searchLimiter: jest.fn(() => (req, res, next) => next()),
  publicLimiter: jest.fn(() => (req, res, next) => next()),
}));

jest.mock('../../config', () => ({
  services: {
    authService: 'http://auth-service:3001',
    productService: 'http://product-service:3009',
    userService: 'http://user-service:3002',
    orderService: 'http://order-service:3003',
    cartService: 'http://cart-service:3004',
    wishlistService: 'http://wishlist-service:3005',
    reviewService: 'http://review-service:3006',
    contactService: 'http://contact-service:3007',
  },
}));

jest.mock('../../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../../middleware/logger', () => ({
  logRequest: (req, res, next) => next(),
}));

describe('API Gateway Routes', () => {
  let app;
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Crear nueva app para cada test
    app = express();
    app.use(express.json());
    
    // Cargar router después de mocks
    router = require('../../routes/index');
    app.use('/', router);
  });

  describe('Root Route', () => {
    it('should return API info on GET /', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('API Gateway');
    });

    it('should return version information', async () => {
      const response = await request(app).get('/');
      
      expect(response.body).toHaveProperty('version');
      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Auth Routes', () => {
    it('should proxy /auth requests', async () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      
      await request(app).get('/auth/login');
      
      expect(createProxyMiddleware).toHaveBeenCalled();
    });

    it('should apply critical limiter to auth routes', async () => {
      const { criticalLimiter } = require('../../shared/middleware/rate-limiter');
      
      await request(app).post('/auth/login').send({ email: 'test@test.com' });
      
      expect(criticalLimiter).toHaveBeenCalled();
    });

    it('should handle auth POST requests', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'Test123!' });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Product Routes', () => {
    it('should proxy /products requests', async () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      
      await request(app).get('/products');
      
      expect(createProxyMiddleware).toHaveBeenCalled();
    });

    it('should apply search limiter to products routes', async () => {
      const { searchLimiter } = require('../../shared/middleware/rate-limiter');
      
      await request(app).get('/products/search?q=roses');
      
      expect(searchLimiter).toHaveBeenCalled();
    });

    it('should handle product GET requests', async () => {
      const response = await request(app).get('/products/123');
      
      expect(response.status).toBeLessThan(500);
    });

    it('should handle product POST requests', async () => {
      const response = await request(app)
        .post('/products')
        .send({ name: 'Rose Bouquet', price: 29.99 });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('User Routes', () => {
    it('should proxy /users requests', async () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      
      await request(app).get('/users/profile');
      
      expect(createProxyMiddleware).toHaveBeenCalled();
    });

    it('should handle user GET requests', async () => {
      const response = await request(app).get('/users/123');
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Order Routes', () => {
    it('should proxy /orders requests', async () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      
      await request(app).get('/orders');
      
      expect(createProxyMiddleware).toHaveBeenCalled();
    });

    it('should handle order creation', async () => {
      const response = await request(app)
        .post('/orders')
        .send({ items: [{ id: '1', quantity: 1 }] });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Cart Routes', () => {
    it('should proxy /cart requests', async () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      
      await request(app).get('/cart');
      
      expect(createProxyMiddleware).toHaveBeenCalled();
    });

    it('should handle cart operations', async () => {
      const response = await request(app)
        .post('/cart/items')
        .send({ productId: '123', quantity: 2 });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Wishlist Routes', () => {
    it('should proxy /wishlist requests', async () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      
      await request(app).get('/wishlist');
      
      expect(createProxyMiddleware).toHaveBeenCalled();
    });
  });

  describe('Review Routes', () => {
    it('should proxy /reviews requests', async () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      
      await request(app).get('/reviews/product/123');
      
      expect(createProxyMiddleware).toHaveBeenCalled();
    });

    it('should handle review submission', async () => {
      const response = await request(app)
        .post('/reviews')
        .send({ productId: '123', rating: 5, comment: 'Great!' });
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Contact Routes', () => {
    it('should proxy /contact requests', async () => {
      const { createProxyMiddleware } = require('http-proxy-middleware');
      
      await request(app).post('/contact');
      
      expect(createProxyMiddleware).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      
      expect(response.status).toBe(404);
    });

    it('should return JSON for errors', async () => {
      const response = await request(app).get('/unknown');
      
      if (response.status === 404) {
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });
  });

  describe('Request ID Propagation', () => {
    it('should handle requests with X-Request-ID', async () => {
      const response = await request(app)
        .get('/')
        .set('X-Request-ID', 'test-123');
      
      expect(response.status).toBe(200);
    });
  });

  describe('Content Type Handling', () => {
    it('should accept JSON requests', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@test.com' });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should handle empty body requests', async () => {
      const response = await request(app).get('/products');
      
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('HTTP Methods', () => {
    it('should support GET method', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
    });

    it('should support POST method', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com' });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should support PUT method', async () => {
      const response = await request(app)
        .put('/products/123')
        .send({ name: 'Updated' });
      
      expect(response.status).toBeLessThan(500);
    });

    it('should support DELETE method', async () => {
      const response = await request(app).delete('/products/123');
      
      expect(response.status).toBeLessThan(500);
    });
  });
});
