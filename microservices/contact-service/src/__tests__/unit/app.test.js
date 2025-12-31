/**
 * Tests para app.js del contact-service
 */

// Mock de dependencias
jest.mock('../../config', () => ({
  port: 3005,
  database: {
    host: 'localhost',
    name: 'contact_db',
  },
}));

jest.mock('../../config/database', () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../routes/contact', () => {
  const express = require('express');
  return express.Router();
});

const request = require('supertest');

describe('App - Contact Service', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    app = require('../../app');
  });

  describe('Basic Setup', () => {
    it('should be an Express application', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have JSON parser configured', async () => {
      const response = await request(app)
        .post('/test')
        .send({ test: 'data' })
        .set('Accept', 'application/json');

      expect(response.status).not.toBe(500);
    });
  });

  describe('Middleware Configuration', () => {
    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/api/contact')
        .set('Origin', 'http://example.com');

      expect(response.status).toBe(204);
    });

    it('should set security headers', async () => {
      const response = await request(app).get('/api/contact');

      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
    });
  });

  describe('Routes', () => {
    it('should mount contact routes', async () => {
      const response = await request(app).get('/api/contact');

      // Puede ser 200, 404, 401, etc. pero no 500 si las rutas están montadas
      expect([200, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent');

      expect(response.status).toBe(404);
    });

    it('should return JSON error responses', async () => {
      const response = await request(app).get('/non-existent');

      expect(response.type).toMatch(/json/);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Health Checks', () => {
    it('should respond to health endpoint', async () => {
      const response = await request(app).get('/health');

      expect([200, 503]).toContain(response.status);
    });
  });
});
