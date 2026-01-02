/**
 * Tests de cobertura adicionales para ReviewController
 * Enfocados en aumentar el coverage sin dependencias problemáticas
 */

const ReviewController = require('../../controllers/reviewController');

// Mock logger
jest.mock('../../logger.simple', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('ReviewController - Coverage Tests', () => {
  let controller;
  let mockDb;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock de la base de datos
    mockDb = {
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn(),
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          toArray: jest.fn(),
        }),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn(),
        }),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
        findOne: jest.fn(),
      }),
    };

    controller = new ReviewController(mockDb);

    // Mock de Request/Response
    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { id: 'user123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createReview - validations', () => {
    beforeEach(() => {
      mockReq.params.productId = 'product123';
    });

    it('should reject review without rating', async () => {
      mockReq.body = { comment: 'Great product!' };

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Calificación y comentario son requeridos',
      });
    });

    it('should reject review without comment', async () => {
      mockReq.body = { rating: 5 };

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Calificación y comentario son requeridos',
      });
    });

    it('should reject rating below 1', async () => {
      // rating: 0 es falsy, así que primero falla la validación de requerido
      // Usamos -1 para probar el rango
      mockReq.body = { rating: -1, comment: 'Bad product' };

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'La calificación debe estar entre 1 y 5',
      });
    });

    it('should reject rating above 5', async () => {
      mockReq.body = { rating: 6, comment: 'Amazing!' };

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'La calificación debe estar entre 1 y 5',
      });
    });

    it('should create review with valid data', async () => {
      mockReq.body = { rating: 5, comment: 'Excellent product!' };
      
      const mockReview = {
        id: 'review123',
        productId: 'product123',
        userId: 'user123',
        rating: 5,
        comment: 'Excellent product!',
      };

      // Mock del método create del modelo
      controller.reviewModel.create = jest.fn().mockResolvedValue(mockReview);

      await controller.createReview(mockReq, mockRes);

      expect(controller.reviewModel.create).toHaveBeenCalledWith({
        productId: 'product123',
        userId: 'user123',
        rating: 5,
        comment: 'Excellent product!',
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reseña creada exitosamente',
        data: { review: mockReview },
      });
    });
  });

  describe('getReviewsByProduct - error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockReq.params.productId = 'product123';
      
      // Mock error en el modelo
      controller.reviewModel.findByProductId = jest
        .fn()
        .mockRejectedValue(new Error('Database connection failed'));

      await controller.getReviewsByProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });

    it('should use default pagination values', async () => {
      mockReq.params.productId = 'product123';
      // No query params

      controller.reviewModel.findByProductId = jest.fn().mockResolvedValue([]);
      controller.reviewModel.getAverageRating = jest.fn().mockResolvedValue(0);

      await controller.getReviewsByProduct(mockReq, mockRes);

      expect(controller.reviewModel.findByProductId).toHaveBeenCalledWith('product123', {
        page: 1,
        limit: 10,
      });
    });
  });

  describe('createReview - error handling', () => {
    it('should handle database errors in create', async () => {
      mockReq.params.productId = 'product123';
      mockReq.body = { rating: 5, comment: 'Great!' };

      controller.reviewModel.create = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });
});
