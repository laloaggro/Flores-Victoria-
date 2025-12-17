/**
 * Jest setup file for order-service
 * Mock external dependencies for testing
 */

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// Mock MongoDB (mongoose) para evitar conexiones reales
jest.mock('mongoose', () => {
  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockResolvedValue(0),
  };

  const mockSchema = function () {
    return {
      pre: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      index: jest.fn().mockReturnThis(),
      virtual: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      methods: {},
      statics: {},
    };
  };

  mockSchema.Types = {
    ObjectId: jest.fn().mockImplementation((id) => id),
  };

  return {
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      on: jest.fn(),
      once: jest.fn(),
      readyState: 1,
    },
    Schema: mockSchema,
    model: jest.fn(() => mockModel),
    Model: mockModel,
    disconnect: jest.fn().mockResolvedValue(undefined),
  };
});

// Mock Redis (ioredis)
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    setex: jest.fn().mockResolvedValue('OK'),
    expire: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    decr: jest.fn().mockResolvedValue(0),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn(),
  }));
});

// Silenciar logs durante tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
