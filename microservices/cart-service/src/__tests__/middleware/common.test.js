/**
 * Tests para el middleware común de cart-service
 */

const { errorHandler, requestLogger, validateRequest } = require('../../middleware/common');

describe('Common Middleware - Cart Service', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test',
      body: {},
      get: jest.fn(),
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
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.any(String),
        })
      );
    });

    it('should handle errors with status code', () => {
      const error = new Error('Not found');
      error.statusCode = 404;
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle validation errors', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('requestLogger', () => {
    it('should log incoming requests', () => {
      requestLogger(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateRequest', () => {
    it('should pass valid requests', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      };
      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid requests', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({
          error: { details: [{ message: 'Invalid data' }] },
        }),
      };
      const middleware = validateRequest(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
