/**
 * Tests para middleware común de contact-service
 */

const { errorHandler } = require('../../middleware/common');

describe('Common Middleware - Contact Service', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle generic errors', () => {
      const error = new Error('Test error');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });

    it('should use custom status code', () => {
      const error = new Error('Unauthorized');
      error.statusCode = 401;
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
