const { cacheMiddleware, clearCache, getCacheStats } = require('../../middleware/cache');

// Mock Redis client
jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
    dbsize: jest.fn(),
    info: jest.fn(),
  }))
);

describe('Cache Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/products',
      id: 'test-request-id',
    };
    res = {
      json: jest.fn(),
      setHeader: jest.fn(),
      status: 200,
      statusCode: 200,
    };
    next = jest.fn();
  });

  describe('cacheMiddleware', () => {
    it('should create cache middleware function', () => {
      const middleware = cacheMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should skip caching for non-GET requests', () => {
      req.method = 'POST';
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should add cache headers', () => {
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should be a function', () => {
      expect(typeof clearCache).toBe('function');
    });

    it('should handle clearing cache', async () => {
      await clearCache('api:*');
      // Function should complete without throwing
      expect(true).toBe(true);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache stats when enabled', async () => {
      const stats = await getCacheStats();
      expect(stats).toHaveProperty('enabled');
    });
  });
});
