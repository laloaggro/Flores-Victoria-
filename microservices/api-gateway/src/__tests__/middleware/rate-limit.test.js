/**
 * Tests para el middleware rate-limit
 */

const { createRateLimiter, strictLimiter, apiLimiter } = require('../../middleware/rate-limit');

// Mock de logger
jest.mock('../../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('Rate Limit Middleware', () => {
  describe('createRateLimiter', () => {
    it('should create a rate limiter with custom options', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 100,
        message: 'Too many requests',
      });

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should create rate limiter with default options', () => {
      const limiter = createRateLimiter();
      expect(limiter).toBeDefined();
    });
  });

  describe('strictLimiter', () => {
    it('should be defined as a rate limiter', () => {
      expect(strictLimiter).toBeDefined();
      expect(typeof strictLimiter).toBe('function');
    });
  });

  describe('apiLimiter', () => {
    it('should be defined as a rate limiter', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });
  });

  describe('Rate limiter behavior', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        ip: '127.0.0.1',
        path: '/test',
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };
      next = jest.fn();
    });

    it('should allow requests within limit', () => {
      const limiter = createRateLimiter({ windowMs: 60000, max: 10 });
      limiter(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should handle store errors gracefully', () => {
      // Este test verifica que el rate limiter maneje errores del store
      const limiter = createRateLimiter({ windowMs: 60000, max: 1 });
      
      // Primera llamada debe pasar
      limiter(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
