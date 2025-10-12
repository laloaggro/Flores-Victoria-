const { ObjectId } = require('mongodb');
const Review = require('../../microservices/review-service/src/models/Review');

// Mock de MongoDB
const mockCollection = {
  insertOne: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn()
};

describe('Review Service - Unit Tests', () => {
  let reviewModel;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };
    
    reviewModel = new Review(mockDb);
    jest.clearAllMocks();
  });

  describe('Review Model', () => {
    describe('create', () => {
      test('should create a new review', async () => {
        const reviewData = {
          userId: 'user123',
          productId: 'product123',
          rating: 5,
          comment: 'Great product!'
        };

        const insertedId = new ObjectId();
        const mockResult = {
          insertedId
        };

        mockCollection.insertOne.mockResolvedValue(mockResult);

        const result = await reviewModel.create(reviewData);

        expect(mockDb.collection).toHaveBeenCalledWith('reviews');
        expect(mockCollection.insertOne).toHaveBeenCalledWith({
          ...reviewData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
        
        expect(result).toEqual({
          id: insertedId,
          ...reviewData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
      });
    });

    describe('findByProductId', () => {
      test('should retrieve reviews by product ID', async () => {
        const productId = 'product123';
        const mockReviews = [
          {
            _id: new ObjectId(),
            userId: 'user123',
            productId,
            rating: 5,
            comment: 'Great product!',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        const expectedReviews = [
          {
            id: mockReviews[0]._id,
            userId: 'user123',
            productId,
            rating: 5,
            comment: 'Great product!',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
          }
        ];

        const mockCursor = {
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockReviews)
        };

        mockCollection.find.mockReturnValue(mockCursor);

        const result = await reviewModel.findByProductId(productId);

        expect(mockDb.collection).toHaveBeenCalledWith('reviews');
        expect(mockCollection.find).toHaveBeenCalledWith({ productId });
        expect(result).toEqual(expectedReviews);
      });

      test('should handle pagination options', async () => {
        const productId = 'product123';
        const options = { page: 2, limit: 5 };

        const mockCursor = {
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue([])
        };

        mockCollection.find.mockReturnValue(mockCursor);

        await reviewModel.findByProductId(productId, options);

        expect(mockCursor.skip).toHaveBeenCalledWith(5); // (page - 1) * limit
        expect(mockCursor.limit).toHaveBeenCalledWith(5);
      });
    });

    describe('findByUserId', () => {
      test('should retrieve reviews by user ID', async () => {
        const userId = 'user123';
        const mockReviews = [
          {
            _id: new ObjectId(),
            userId,
            productId: 'product123',
            rating: 5,
            comment: 'Great product!',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        const expectedReviews = [
          {
            id: mockReviews[0]._id,
            userId,
            productId: 'product123',
            rating: 5,
            comment: 'Great product!',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
          }
        ];

        const mockCursor = {
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue(mockReviews)
        };

        mockCollection.find.mockReturnValue(mockCursor);

        const result = await reviewModel.findByUserId(userId);

        expect(mockDb.collection).toHaveBeenCalledWith('reviews');
        expect(mockCollection.find).toHaveBeenCalledWith({ userId });
        expect(result).toEqual(expectedReviews);
      });
    });

    describe('findById', () => {
      test('should retrieve review by ID', async () => {
        const reviewId = new ObjectId().toString();
        const mockReview = {
          _id: new ObjectId(reviewId),
          userId: 'user123',
          productId: 'product123',
          rating: 5,
          comment: 'Great product!',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const expectedReview = {
          id: new ObjectId(reviewId),
          userId: 'user123',
          productId: 'product123',
          rating: 5,
          comment: 'Great product!',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        };

        mockCollection.findOne.mockResolvedValue(mockReview);

        const result = await reviewModel.findById(reviewId);

        expect(mockDb.collection).toHaveBeenCalledWith('reviews');
        expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(reviewId) });
        expect(result).toEqual(expectedReview);
      });
    });

    describe('update', () => {
      test('should update review', async () => {
        const reviewId = new ObjectId().toString();
        const updateData = {
          rating: 4,
          comment: 'Updated review'
        };

        const mockResult = {
          modifiedCount: 1
        };

        mockCollection.updateOne.mockResolvedValue(mockResult);

        const result = await reviewModel.update(reviewId, updateData);

        expect(mockDb.collection).toHaveBeenCalledWith('reviews');
        expect(mockCollection.updateOne).toHaveBeenCalledWith(
          { _id: new ObjectId(reviewId) },
          { $set: { ...updateData, updatedAt: expect.any(Date) } }
        );
        expect(result).toEqual(mockResult);
      });
    });

    describe('delete', () => {
      test('should delete review', async () => {
        const reviewId = new ObjectId().toString();
        const mockResult = {
          deletedCount: 1
        };

        mockCollection.deleteOne.mockResolvedValue(mockResult);

        const result = await reviewModel.delete(reviewId);

        expect(mockDb.collection).toHaveBeenCalledWith('reviews');
        expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: new ObjectId(reviewId) });
        expect(result).toEqual(mockResult);
      });
    });
  });
});