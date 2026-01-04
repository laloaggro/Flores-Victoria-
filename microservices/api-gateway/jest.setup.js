/**
 * Jest setup file for API Gateway
 * Mock external dependencies for testing
 */

// Mock Redis client
jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
  }))
);

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PORT = '3000';
process.env.VALKEY_HOST = 'localhost';
process.env.VALKEY_PORT = '6379';

// Service URLs
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.USER_SERVICE_URL = 'http://localhost:3002';
process.env.PRODUCT_SERVICE_URL = 'http://localhost:3009';
process.env.ORDER_SERVICE_URL = 'http://localhost:3004';
process.env.CART_SERVICE_URL = 'http://localhost:3005';
process.env.WISHLIST_SERVICE_URL = 'http://localhost:3006';
process.env.REVIEW_SERVICE_URL = 'http://localhost:3007';
process.env.CONTACT_SERVICE_URL = 'http://localhost:3008';
