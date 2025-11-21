/**
 * Tests para el middleware wellKnown
 */

const { wellKnownMiddleware } = require('../../middleware/wellKnown');

describe('Well-Known Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: '/',
    };
    res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('wellKnownMiddleware', () => {
    it('should handle /.well-known/change-password', () => {
      req.path = '/.well-known/change-password';
      wellKnownMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          changePassword: expect.any(String),
        })
      );
    });

    it('should pass through for non well-known paths', () => {
      req.path = '/api/test';
      wellKnownMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle /.well-known/security.txt', () => {
      req.path = '/.well-known/security.txt';
      wellKnownMiddleware(req, res, next);

      // Depends on implementation - either next() or response
      expect(next).toHaveBeenCalled();
    });
  });
});
