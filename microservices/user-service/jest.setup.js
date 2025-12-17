/**
 * Jest setup file
 * Mock external dependencies for testing
 */

// Mock Jaeger tracer using the moduleNameMapper path
jest.mock('../shared/tracing/index.js', () => ({
  initTracer: jest.fn(),
  middleware: jest.fn(() => (req, res, next) => next()),
  init: jest.fn(),
  getTracer: jest.fn(() => null),
}), { virtual: true });

// Also mock the @flores-victoria/tracing alias
jest.mock('@flores-victoria/tracing', () => ({
  initTracer: jest.fn(),
  middleware: jest.fn(() => (req, res, next) => next()),
  init: jest.fn(),
  getTracer: jest.fn(() => null),
}), { virtual: true });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
