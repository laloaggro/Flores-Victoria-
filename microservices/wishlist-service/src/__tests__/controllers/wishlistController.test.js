const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
} = require('../../controllers/wishlistController');

jest.mock('../../models/Wishlist');
const Wishlist = require('../../models/Wishlist');

describe('Wishlist Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 'user123' },
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getWishlist', () => {
    it('should return user wishlist', async () => {
      const mockWishlist = {
        userId: 'user123',
        products: ['prod1', 'prod2'],
      };

      Wishlist.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockWishlist),
      });

      await getWishlist(req, res);

      expect(Wishlist.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return empty wishlist if not found', async () => {
      Wishlist.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ products: [] }),
        })
      );
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      req.body = { productId: 'prod123' };

      const mockWishlist = {
        userId: 'user123',
        products: [],
        save: jest.fn().mockResolvedValue(true),
      };

      Wishlist.findOne = jest.fn().mockResolvedValue(mockWishlist);

      await addToWishlist(req, res);

      expect(mockWishlist.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should create wishlist if not exists', async () => {
      req.body = { productId: 'prod123' };

      Wishlist.findOne = jest.fn().mockResolvedValue(null);
      Wishlist.mockImplementation(() => ({
        userId: 'user123',
        products: ['prod123'],
        save: jest.fn().mockResolvedValue(true),
      }));

      await addToWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove product from wishlist', async () => {
      req.params.productId = 'prod123';

      const mockWishlist = {
        userId: 'user123',
        products: ['prod123', 'prod456'],
        save: jest.fn().mockResolvedValue(true),
      };

      Wishlist.findOne = jest.fn().mockResolvedValue(mockWishlist);

      await removeFromWishlist(req, res);

      expect(mockWishlist.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('clearWishlist', () => {
    it('should clear all products from wishlist', async () => {
      const mockWishlist = {
        userId: 'user123',
        products: ['prod1', 'prod2'],
        save: jest.fn().mockResolvedValue(true),
      };

      Wishlist.findOne = jest.fn().mockResolvedValue(mockWishlist);

      await clearWishlist(req, res);

      expect(mockWishlist.products).toHaveLength(0);
      expect(mockWishlist.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
