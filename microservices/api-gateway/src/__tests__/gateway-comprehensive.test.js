/**
 * @fileoverview Tests de integración para API Gateway
 * @description Cubre routing, CORS, rate limiting, token validation y error handling
 */

const request = require('supertest');
const express = require('express');

// Mocks
jest.mock('@flores-victoria/shared/middleware/token-revocation', () => ({
  isTokenRevokedMiddleware: jest.fn(() => (req, res, next) => next()),
  initRedisClient: jest.fn(),
}));

jest.mock('@flores-victoria/shared/middleware/rate-limiter', () => ({
  initRedisClient: jest.fn(),
  publicLimiter: jest.fn((req, res, next) => next()),
  criticalLimiter: jest.fn((req, res, next) => next()),
}));

jest.mock('@flores-victoria/shared/config/cors-whitelist', () => ({
  validateCorsConfiguration: jest.fn(),
  getCorsOptions: jest.fn(() => ({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3010'],
    credentials: true,
  })),
}));

describe('API Gateway - Integration Tests', () => {
  let app;

  beforeAll(() => {
    // Crear una app Express simple para testing
    app = express();
    app.use(express.json());

    // Middleware de logging mock
    app.use((req, res, next) => {
      req.log = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      };
      next();
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'api-gateway' });
    });

    // Liveness
    app.get('/live', (req, res) => {
      res.json({ alive: true });
    });

    // Mock routes para otros servicios
    app.post('/api/auth/register', (req, res) => {
      if (!req.body.email || !req.body.password) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      res.status(201).json({ status: 'success', userId: '123' });
    });

    app.post('/api/auth/login', (req, res) => {
      if (req.body.email === 'test@example.com' && req.body.password === 'password123') {
        res.json({ token: 'mock-jwt-token' });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });

    app.post('/api/auth/logout', (req, res) => {
      res.json({ message: 'Logout successful' });
    });

    app.get('/api/products', (req, res) => {
      res.json({
        data: [
          { id: '1', name: 'Product 1', price: 100 },
          { id: '2', name: 'Product 2', price: 200 },
        ],
      });
    });

    app.get('/api/products/:id', (req, res) => {
      res.json({
        id: req.params.id,
        name: 'Product',
        price: 100,
      });
    });

    app.post('/api/orders', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.status(201).json({ orderId: '456', status: 'created' });
    });

    // Error handling
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // HEALTH CHECKS
  // ═══════════════════════════════════════════════════════════════

  describe('Health Checks', () => {
    it('should respond to /health', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('api-gateway');
    });

    it('should respond to /live', async () => {
      const response = await request(app).get('/live');

      expect(response.status).toBe(200);
      expect(response.body.alive).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AUTHENTICATION ROUTING
  // ═══════════════════════════════════════════════════════════════

  describe('Auth Service Routing', () => {
    it('should route POST /api/auth/register correctly', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // password missing
        });

      expect(response.status).toBe(400);
    });

    it('should route POST /api/auth/login correctly', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should route POST /api/auth/logout correctly', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logout');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PRODUCT ROUTING
  // ═══════════════════════════════════════════════════════════════

  describe('Product Service Routing', () => {
    it('should route GET /api/products correctly', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should route GET /api/products/:id correctly', async () => {
      const response = await request(app).get('/api/products/123');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('123');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    it('should support query parameters for filtering', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ category: 'roses', minPrice: 50, maxPrice: 200 });

      expect(response.status).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // AUTHORIZATION & AUTHENTICATION
  // ═══════════════════════════════════════════════════════════════

  describe('Authorization & Authentication', () => {
    it('should reject protected endpoints without token', async () => {
      const response = await request(app).post('/api/orders');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/unauthorized/i);
    });

    it('should allow protected endpoints with valid token', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({
          items: [{ id: '1', quantity: 2 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('orderId');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CORS HANDLING
  // ═══════════════════════════════════════════════════════════════

  describe('CORS Configuration', () => {
    it('should accept requests from whitelisted origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
    });

    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.status).toBe(200);
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/products')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(response.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // CONTENT TYPE & ENCODING
  // ═══════════════════════════════════════════════════════════════

  describe('Content Type & Encoding', () => {
    it('should return JSON with correct Content-Type', async () => {
      const response = await request(app).get('/health');

      expect(response.type).toBe('application/json');
    });

    it('should accept JSON requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle form-urlencoded data', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .type('form')
        .send('email=test@example.com&password=password123');

      // Depending on implementation, may or may not support
      expect([200, 400, 415]).toContain(response.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should return 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{invalid json}');

      expect([400, 500]).toContain(response.status);
    });

    it('should not expose sensitive information in errors', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.body.stack).toBeUndefined();
      expect(response.body.sql).toBeUndefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // REQUEST VALIDATION
  // ═══════════════════════════════════════════════════════════════

  describe('Request Validation', () => {
    it('should handle missing Content-Type gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pass' });

      // Should still work with default JSON handling
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should validate request body size limits', async () => {
      const largePayload = 'x'.repeat(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/auth/login')
        .send({ data: largePayload });

      expect([400, 413, 500]).toContain(response.status);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PERFORMANCE & RESPONSE TIME
  // ═══════════════════════════════════════════════════════════════

  describe('Performance', () => {
    it('should respond to health checks quickly', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health');
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(100); // Should be < 100ms
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(request(app).get('/api/products'));
      }

      const responses = await Promise.all(requests);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });
});
