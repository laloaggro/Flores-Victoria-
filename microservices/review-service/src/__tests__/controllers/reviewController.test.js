const {
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
  getUserReviews,
} = require('../../controllers/reviewController');

jest.mock('../../models/Review');
const Review = require('../../models/Review');

describe('Review Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 'user123' },
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      req.body = {
        productId: 'prod123',
        rating: 5,
        comment: 'Excellent product!',
      };

      const mockReview = {
        _id: 'review123',
        ...req.body,
        userId: 'user123',
        save: jest.fn().mockResolvedValue(true),
      };

      Review.mockImplementation(() => mockReview);

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
        })
      );
    });

    it('should validate required fields', async () => {
      req.body = {};

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getReviewsByProduct', () => {
    it('should get all reviews for a product', async () => {
      req.params.productId = 'prod123';
      const mockReviews = [
        { _id: 'rev1', rating: 5, comment: 'Great' },
        { _id: 'rev2', rating: 4, comment: 'Good' },
      ];

      Review.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockReviews),
      });

      await getReviewsByProduct(req, res);

      expect(Review.find).toHaveBeenCalledWith({ productId: 'prod123' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateReview', () => {
    it('should update a review', async () => {
      req.params.id = 'review123';
      req.body = { rating: 4, comment: 'Updated comment' };

      const mockReview = {
        _id: 'review123',
        userId: 'user123',
        ...req.body,
        save: jest.fn().mockResolvedValue(true),
      };

      Review.findById = jest.fn().mockResolvedValue(mockReview);

      await updateReview(req, res);

      expect(mockReview.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if review not found', async () => {
      req.params.id = 'nonexistent';
      Review.findById = jest.fn().mockResolvedValue(null);

      await updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteReview', () => {
    it('should delete a review', async () => {
      req.params.id = 'review123';

      const mockReview = {
        _id: 'review123',
        userId: 'user123',
        deleteOne: jest.fn().mockResolvedValue(true),
      };

      Review.findById = jest.fn().mockResolvedValue(mockReview);

      await deleteReview(req, res);

      expect(mockReview.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getUserReviews', () => {
    it('should get all reviews by user', async () => {
      const mockReviews = [
        { _id: 'rev1', productId: 'prod1', rating: 5 },
        { _id: 'rev2', productId: 'prod2', rating: 4 },
      ];

      Review.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockReviews),
      });

      await getUserReviews(req, res);

      expect(Review.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
