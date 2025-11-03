const Review = require('../../models/Review');

// Mock mongodb ObjectId
jest.mock('mongodb', () => {
  const actualMongodb = jest.requireActual('mongodb');
  return {
    ...actualMongodb,
    ObjectId: jest.fn((id) => ({ _id: id })),
  };
});

describe('Review Model - Unit Tests', () => {
  let mockDb;
  let mockCollection;
  let review;

  beforeEach(() => {
    // Mock collection
    mockCollection = {
      insertOne: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
      createIndex: jest.fn(),
    };

    // Mock database
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    // Create instance
    review = new Review(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with reviews collection', () => {
      expect(mockDb.collection).toHaveBeenCalledWith('reviews');
      expect(review.collection).toBe(mockCollection);
    });
  });

  describe('create', () => {
    it('should create a new review successfully', async () => {
      const reviewData = {
        userId: 'user-123',
        productId: 'product-456',
        rating: 5,
        comment: 'Excelente producto, muy recomendado',
      };

      const mockInsertResult = {
        insertedId: 'review-id-123',
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await review.create(reviewData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        ...reviewData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(result).toEqual({
        id: 'review-id-123',
        ...reviewData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should create review with minimum required fields', async () => {
      const minimalReview = {
        userId: 'user-1',
        productId: 'product-1',
        rating: 4,
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'review-2' });

      const result = await review.create(minimalReview);

      expect(result).toMatchObject({
        id: 'review-2',
        userId: 'user-1',
        productId: 'product-1',
        rating: 4,
      });
    });

    it('should handle rating of 1 (minimum)', async () => {
      const reviewData = {
        userId: 'user-1',
        productId: 'product-1',
        rating: 1,
        comment: 'No me gustó',
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'review-3' });

      const result = await review.create(reviewData);

      expect(result.rating).toBe(1);
    });

    it('should handle rating of 5 (maximum)', async () => {
      const reviewData = {
        userId: 'user-1',
        productId: 'product-1',
        rating: 5,
        comment: '¡Perfecto!',
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'review-4' });

      const result = await review.create(reviewData);

      expect(result.rating).toBe(5);
    });

    it('should handle long comments', async () => {
      const longComment = 'A'.repeat(1000);
      const reviewData = {
        userId: 'user-1',
        productId: 'product-1',
        rating: 4,
        comment: longComment,
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'review-5' });

      const result = await review.create(reviewData);

      expect(result.comment).toBe(longComment);
    });

    it('should handle special characters in comments', async () => {
      const reviewData = {
        userId: 'user-1',
        productId: 'product-1',
        rating: 5,
        comment: 'Excelente! Ñuñoa, "súper" bonito <3',
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'review-6' });

      const result = await review.create(reviewData);

      expect(result.comment).toBe(reviewData.comment);
    });
  });

  describe('findByProductId', () => {
    it('should find reviews by product ID with default pagination', async () => {
      const mockReviews = [
        {
          _id: 'review-1',
          productId: 'product-123',
          userId: 'user-1',
          rating: 5,
          comment: 'Great',
          createdAt: new Date('2024-01-02'),
        },
        {
          _id: 'review-2',
          productId: 'product-123',
          userId: 'user-2',
          rating: 4,
          comment: 'Good',
          createdAt: new Date('2024-01-01'),
        },
      ];

      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockReviews),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await review.findByProductId('product-123');

      expect(mockCollection.find).toHaveBeenCalledWith({
        productId: 'product-123',
      });
      expect(mockCursor.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockCursor.skip).toHaveBeenCalledWith(0);
      expect(mockCursor.limit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('review-1');
      expect(result[0]._id).toBeUndefined();
    });

    it('should handle custom pagination', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      await review.findByProductId('product-123', { page: 2, limit: 5 });

      expect(mockCursor.skip).toHaveBeenCalledWith(5); // (page 2 - 1) * limit 5
      expect(mockCursor.limit).toHaveBeenCalledWith(5);
    });

    it('should return empty array when no reviews found', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await review.findByProductId('non-existent-product');

      expect(result).toEqual([]);
    });

    it('should handle page 1 correctly', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      await review.findByProductId('product-123', { page: 1, limit: 20 });

      expect(mockCursor.skip).toHaveBeenCalledWith(0); // (1 - 1) * 20
      expect(mockCursor.limit).toHaveBeenCalledWith(20);
    });

    it('should handle page 3 correctly', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      await review.findByProductId('product-123', { page: 3, limit: 10 });

      expect(mockCursor.skip).toHaveBeenCalledWith(20); // (3 - 1) * 10
    });
  });

  describe('getAverageRating', () => {
    it('should calculate average rating for a product', async () => {
      const mockAggregateResult = [
        {
          _id: null,
          averageRating: 4.5,
        },
      ];

      const mockCursor = {
        toArray: jest.fn().mockResolvedValue(mockAggregateResult),
      };

      mockCollection.aggregate.mockReturnValue(mockCursor);

      const result = await review.getAverageRating('product-123');

      expect(mockCollection.aggregate).toHaveBeenCalledWith([
        { $match: { productId: 'product-123' } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ]);
      expect(result).toBe(4.5);
    });

    it('should return 0 when no reviews exist for product', async () => {
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockCollection.aggregate.mockReturnValue(mockCursor);

      const result = await review.getAverageRating('product-no-reviews');

      expect(result).toBe(0);
    });

    it('should handle perfect rating (5.0)', async () => {
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([{ _id: null, averageRating: 5.0 }]),
      };

      mockCollection.aggregate.mockReturnValue(mockCursor);

      const result = await review.getAverageRating('product-123');

      expect(result).toBe(5.0);
    });

    it('should handle low rating (1.0)', async () => {
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([{ _id: null, averageRating: 1.0 }]),
      };

      mockCollection.aggregate.mockReturnValue(mockCursor);

      const result = await review.getAverageRating('product-456');

      expect(result).toBe(1.0);
    });

    it('should handle decimal average ratings', async () => {
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([{ _id: null, averageRating: 3.7 }]),
      };

      mockCollection.aggregate.mockReturnValue(mockCursor);

      const result = await review.getAverageRating('product-789');

      expect(result).toBe(3.7);
    });
  });

  describe('createIndexes', () => {
    it('should create all required indexes', async () => {
      mockCollection.createIndex.mockResolvedValue('index_created');

      await review.createIndexes();

      // El modelo crea 6 índices compuestos optimizados
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(6);
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { productId: 1, createdAt: -1 },
        { name: 'product_recent_reviews' }
      );
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { userId: 1, createdAt: -1 },
        { name: 'user_reviews' }
      );
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { productId: 1, rating: -1 },
        { name: 'product_rating_filter' }
      );
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { rating: -1, createdAt: -1 },
        { name: 'top_rated_reviews' }
      );
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { productId: 1, rating: 1 },
        { name: 'rating_aggregations' }
      );
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { productId: 1, verified: 1 },
        {
          name: 'verified_reviews',
          partialFilterExpression: { verified: true },
        }
      );
    });

    it('should handle index creation errors', async () => {
      mockCollection.createIndex.mockRejectedValue(new Error('Index creation failed'));

      await expect(review.createIndexes()).rejects.toThrow('Index creation failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple reviews from same user', async () => {
      const reviews = [
        { userId: 'user-1', productId: 'product-1', rating: 5 },
        { userId: 'user-1', productId: 'product-2', rating: 4 },
        { userId: 'user-1', productId: 'product-3', rating: 3 },
      ];

      mockCollection.insertOne.mockImplementation((data) =>
        Promise.resolve({ insertedId: `review-${data.productId}` })
      );

      for (const reviewData of reviews) {
        const result = await review.create(reviewData);
        expect(result.userId).toBe('user-1');
      }
    });

    it('should handle empty comment', async () => {
      const reviewData = {
        userId: 'user-1',
        productId: 'product-1',
        rating: 4,
        comment: '',
      };

      mockCollection.insertOne.mockResolvedValue({ insertedId: 'review-7' });

      const result = await review.create(reviewData);

      expect(result.comment).toBe('');
    });

    it('should handle product with many reviews (pagination)', async () => {
      const manyReviews = Array.from({ length: 50 }, (_, i) => ({
        _id: `review-${i}`,
        productId: 'popular-product',
        userId: `user-${i}`,
        rating: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date(),
      }));

      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(manyReviews.slice(0, 10)),
      };

      mockCollection.find.mockReturnValue(mockCursor);

      const result = await review.findByProductId('popular-product', {
        page: 1,
        limit: 10,
      });

      expect(result).toHaveLength(10);
    });
  });
});
