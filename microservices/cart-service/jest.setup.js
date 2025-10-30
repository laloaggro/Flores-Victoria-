/**
 * Jest setup file for cart-service
 * Mock external dependencies for testing
 */

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Mock Redis to avoid connection attempts
jest.mock('./src/config/redis', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    isOpen: true,
    quit: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    on: jest.fn(),
  };

  return {
    getClient: jest.fn().mockReturnValue(mockClient),
    initRedis: jest.fn().mockResolvedValue(mockClient),
    closeRedis: jest.fn().mockResolvedValue(undefined),
  };
});
