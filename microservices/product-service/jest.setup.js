/**
 * Jest setup file
 * Mock external dependencies for testing
 */

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// Mock Mongoose to avoid MongoDB connection attempts
jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation(function () {
    this.index = jest.fn();
    this.pre = jest.fn();
    this.post = jest.fn();
    this.virtual = jest.fn().mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
    });
    this.plugin = jest.fn();
    this.methods = {};
    this.statics = {};
    return this;
  });

  mockSchema.Types = {
    ObjectId: jest.fn(),
  };

  return {
    connect: jest.fn().mockResolvedValue(undefined),
    connection: {
      readyState: 1,
      on: jest.fn(),
    },
    model: jest.fn(),
    Schema: mockSchema,
  };
});

// Mock Redis cache service to avoid connection attempts
jest.mock('./src/services/cacheService', () => {
  const mockCacheService = {
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    isConnected: false,
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    generateProductKey: jest.fn().mockReturnValue('test-cache-key'),
    invalidateProductCache: jest.fn().mockResolvedValue(true),
  };

  const mockCacheMiddleware = jest.fn(() => (req, res, next) => next());

  return {
    cacheService: mockCacheService,
    cacheMiddleware: mockCacheMiddleware,
  };
});
