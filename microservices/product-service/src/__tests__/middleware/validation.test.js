const validation = require('../../middleware/validation');

describe('Product Validation Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      method: 'POST',
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('validateProduct', () => {
    it('should be a function', () => {
      expect(typeof validation.validateProduct).toBe('function');
    });

    it('should call next for valid product data', () => {
      mockReq.body = {
        id: 'prod-123',
        name: 'Rosas Rojas',
        description: 'Hermoso ramo de 12 rosas rojas',
        price: 5000,
        category: 'ramos',
        stock: 10,
      };

      validation.validateProduct(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', () => {
      mockReq.body = {
        name: 'Test',
        // Missing required fields
      };

      validation.validateProduct(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateFilters', () => {
    it('should be a function', () => {
      expect(typeof validation.validateFilters).toBe('function');
    });

    it('should call next for valid filters', () => {
      mockReq.query = {
        category: 'ramos',
        minPrice: '1000',
        maxPrice: '5000',
        page: '1',
        limit: '10',
      };

      validation.validateFilters(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 for invalid filters', () => {
      mockReq.query = {
        minPrice: 'invalid',
        limit: '200', // Exceeds max
      };

      validation.validateFilters(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateProductId', () => {
    it('should be a function', () => {
      expect(typeof validation.validateProductId).toBe('function');
    });

    it('should call next for valid product ID', () => {
      mockReq.params = { id: 'valid-id-123' };

      validation.validateProductId(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
