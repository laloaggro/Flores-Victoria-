/**
 * Tests completos para Review Service - Controlador
 */

const ReviewController = require('../controllers/reviewController');

// Mock logger
jest.mock('../logger.simple', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('ReviewController', () => {
  let controller;
  let mockReviewModel;
  let mockDb;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Mock del modelo
    mockReviewModel = {
      findByProductId: jest.fn(),
      getAverageRating: jest.fn(),
      create: jest.fn(),
    };

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
      }),
    };

    controller = new ReviewController(mockDb);
    // Reemplazar el modelo con nuestro mock
    controller.reviewModel = mockReviewModel;

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

  describe('getReviewsByProduct', () => {
    it('should return reviews for a product', async () => {
      mockReq.params.productId = 'product123';
      const mockReviews = [
        { id: '1', rating: 5, comment: 'Great!' },
        { id: '2', rating: 4, comment: 'Good' },
      ];

      mockReviewModel.findByProductId.mockResolvedValue(mockReviews);
      mockReviewModel.getAverageRating.mockResolvedValue(4.5);

      await controller.getReviewsByProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          reviews: mockReviews,
          averageRating: 4.5,
          totalCount: 2,
        },
      });
    });

    it('should handle pagination parameters', async () => {
      mockReq.params.productId = 'product123';
      mockReq.query = { page: '2', limit: '5' };
      mockReviewModel.findByProductId.mockResolvedValue([]);
      mockReviewModel.getAverageRating.mockResolvedValue(0);

      await controller.getReviewsByProduct(mockReq, mockRes);

      expect(mockReviewModel.findByProductId).toHaveBeenCalledWith('product123', {
        page: '2',
        limit: '5',
      });
    });

    it('should return empty data for products with no reviews', async () => {
      mockReq.params.productId = 'product123';
      mockReviewModel.findByProductId.mockResolvedValue([]);
      mockReviewModel.getAverageRating.mockResolvedValue(0);

      await controller.getReviewsByProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          reviews: [],
          averageRating: 0,
          totalCount: 0,
        },
      });
    });

    it('should handle database errors', async () => {
      mockReq.params.productId = 'product123';
      mockReviewModel.findByProductId.mockRejectedValue(new Error('DB Error'));

      await controller.getReviewsByProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });

  describe('createReview', () => {
    beforeEach(() => {
      mockReq.params.productId = 'product123';
      mockReq.body = { rating: 5, comment: 'Excellent product!' };
    });

    it('should create a review successfully', async () => {
      const mockCreatedReview = {
        id: 'review123',
        productId: 'product123',
        userId: 'user123',
        rating: 5,
        comment: 'Excellent product!',
        createdAt: new Date(),
      };

      mockReviewModel.create.mockResolvedValue(mockCreatedReview);

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reseña creada exitosamente',
        data: { review: mockCreatedReview },
      });
    });

    it('should reject when rating is missing', async () => {
      mockReq.body = { comment: 'No rating' };

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Calificación y comentario son requeridos',
      });
    });

    it('should reject when comment is missing', async () => {
      mockReq.body = { rating: 5 };

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Calificación y comentario son requeridos',
      });
    });

    it('should reject rating of 0 as not provided', async () => {
      // 0 is falsy in JavaScript, so it's treated as "not provided"
      mockReq.body = { rating: 0, comment: 'Bad' };

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Calificación y comentario son requeridos',
      });
    });

    it('should reject rating greater than 5', async () => {
      mockReq.body = { rating: 6, comment: 'Too good!' };

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'La calificación debe estar entre 1 y 5',
      });
    });

    it('should handle database errors when creating', async () => {
      mockReviewModel.create.mockRejectedValue(new Error('Insert failed'));

      await controller.createReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });

    it('should use user id from request', async () => {
      mockReq.user = { id: 'customUserId' };
      mockReviewModel.create.mockResolvedValue({ id: '1' });

      await controller.createReview(mockReq, mockRes);

      expect(mockReviewModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'customUserId',
        })
      );
    });
  });
});
