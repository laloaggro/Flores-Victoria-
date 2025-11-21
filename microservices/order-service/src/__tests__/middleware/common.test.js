/**
 * Tests para middleware común de order-service
 */

const { errorHandler, validateOrderData } = require('../../middleware/common');

describe('Common Middleware - Order Service', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { userId: '123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle generic errors with 500 status', () => {
      const error = new Error('Test error');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
        })
      );
    });

    it('should use custom status code if provided', () => {
      const error = new Error('Not found');
      error.statusCode = 404;
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle validation errors with 400 status', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateOrderData', () => {
    it('should pass valid order data', () => {
      req.body = {
        items: [{ productId: '1', quantity: 2, price: 10 }],
        total: 20,
        shippingAddress: 'Test Address',
        paymentMethod: 'credit_card',
      };

      if (validateOrderData) {
        validateOrderData(req, res, next);
        expect(next).toHaveBeenCalled();
      }
    });

    it('should reject order without items', () => {
      req.body = {
        total: 20,
        shippingAddress: 'Test Address',
        paymentMethod: 'credit_card',
      };

      if (validateOrderData) {
        validateOrderData(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });
  });
});
