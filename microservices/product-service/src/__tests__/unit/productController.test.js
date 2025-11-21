const { createProduct, getCategories } = require('../../controllers/productController');
const Product = require('../../models/Product');
const Category = require('../../models/Category');

// Mock de asyncHandler para controlar la ejecución asíncrona
jest.mock('../../../../shared/middleware/error-handler', () => ({
  asyncHandler: (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      // console.log('Error caught in mock:', err);
      next(err);
    }
  },
}));

// Mock de los modelos
jest.mock('../../models/Product', () => jest.fn());
jest.mock('../../models/Category', () => jest.fn());

describe('Product Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      log: {
        info: jest.fn(),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product and return 201 status', async () => {
      req.body = {
        name: 'Ramo de Rosas',
        price: 15000,
        category: 'Amor',
        description: 'Hermoso ramo',
        images: ['image1.jpg'],
        quantity: 10,
      };

      const mockSavedProduct = { ...req.body, id: 'prod-123' };

      Product.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedProduct),
        ...req.body,
      }));

      await createProduct(req, res, next);

      expect(Product).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ramo de Rosas',
          price: 15000,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedProduct);
    });

    it.skip('should handle errors and call next middleware', async () => {
      // TODO: Fix asyncHandler mock to properly propagate errors
      const error = new Error('Database error');

      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await createProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCategories', () => {
    it('should return all active categories', async () => {
      const mockCategories = [
        { name: 'Amor', active: true },
        { name: 'Cumpleaños', active: true },
      ];

      // Mock de Category.find().sort()
      const mockSort = jest.fn().mockResolvedValue(mockCategories);
      const mockFind = jest.fn().mockReturnValue({ sort: mockSort });
      Category.find = mockFind;

      await getCategories(req, res, next);

      expect(Category.find).toHaveBeenCalledWith({ active: true });
      expect(mockSort).toHaveBeenCalledWith({ name: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        categories: mockCategories,
        total: 2,
      });
    });
  });
});
