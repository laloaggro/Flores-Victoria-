const ReviewController = require('../../controllers/reviewController');

describe('ReviewController - Unit Tests', () => {
  let reviewController;
  let mockDb;
  let mockReviewModel;
  let req;
  let res;

  beforeEach(() => {
    mockReviewModel = {
      findByProductId: jest.fn(),
      getAverageRating: jest.fn(),
      create: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue({}),
    };
    reviewController = new ReviewController(mockDb);
    reviewController.reviewModel = mockReviewModel;

    req = {
      params: {},
      query: {},
      body: {},
      user: { id: 'user-123', email: 'test@example.com' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getReviewsByProduct', () => {
    it('should return reviews for a product', async () => {
      const mockReviews = [
        { id: '1', rating: 5, comment: 'Great!' },
        { id: '2', rating: 4, comment: 'Good' },
      ];
      req.params.productId = 'product-123';

      mockReviewModel.findByProductId.mockResolvedValue(mockReviews);
      mockReviewModel.getAverageRating.mockResolvedValue(4.5);

      await reviewController.getReviewsByProduct(req, res);

      expect(mockReviewModel.findByProductId).toHaveBeenCalledWith('product-123', {
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          reviews: mockReviews,
          averageRating: 4.5,
          totalCount: 2,
        },
      });
    });

    it('should use pagination parameters from query', async () => {
      req.params.productId = 'product-123';
      req.query = { page: '3', limit: '20' };

      mockReviewModel.findByProductId.mockResolvedValue([]);
      mockReviewModel.getAverageRating.mockResolvedValue(0);

      await reviewController.getReviewsByProduct(req, res);

      expect(mockReviewModel.findByProductId).toHaveBeenCalledWith('product-123', {
        page: '3',
        limit: '20',
      });
    });

    it('should handle errors', async () => {
      req.params.productId = 'product-123';
      mockReviewModel.findByProductId.mockRejectedValue(new Error('Database error'));

      await reviewController.getReviewsByProduct(req, res);

      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });

    it('should return empty reviews with 0 average', async () => {
      req.params.productId = 'product-123';

      mockReviewModel.findByProductId.mockResolvedValue([]);
      mockReviewModel.getAverageRating.mockResolvedValue(0);

      await reviewController.getReviewsByProduct(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          reviews: [],
          averageRating: 0,
          totalCount: 0,
        },
      });
    });
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      req.params.productId = 'product-123';
      req.body = {
        rating: 5,
        comment: 'Excellent product!',
      };

      const createdReview = {
        id: 'review-id',
        productId: 'product-123',
        userId: 'user-123',
        rating: 5,
        comment: 'Excellent product!',
      };

      mockReviewModel.create.mockResolvedValue(createdReview);

      await reviewController.createReview(req, res);

      expect(mockReviewModel.create).toHaveBeenCalledWith({
        productId: 'product-123',
        userId: 'user-123',
        rating: 5,
        comment: 'Excellent product!',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reseña creada exitosamente',
        data: { review: createdReview },
      });
    });

    it('should handle missing rating', async () => {
      req.params.productId = 'product-123';
      req.body = {
        comment: 'Good product',
      };

      await reviewController.createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Calificación y comentario son requeridos',
      });
    });

    it('should handle missing comment', async () => {
      req.params.productId = 'product-123';
      req.body = {
        rating: 5,
      };

      await reviewController.createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Calificación y comentario son requeridos',
      });
    });

    it('should handle database errors on create', async () => {
      req.params.productId = 'product-123';
      req.body = {
        rating: 5,
        comment: 'Great!',
      };

      mockReviewModel.create.mockRejectedValue(new Error('Database error'));

      await reviewController.createReview(req, res);

      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });
});
