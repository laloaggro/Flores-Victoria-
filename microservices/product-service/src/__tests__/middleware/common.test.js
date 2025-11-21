/**
 * Tests para middleware común de product-service
 */

const { errorHandler } = require('../../middleware/common');

describe('Common Middleware - Product Service', () => {
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
    it('should handle generic errors with 500', () => {
      const error = new Error('Database error');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle custom status codes', () => {
      const error = new Error('Product not found');
      error.statusCode = 404;
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle validation errors', () => {
      const error = new Error('Invalid product data');
      error.name = 'ValidationError';
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
