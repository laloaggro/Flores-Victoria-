/**
 * Jest setup file
 * Mock external dependencies for testing
 */

// Mock Jaeger tracer
jest.mock('@flores-victoria/tracing', () => ({
  initTracer: jest.fn(),
  middleware: jest.fn(() => (req, res, next) => next()),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
