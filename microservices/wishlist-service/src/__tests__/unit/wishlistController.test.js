const WishlistController = require('../../controllers/wishlistController');

// Mock del logger
jest.mock('../../logger.simple', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

const logger = require('../../logger.simple');

describe('WishlistController - Unit Tests', () => {
  let wishlistController;
  let mockRedisClient;
  let mockWishlistModel;
  let req;
  let res;

  beforeEach(() => {
    mockWishlistModel = {
      getWishlist: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      clearWishlist: jest.fn(),
    };

    mockRedisClient = {};
    wishlistController = new WishlistController(mockRedisClient);
    wishlistController.wishlistModel = mockWishlistModel;

    req = {
      params: {},
      body: {},
      user: { id: 'user-123' },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWishlist', () => {
    it('should return user wishlist', async () => {
      const mockWishlist = {
        items: [
          { productId: '123', name: 'Product 1', price: 100 },
          { productId: '456', name: 'Product 2', price: 200 },
        ],
      };

      mockWishlistModel.getWishlist.mockResolvedValue(mockWishlist);

      await wishlistController.getWishlist(req, res);

      expect(mockWishlistModel.getWishlist).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { wishlist: mockWishlist },
      });
    });

    it('should return empty wishlist', async () => {
      const emptyWishlist = { items: [] };

      mockWishlistModel.getWishlist.mockResolvedValue(emptyWishlist);

      await wishlistController.getWishlist(req, res);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { wishlist: emptyWishlist },
      });
    });

    it('should handle errors', async () => {
      mockWishlistModel.getWishlist.mockRejectedValue(new Error('Redis error'));

      await wishlistController.getWishlist(req, res);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });

  describe('addItem', () => {
    it('should add item to wishlist', async () => {
      req.body = {
        productId: '123',
        name: 'Beautiful Flowers',
        price: 150,
        image: 'flower.jpg',
      };

      const updatedWishlist = {
        items: [req.body],
      };

      mockWishlistModel.addItem.mockResolvedValue(updatedWishlist);

      await wishlistController.addItem(req, res);

      expect(mockWishlistModel.addItem).toHaveBeenCalledWith('user-123', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item agregado a la lista de deseos',
        data: { wishlist: updatedWishlist },
      });
    });

    it('should reject missing productId', async () => {
      req.body = {
        name: 'Product',
        price: 100,
      };

      await wishlistController.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID de producto, nombre y precio son requeridos',
      });
    });

    it('should reject missing name', async () => {
      req.body = {
        productId: '123',
        price: 100,
      };

      await wishlistController.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject missing price', async () => {
      req.body = {
        productId: '123',
        name: 'Product',
      };

      await wishlistController.addItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle add errors', async () => {
      req.body = {
        productId: '123',
        name: 'Product',
        price: 100,
      };

      mockWishlistModel.addItem.mockRejectedValue(new Error('Redis error'));

      await wishlistController.addItem(req, res);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist', async () => {
      req.params.productId = '123';

      const updatedWishlist = {
        items: [],
      };

      mockWishlistModel.removeItem.mockResolvedValue(updatedWishlist);

      await wishlistController.removeItem(req, res);

      expect(mockWishlistModel.removeItem).toHaveBeenCalledWith('user-123', '123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item removido de la lista de deseos',
        data: { wishlist: updatedWishlist },
      });
    });

    it('should handle remove errors', async () => {
      req.params.productId = '123';

      mockWishlistModel.removeItem.mockRejectedValue(new Error('Redis error'));

      await wishlistController.removeItem(req, res);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('clearWishlist', () => {
    it('should clear entire wishlist', async () => {
      const emptyWishlist = { items: [] };
      mockWishlistModel.clearWishlist.mockResolvedValue(emptyWishlist);

      await wishlistController.clearWishlist(req, res);

      expect(mockWishlistModel.clearWishlist).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Lista de deseos limpiada',
        data: { wishlist: emptyWishlist },
      });
    });

    it('should handle clear errors', async () => {
      mockWishlistModel.clearWishlist.mockRejectedValue(new Error('Redis error'));

      await wishlistController.clearWishlist(req, res);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
