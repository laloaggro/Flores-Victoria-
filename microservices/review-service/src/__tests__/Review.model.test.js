/**
 * Tests completos para Review Model
 */

const { ObjectId } = require('mongodb');
const Review = require('../models/Review');

// Mock logger
jest.mock('../logger.simple', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Review Model', () => {
  let reviewModel;
  let mockCollection;
  let mockDb;

  beforeEach(() => {
    // Mock de la colección
    mockCollection = {
      insertOne: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
      createIndex: jest.fn().mockResolvedValue(true),
    };

    // Mock de la base de datos
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    reviewModel = new Review(mockDb);
  });

  describe('constructor', () => {
    it('should initialize with reviews collection', () => {
      expect(mockDb.collection).toHaveBeenCalledWith('reviews');
    });
  });

  describe('create', () => {
    it('should create a review successfully', async () => {
      const mockInsertedId = new ObjectId();
      const reviewData = {
        productId: 'product123',
        userId: 'user123',
        rating: 5,
        comment: 'Great product!',
      };

      mockCollection.insertOne.mockResolvedValue({
        insertedId: mockInsertedId,
      });

      const result = await reviewModel.create(reviewData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'product123',
          userId: 'user123',
          rating: 5,
          comment: 'Great product!',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(result.id).toBe(mockInsertedId);
      expect(result.productId).toBe('product123');
    });

    it('should include timestamps in created review', async () => {
      const mockInsertedId = new ObjectId();
      mockCollection.insertOne.mockResolvedValue({
        insertedId: mockInsertedId,
      });

      const before = new Date();
      const result = await reviewModel.create({ rating: 4, comment: 'Good' });
      const after = new Date();

      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('findByProductId', () => {
    let mockCursor;

    beforeEach(() => {
      mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn(),
      };
      mockCollection.find.mockReturnValue(mockCursor);
    });

    it('should find reviews by product ID', async () => {
      const mockReviews = [
        { _id: new ObjectId(), productId: 'product123', rating: 5, comment: 'Great' },
        { _id: new ObjectId(), productId: 'product123', rating: 4, comment: 'Good' },
      ];
      mockCursor.toArray.mockResolvedValue(mockReviews);

      const result = await reviewModel.findByProductId('product123');

      expect(mockCollection.find).toHaveBeenCalledWith(
        { productId: 'product123' },
        { projection: expect.any(Object) }
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      // _id is set to undefined, so we check the value instead
      expect(result[0]._id).toBeUndefined();
    });

    it('should apply default pagination', async () => {
      mockCursor.toArray.mockResolvedValue([]);

      await reviewModel.findByProductId('product123');

      expect(mockCursor.skip).toHaveBeenCalledWith(0);
      expect(mockCursor.limit).toHaveBeenCalledWith(10);
    });

    it('should apply custom pagination', async () => {
      mockCursor.toArray.mockResolvedValue([]);

      await reviewModel.findByProductId('product123', { page: 3, limit: 20 });

      expect(mockCursor.skip).toHaveBeenCalledWith(40); // (3-1) * 20
      expect(mockCursor.limit).toHaveBeenCalledWith(20);
    });

    it('should sort by createdAt descending', async () => {
      mockCursor.toArray.mockResolvedValue([]);

      await reviewModel.findByProductId('product123');

      expect(mockCursor.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should transform _id to id in results', async () => {
      const mockId = new ObjectId();
      mockCursor.toArray.mockResolvedValue([{ _id: mockId, productId: 'product123', rating: 5 }]);

      const result = await reviewModel.findByProductId('product123');

      expect(result[0].id).toEqual(mockId);
      expect(result[0]._id).toBeUndefined();
    });
  });

  describe('getAverageRating', () => {
    it('should calculate average rating', async () => {
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([{ _id: null, averageRating: 4.5 }]),
      });

      const result = await reviewModel.getAverageRating('product123');

      expect(result).toBe(4.5);
      expect(mockCollection.aggregate).toHaveBeenCalledWith([
        { $match: { productId: 'product123' } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ]);
    });

    it('should return 0 for products with no reviews', async () => {
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await reviewModel.getAverageRating('product123');

      expect(result).toBe(0);
    });
  });

  describe('createIndexes', () => {
    it('should create all required indexes', async () => {
      await reviewModel.createIndexes();

      expect(mockCollection.createIndex).toHaveBeenCalledTimes(6);
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { productId: 1, createdAt: -1 },
        { name: 'product_recent_reviews' }
      );
      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { userId: 1, createdAt: -1 },
        { name: 'user_reviews' }
      );
    });
  });
});
