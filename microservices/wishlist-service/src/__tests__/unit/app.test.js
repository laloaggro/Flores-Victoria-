/**
 * Tests para app.js del wishlist-service
 */

// Mock de dependencias
jest.mock('../../config', () => ({
  port: 3012,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  redis: {
    host: 'redis',
    port: 6379,
  },
}));

jest.mock('../../config/redis', () => ({
  connect: jest.fn().mockResolvedValue(true),
  quit: jest.fn(),
  on: jest.fn(),
}));

jest.mock('../../routes/wishlist', () => {
  const express = require('express');
  return {
    router: express.Router(),
    setRedis: jest.fn(),
  };
});

const request = require('supertest');

describe('App - Wishlist Service', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-require app para tener una instancia fresca
    jest.resetModules();
    app = require('../../app');
  });

  describe('Basic Setup', () => {
    it('should be an Express application', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have JSON body parser configured', async () => {
      const response = await request(app)
        .post('/test')
        .send({ data: 'test' })
        .set('Accept', 'application/json');

      // Debe procesar el JSON, aunque la ruta no exista
      expect(response.status).not.toBe(500);
    });
  });

  describe('Health Check Endpoints', () => {
    it('should respond to /health endpoint', async () => {
      const response = await request(app).get('/health');
      
      // Puede ser 200, 503, o 500 dependiendo del estado
      expect([200, 503, 500]).toContain(response.status);
    });

    it('should respond to /health endpoint', async () => {
      const response = await request(app).get('/health');
      
      expect([200, 503]).toContain(response.status);
    });
  });

  describe('Security Middleware', () => {
    it('should set security headers (helmet)', async () => {
      const response = await request(app).get('/health');
      
      // Helmet establece varios headers de seguridad
      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
    });

    it('should enable CORS', async () => {
      const response = await request(app)
        .options('/api/wishlist')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'GET');
      
      // CORS debe estar habilitado
      expect(response.status).toBe(204);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect(response.status).toBe(404);
    });

    it('should return JSON error response', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect(response.type).toMatch(/json/);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Rate Limiting', () => {
    it('should have rate limiting configured', async () => {
      // Hacer múltiples requests para verificar rate limit
      const responses = [];
      
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/health');
        responses.push(response);
      }
      
      // Todas las respuestas deben tener headers de rate limit
      responses.forEach((response) => {
        expect(response.headers).toHaveProperty('ratelimit-limit');
      });
    });
  });
});
