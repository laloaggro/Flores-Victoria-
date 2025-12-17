/**
 * Comprehensive tests for Product Controller
 * Tests the product CRUD operations and admin functions
 */

// Mock dependencies before requiring controller
jest.mock('../../services/cacheService', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    invalidateProductCache: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../models/Product');
jest.mock('../../models/Category');
jest.mock('../../models/Occasion');

// Mock the shared error handler to return the original function
jest.mock('../../../../shared/errors/AppError', () => ({
  NotFoundError: class NotFoundError extends Error {
    constructor(resource, details) {
      super(`${resource} not found`);
      this.name = 'NotFoundError';
      this.details = details;
    }
  },
}));

jest.mock('../../../../shared/middleware/error-handler', () => ({
  asyncHandler: (fn) => fn,
}));

const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Occasion = require('../../models/Occasion');
const { cacheService } = require('../../services/cacheService');
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
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
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
            page: 2,
            pages: 3,
          }),
        })
      );
    });

    it('should filter by occasion', async () => {
      req.query = { occasion: 'cumpleaños' };

      await productController.getProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          occasions: { $in: ['cumpleaños'] },
        })
      );
    });

    it('should filter by featured', async () => {
      req.query = { featured: 'true' };

      await productController.getProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({ featured: true }));
    });

    it('should handle text search', async () => {
      req.query = { search: 'rosa roja' };

      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      Product.find = jest.fn().mockReturnValue(mockChain);

      await productController.getProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $and: expect.arrayContaining([expect.anything(), { $text: { $search: 'rosa roja' } }]),
        })
      );
    });
  });

  describe('getProductById', () => {
    it('should get product by id', async () => {
      req.params.productId = 'test-product-123';
      const mockProduct = {
        id: 'test-product-123',
        name: 'Rosa Premium',
        price: 2999,
        views: 10,
        incrementViews: jest.fn().mockResolvedValue(undefined),
      };

      Product.findOne = jest.fn().mockResolvedValue(mockProduct);

      await productController.getProductById(req, res);

      expect(Product.findOne).toHaveBeenCalledWith({ id: 'test-product-123', active: true });
      expect(mockProduct.incrementViews).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundError when product not found', async () => {
      req.params.productId = 'non-existent';
      Product.findOne = jest.fn().mockResolvedValue(null);

      await expect(productController.getProductById(req, res)).rejects.toThrow('Product not found');
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      req.params.id = 'product-id-123';
      req.body = { name: 'Rosa Actualizada', price: 3500 };

      const updatedProduct = {
        _id: 'product-id-123',
        name: 'Rosa Actualizada',
        price: 3500,
      };

      Product.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedProduct);

      await productController.updateProduct(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('product-id-123', req.body, {
        new: true,
        runValidators: true,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedProduct);
    });

    it('should throw NotFoundError when updating non-existent product', async () => {
      req.params.id = 'non-existent';
      req.body = { name: 'Updated' };
      Product.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await expect(productController.updateProduct(req, res)).rejects.toThrow('Product not found');
    });

    it('should work without logger', async () => {
      delete req.log;
      req.params.id = 'product-id';
      req.body = { name: 'Test' };
      Product.findByIdAndUpdate = jest.fn().mockResolvedValue({ name: 'Test' });

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      req.params.id = 'product-id-123';
      const deletedProduct = { _id: 'product-id-123', name: 'Rosa Eliminada' };

      Product.findByIdAndDelete = jest.fn().mockResolvedValue(deletedProduct);

      await productController.deleteProduct(req, res);

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith('product-id-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto eliminado correctamente' });
    });

    it('should throw NotFoundError when deleting non-existent product', async () => {
      req.params.id = 'non-existent';
      Product.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await expect(productController.deleteProduct(req, res)).rejects.toThrow('Product not found');
    });
  });

  describe('seedDatabase', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should refuse to seed in production', async () => {
      process.env.NODE_ENV = 'production';

      await productController.seedDatabase(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Operación no permitida en producción' });
    });
  });

  describe('createIndexes', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should refuse to create indexes in production', async () => {
      process.env.NODE_ENV = 'production';

      await productController.createIndexes(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Operación no permitida en producción' });
    });

    it('should create indexes in development', async () => {
      process.env.NODE_ENV = 'development';
      Product.createIndexes = jest.fn().mockResolvedValue(undefined);

      await productController.createIndexes(req, res);

      expect(Product.createIndexes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Índices de búsqueda creados exitosamente',
        })
      );
    });
  });
});
