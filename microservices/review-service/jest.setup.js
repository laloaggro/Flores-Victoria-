/**
 * Jest setup file for Review Service
 * Mock external dependencies for testing
 */

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
process.env.PORT = '3007';
process.env.VALKEY_HOST = 'localhost';
process.env.VALKEY_PORT = '6379';

// Aumentar timeout para tests
jest.setTimeout(10000);

// Silenciar logs durante tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
