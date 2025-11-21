const {
  requestIdMiddleware,
  requestLogger,
  propagateRequestId,
} = require('../../../middleware/request-id');

// Mock the shared logger module
jest.mock('../../../../../../shared/logging/logger', () => ({
  createLogger: jest.fn(() => ({
    withRequestId: jest.fn(() => ({
      info: jest.fn(),
    })),
    info: jest.fn(),
  })),
}));

describe('Request ID Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      get: jest.fn(),
      headers: {},
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
    };
    res = {
      setHeader: jest.fn(),
      on: jest.fn(),
      statusCode: 200,
    };
    next = jest.fn();
  });

  describe('requestIdMiddleware', () => {
    it('should generate a new request ID if not present', () => {
      req.get.mockReturnValue(undefined);

      requestIdMiddleware(req, res, next);

      expect(req.id).toBeDefined();
      expect(typeof req.id).toBe('string');
      expect(req.headers['x-request-id']).toBe(req.id);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.id);
      expect(next).toHaveBeenCalled();
    });

    it('should use existing request ID from header', () => {
      const existingId = 'existing-request-id-123';
      req.get.mockReturnValue(existingId);

      requestIdMiddleware(req, res, next);

      expect(req.id).toBe(existingId);
      expect(req.headers['x-request-id']).toBe(existingId);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', existingId);
      expect(next).toHaveBeenCalled();
    });

    it('should set request ID in response headers', () => {
      req.get.mockReturnValue(undefined);

      requestIdMiddleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
    });

    it('should handle readonly headers gracefully', () => {
      req.get.mockReturnValue(undefined);
      req.headers = Object.freeze({});

      expect(() => requestIdMiddleware(req, res, next)).not.toThrow();
      expect(next).toHaveBeenCalled();
    });

    it('should call next middleware', () => {
      req.get.mockReturnValue(undefined);

      requestIdMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestLogger', () => {
    it('should log request completion', () => {
      req.id = 'test-request-id';
      req.originalUrl = '/api/test';

      requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should capture response duration on finish', () => {
      req.id = 'test-request-id';
      req.originalUrl = '/api/test';
      let finishCallback;

      res.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      requestLogger(req, res, next);

      expect(finishCallback).toBeDefined();
      expect(() => finishCallback()).not.toThrow();
    });

    it('should use req.url if originalUrl not present', () => {
      req.id = 'test-request-id';
      delete req.originalUrl;

      requestLogger(req, res, next);

      expect(res.on).toHaveBeenCalled();
    });
  });

  describe('propagateRequestId', () => {
    it('should set request ID header on proxy request', () => {
      const proxyReq = {
        setHeader: jest.fn(),
      };
      req.id = 'test-request-id';

      propagateRequestId(proxyReq, req);

      expect(proxyReq.setHeader).toHaveBeenCalledWith('X-Request-ID', 'test-request-id');
    });

    it('should not set header if request ID is missing', () => {
      const proxyReq = {
        setHeader: jest.fn(),
      };
      req.id = undefined;

      propagateRequestId(proxyReq, req);

      expect(proxyReq.setHeader).not.toHaveBeenCalled();
    });

    it('should handle null request ID', () => {
      const proxyReq = {
        setHeader: jest.fn(),
      };
      req.id = null;

      propagateRequestId(proxyReq, req);

      expect(proxyReq.setHeader).not.toHaveBeenCalled();
    });
  });
});
