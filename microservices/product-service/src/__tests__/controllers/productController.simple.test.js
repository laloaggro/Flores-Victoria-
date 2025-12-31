// Tests for productController.simple.js
const productController = require('../../controllers/productController.simple');
// Mock Product, Category, Occasion models
jest.mock('../../models/Product');
jest.mock('../../models/Category');
jest.mock('../../models/Occasion');
jest.mock('../../logger.simple');

const Product = require('../../models/Product');

describe('productController.simple', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return all products without filters', async () => {
      const mockProducts = [
        { _id: '1', name: 'Product 1', price: 100 },
        { _id: '2', name: 'Product 2', price: 200 },
      ];

      const mockPopulate = jest.fn().mockResolvedValue(mockProducts);
      const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
      Product.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: mockSort,
          }),
        }),
      });

      await productController.getProducts(req, res, next);

      expect(Product.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockProducts,
      });
    });

    it('should filter products by category', async () => {
      req.query.category = 'flowers';
      const mockProducts = [{ _id: '1', name: 'Flower', category: 'flowers' }];

      const mockPopulate = jest.fn().mockResolvedValue(mockProducts);
      Product.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({ populate: mockPopulate }),
          }),
        }),
      });

      await productController.getProducts(req, res, next);

      expect(Product.find).toHaveBeenCalledWith({ category: 'flowers' });
    });

    it('should filter products by price range', async () => {
      req.query.minPrice = '50';
      req.query.maxPrice = '150';
      const mockProducts = [{ _id: '1', name: 'Product', price: 100 }];

      const mockPopulate = jest.fn().mockResolvedValue(mockProducts);
      Product.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({ populate: mockPopulate }),
          }),
        }),
      });

      await productController.getProducts(req, res, next);

      expect(Product.find).toHaveBeenCalledWith({
        price: { $gte: 50, $lte: 150 },
      });
    });

    it('should filter products by inStock', async () => {
      req.query.inStock = 'true';
      const mockProducts = [{ _id: '1', name: 'Product', stock: 10 }];

      const mockPopulate = jest.fn().mockResolvedValue(mockProducts);
      Product.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({ populate: mockPopulate }),
          }),
        }),
      });

      await productController.getProducts(req, res, next);

      expect(Product.find).toHaveBeenCalledWith({ stock: { $gt: 0 } });
    });

    it('should filter products by featured', async () => {
      req.query.featured = 'true';
      const mockProducts = [{ _id: '1', name: 'Product', featured: true }];

      const mockPopulate = jest.fn().mockResolvedValue(mockProducts);
      Product.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({ populate: mockPopulate }),
          }),
        }),
      });

      await productController.getProducts(req, res, next);

      expect(Product.find).toHaveBeenCalledWith({ featured: true });
    });
  });

  describe('getProductById', () => {
    it('should return product by ID', async () => {
      const mockProduct = { _id: '123', name: 'Product 1', price: 100 };
      req.params.id = '123';

      Product.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockProduct),
        }),
      });

      await productController.getProductById(req, res, next);

      expect(Product.findById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });

    it('should return 404 if product not found', async () => {
      req.params.id = '999';

      Product.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await productController.getProductById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producto no encontrado',
      });
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const mockProduct = { _id: '123', name: 'New Product', price: 100 };
      req.body = { name: 'New Product', price: 100 };

      Product.create = jest.fn().mockResolvedValue(mockProduct);

      await productController.createProduct(req, res, next);

      expect(Product.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const mockProduct = { _id: '123', name: 'Updated Product', price: 150 };
      req.params.id = '123';
      req.body = { name: 'Updated Product', price: 150 };

      Product.findByIdAndUpdate = jest.fn().mockResolvedValue(mockProduct);

      await productController.updateProduct(req, res, next);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('123', req.body, {
        new: true,
        runValidators: true,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
    });
  });
});
