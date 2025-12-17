const { requestIdMiddleware, requestLogger } = require('../../middleware/request-id');

describe('Request ID Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      method: 'GET',
      originalUrl: '/api/test',
      get: jest.fn((headerName) => {
        const lowerName = headerName.toLowerCase();
        return req.headers[lowerName] || req.headers[headerName];
      }),
    };
    res = {
      setHeader: jest.fn(),
      on: jest.fn(),
    };
    next = jest.fn();
  });

  describe('requestIdMiddleware', () => {
    it('should generate request ID if not provided', () => {
      requestIdMiddleware(req, res, next);

      expect(req.id).toBeDefined();
      expect(typeof req.id).toBe('string');
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.id);
      expect(next).toHaveBeenCalled();
    });

    it('should use existing request ID from header', () => {
      const existingId = 'existing-request-id';
      req.headers['x-request-id'] = existingId;

      requestIdMiddleware(req, res, next);

      expect(req.id).toBe(existingId);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', existingId);
      expect(next).toHaveBeenCalled();
    });

    it('should handle uppercase header name', () => {
      const existingId = 'test-id';
      req.headers['X-Request-ID'] = existingId;

      requestIdMiddleware(req, res, next);

      expect(req.id).toBe(existingId);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requestLogger', () => {
    it('should log request details', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      req.id = 'test-request-id';
      req.method = 'POST';
      req.originalUrl = '/api/products';

      requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should attach finish handler to response', () => {
      req.id = 'test-request-id';

      requestLogger(req, res, next);

      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(next).toHaveBeenCalled();
    });

    it('should handle missing request ID', () => {
      requestLogger(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should work with both middlewares together', () => {
      // First middleware adds ID
      requestIdMiddleware(req, res, next);
      expect(req.id).toBeDefined();

      // Second middleware logs it
      requestLogger(req, res, next);
      expect(next).toHaveBeenCalledTimes(2);
    });
  });
});
