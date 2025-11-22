/**
 * Jest setup file for Review Service
 * Mock external dependencies for testing
 */

// Mock Jaeger tracer
jest.mock('jaeger-client', () => ({
  initTracer: jest.fn(() => ({
    close: jest.fn(),
  })),
  initTracerFromEnv: jest.fn(() => ({
    close: jest.fn(),
  })),
}));

// Mock opentracing
jest.mock('opentracing', () => ({
  globalTracer: jest.fn(() => ({
    startSpan: jest.fn(() => ({
      setTag: jest.fn(),
      log: jest.fn(),
      finish: jest.fn(),
    })),
  })),
  Tags: {
    SPAN_KIND: 'span.kind',
    HTTP_METHOD: 'http.method',
    HTTP_URL: 'http.url',
    HTTP_STATUS_CODE: 'http.status_code',
  },
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3007';
process.env.MONGODB_URI = 'mongodb://localhost:27017/flores_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
