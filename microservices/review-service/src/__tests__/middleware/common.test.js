/**
 * Tests para middleware común de review-service
 */

const { errorHandler } = require('../../middleware/common');

describe('Common Middleware - Review Service', () => {
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
    it('should handle errors with default 500 status', () => {
      const error = new Error('Test error');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });

    it('should respect custom status codes', () => {
      const error = new Error('Bad request');
      error.statusCode = 400;
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle MongoDB errors', () => {
      const error = new Error('Duplicate key');
      error.code = 11000;
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });
});
