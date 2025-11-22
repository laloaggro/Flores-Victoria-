/**
 * Comprehensive tests for Product Controller
 * Target: 23.48% → 80% coverage
 */

const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Occasion = require('../../models/Occasion');
const { cacheService } = require('../../services/cacheService');

// Mock dependencies
jest.mock('../../models/Product');
jest.mock('../../models/Category');
jest.mock('../../models/Occasion');
jest.mock('../../services/cacheService');

// Import controller after mocks
const productController = require('../../controllers/productController');

describe('ProductController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      log: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('Module exports', () => {
    it('should export all controller functions', () => {
      expect(productController).toHaveProperty('createProduct');
      expect(productController).toHaveProperty('getCategories');
      expect(productController).toHaveProperty('getOccasions');
      expect(productController).toHaveProperty('getStats');
      expect(productController).toHaveProperty('getFeaturedProducts');
      expect(productController).toHaveProperty('getProductsByOccasion');
      expect(productController).toHaveProperty('getProductsByCategory');
      expect(productController).toHaveProperty('searchProducts');
      expect(productController).toHaveProperty('getProducts');
      expect(productController).toHaveProperty('getProductById');
      expect(productController).toHaveProperty('updateProduct');
      expect(productController).toHaveProperty('deleteProduct');
      expect(productController).toHaveProperty('seedDatabase');
      expect(productController).toHaveProperty('createIndexes');
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const productData = {
        name: 'Rosa Roja Premium',
        price: 2999,
        category: 'Rosas',
        description: 'Hermosa rosa roja',
        images: ['image1.jpg'],
        quantity: 10,
      };

      req.body = productData;

      const mockProduct = {
        id: 'prod-123',
        ...productData,
      };

      const mockSave = jest.fn().mockResolvedValue(mockProduct);
      Product.mockImplementation(() => ({ save: mockSave }));

      await productController.createProduct(req, res);

      expect(Product).toHaveBeenCalledWith(productData);
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
      expect(req.log.info).toHaveBeenCalled();
    });

    it('should work without logger', async () => {
      delete req.log;
      req.body = { name: 'Test', price: 1000 };

      Product.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ id: '123' }),
      }));

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getCategories', () => {
    it('should get all active categories', async () => {
      const mockCategories = [
        { name: 'Rosas', active: true },
        { name: 'Tulipanes', active: true },
      ];

      Category.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCategories),
      });

      await productController.getCategories(req, res);

      expect(Category.find).toHaveBeenCalledWith({ active: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        categories: mockCategories,
        total: 2,
      });
    });

    it('should return empty array when no categories', async () => {
      Category.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await productController.getCategories(req, res);

      expect(res.json).toHaveBeenCalledWith({
        categories: [],
        total: 0,
      });
    });
  });

  describe('getOccasions', () => {
    it('should get all active occasions', async () => {
      const mockOccasions = [
        { name: 'Cumpleaños', active: true },
        { name: 'Aniversario', active: true },
      ];

      Occasion.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOccasions),
      });

      await productController.getOccasions(req, res);

      expect(Occasion.find).toHaveBeenCalledWith({ active: true });
      expect(res.json).toHaveBeenCalledWith({
        occasions: mockOccasions,
        total: 2,
      });
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      Product.countDocuments = jest.fn().mockResolvedValueOnce(100).mockResolvedValueOnce(10);

      Product.aggregate = jest
        .fn()
        .mockResolvedValueOnce([
          {
            avgPrice: 3500,
            minPrice: 1000,
            maxPrice: 8000,
            totalStock: 500,
          },
        ])
        .mockResolvedValueOnce([{ _id: 'Rosas', count: 50, avgPrice: 3000, totalStock: 250 }]);

      Product.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest
          .fn()
          .mockResolvedValue([
            { name: 'Rosa Premium', rating: 4.9, reviews_count: 100, price: 5000 },
          ]),
      });
    });

    it('should generate comprehensive statistics', async () => {
      await productController.getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          total: expect.objectContaining({
            products: 100,
            featured: 10,
          }),
          prices: expect.objectContaining({
            average: 3500,
            min: 1000,
            max: 8000,
          }),
        })
      );
    });

    it('should handle empty database', async () => {
      Product.countDocuments.mockReset().mockResolvedValue(0);
      Product.aggregate.mockReset().mockResolvedValue([]);
      Product.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([]),
      });

      await productController.getStats(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          total: expect.objectContaining({ products: 0, stock: 0 }),
        })
      );
    });
  });

  describe('getFeaturedProducts', () => {
    it('should get featured products', async () => {
      const mockProducts = [{ name: 'Rosa Premium', featured: true }];

      Product.findFeatured = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      await productController.getFeaturedProducts(req, res);

      expect(Product.findFeatured).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });
  });

  describe('getProductsByOccasion', () => {
    it('should get products by occasion', async () => {
      req.params.occasion = 'cumpleaños';
      const mockProducts = [{ name: 'Arreglo Cumpleaños' }];

      Product.findByOccasion = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      await productController.getProductsByOccasion(req, res);

      expect(Product.findByOccasion).toHaveBeenCalledWith('cumpleaños');
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });
  });

  describe('getProductsByCategory', () => {
    it('should get products by category', async () => {
      req.params.category = 'Rosas';
      const mockProducts = [{ name: 'Rosa Roja' }];

      Product.findByCategory = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProducts),
      });

      await productController.getProductsByCategory(req, res);

      expect(Product.findByCategory).toHaveBeenCalledWith('Rosas');
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      req.params.query = 'rosa';
      const mockProducts = [{ name: 'Rosa Roja' }, { name: 'Rosa Blanca' }];

      Product.searchProducts = jest.fn().mockResolvedValue(mockProducts);

      await productController.searchProducts(req, res);

      expect(Product.searchProducts).toHaveBeenCalledWith('rosa');
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });
  });

  describe('getProducts with filters', () => {
    beforeEach(() => {
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([]),
      };
      Product.find = jest.fn().mockReturnValue(mockChain);
      Product.countDocuments = jest.fn().mockResolvedValue(0);
    });

    it('should get products with category filter', async () => {
      req.query = { category: 'Rosas' };

      await productController.getProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({ active: true, category: 'Rosas' })
      );
    });

    it('should apply price range filters', async () => {
      req.query = { minPrice: '1000', maxPrice: '5000' };

      await productController.getProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          price: { $gte: 1000, $lte: 5000 },
        })
      );
    });

    it('should handle pagination', async () => {
      req.query = { page: '2', limit: '10' };
      Product.countDocuments.mockResolvedValue(25);

      await productController.getProducts(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            currentPage: 2,
            totalPages: 3,
          }),
        })
      );
    });
  });
});
