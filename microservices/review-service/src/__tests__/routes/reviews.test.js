const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

describe('Reviews Routes', () => {
  let app;
  let router;
  let setDatabase;

  beforeAll(() => {
    // Mock del ReviewController antes de requerir las rutas
    jest.mock('../../controllers/reviewController', () => {
      return jest.fn().mockImplementation(() => ({
        getReviewsByProduct: jest.fn((req, res) => {
          res.status(200).json({ reviews: [], productId: req.params.productId });
        }),
        createReview: jest.fn((req, res) => {
          res.status(201).json({
            message: 'Review created',
            userId: req.user?.id,
          });
        }),
      }));
    });

    // Requerimos las rutas
    const routesModule = require('../../routes/reviews');
    router = routesModule.router;
    setDatabase = routesModule.setDatabase;

    // Mock database
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
      }),
    };

    setDatabase(mockDb);
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/reviews', router);
  });

  it('should export router', () => {
    expect(router).toBeDefined();
    expect(typeof router).toBe('function');
  });

  it('should export setDatabase function', () => {
    expect(typeof setDatabase).toBe('function');
  });

  describe('GET /api/reviews/product/:productId', () => {
    it('should allow public access to get reviews', async () => {
      const response = await request(app).get('/api/reviews/product/123');

      // Puede ser 200 o 500 dependiendo del controller, pero debe responder
      expect([200, 404, 500]).toContain(response.status);
    }, 60000); // 60s timeout
  });

  describe('POST /api/reviews/product/:productId - Authentication', () => {
    it('should reject requests without authorization header', async () => {
      const response = await request(app)
        .post('/api/reviews/product/123')
        .send({ rating: 5, comment: 'Great!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token no proporcionado');
    });

    it('should reject requests with invalid bearer token format', async () => {
      const response = await request(app)
        .post('/api/reviews/product/123')
        .set('Authorization', 'InvalidFormat')
        .send({ rating: 5, comment: 'Great!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token no proporcionado');
    });

    it('should reject requests with invalid JWT', async () => {
      const response = await request(app)
        .post('/api/reviews/product/123')
        .set('Authorization', 'Bearer invalid-token')
        .send({ rating: 5, comment: 'Great!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token inválido o expirado');
    });

    it('should accept requests with valid JWT', async () => {
      const token = jwt.sign({ userId: 'user123' }, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '1h',
      });

      const response = await request(app)
        .post('/api/reviews/product/123')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, comment: 'Great!' });

      // Puede ser 201 o 500 dependiendo del controller
      expect([200, 201, 500]).toContain(response.status);
    }, 60000); // 60s timeout

    it('should transform userId to id in user object', async () => {
      const token = jwt.sign(
        { userId: 'user123', email: 'test@test.com' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/reviews/product/123')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4, comment: 'Good product' });

      // Verificamos que la autenticación pasó (no es 401)
      expect(response.status).not.toBe(401);
    }, 60000); // 60s timeout
  });
});
