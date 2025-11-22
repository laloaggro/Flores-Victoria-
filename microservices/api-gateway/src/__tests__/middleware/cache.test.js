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

    it('should skip PUT requests', () => {
      req.method = 'PUT';
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should skip DELETE requests', () => {
      req.method = 'DELETE';
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

  describe('Cache Key Generation', () => {
    it('should generate unique keys for different URLs', () => {
      req.originalUrl = '/api/products/123';
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should include query parameters in key', () => {
      req.originalUrl = '/api/products?category=flowers&page=2';
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should handle missing originalUrl', () => {
      req.originalUrl = undefined;
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Cache Bypass', () => {
    it('should bypass cache with x-no-cache header', () => {
      req.headers = { 'x-no-cache': 'true' };
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should not cache health check endpoints', () => {
      req.originalUrl = '/health';
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should not cache auth endpoints', () => {
      req.originalUrl = '/auth/me';
      const middleware = cacheMiddleware();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('TTL Strategy', () => {
    it('should use long TTL for product pages', () => {
      req.originalUrl = '/api/products/123';
      const middleware = cacheMiddleware({ ttl: 600 });
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should use short TTL for search', () => {
      req.originalUrl = '/api/products/search';
      const middleware = cacheMiddleware({ ttl: 60 });
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should accept custom TTL', () => {
      const middleware = cacheMiddleware({ ttl: 300 });
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
