/**
 * Tests adicionales para rutas de reviews
 * Enfocados en aumentar coverage del authMiddleware
 */

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock de logger
jest.mock('../../logger.simple', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Reviews Routes - Auth Coverage', () => {
  let app;
  let routerModule;

  beforeEach(() => {
    jest.resetModules();

    // Mock del ReviewController
    jest.mock('../../controllers/reviewController', () => {
      return jest.fn().mockImplementation(() => ({
        getReviewsByProduct: jest.fn((req, res) =>
          res.status(200).json({ status: 'success', data: [] })
        ),
        createReview: jest.fn((req, res) =>
          res.status(201).json({ status: 'success', message: 'Created' })
        ),
      }));
    });

    routerModule = require('../../routes/reviews');

    app = express();
    app.use(express.json());

    // Configurar la base de datos mock
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      }),
    };
    routerModule.setDatabase(mockDb);

    app.use('/api/reviews', routerModule.router);
  });

  describe('GET /api/reviews/product/:productId', () => {
    it('should return reviews without authentication', async () => {
      const res = await request(app).get('/api/reviews/product/123');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('POST /api/reviews/product/:productId', () => {
    it('should reject request without token', async () => {
      const res = await request(app)
        .post('/api/reviews/product/123')
        .send({ rating: 5, comment: 'Great!' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token no proporcionado');
    });

    it('should reject request with invalid token format', async () => {
      const res = await request(app)
        .post('/api/reviews/product/123')
        .set('Authorization', 'InvalidFormat token123')
        .send({ rating: 5, comment: 'Great!' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token no proporcionado');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .post('/api/reviews/product/123')
        .set('Authorization', 'Bearer invalid_token')
        .send({ rating: 5, comment: 'Great!' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token inválido o expirado');
    });

    it('should accept request with valid token', async () => {
      const token = jwt.sign(
        { userId: 'user123', email: 'test@test.com' },
        process.env.JWT_SECRET || 'default_secret'
      );

      const res = await request(app)
        .post('/api/reviews/product/123')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, comment: 'Great!' });

      expect(res.status).toBe(201);
    });
  });

  describe('setDatabase', () => {
    it('should set the database and create controller', () => {
      const mockDb = { collection: jest.fn() };

      expect(() => routerModule.setDatabase(mockDb)).not.toThrow();
    });
  });
});
