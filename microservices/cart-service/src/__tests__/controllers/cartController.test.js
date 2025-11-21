const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  getCart,
} = require('../../controllers/cartController');

// Mock del modelo Cart
jest.mock('../../models/Cart');
const Cart = require('../../models/Cart');

describe('Cart Controller', () => {
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

  describe('getCart', () => {
    it('should return user cart', async () => {
      const mockCart = {
        userId: 'user123',
        items: [{ productId: 'prod1', quantity: 2 }],
      };
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);

      await getCart(req, res);

      expect(Cart.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
        })
      );
    });

    it('should return empty cart if not found', async () => {
      Cart.findOne = jest.fn().mockResolvedValue(null);

      await getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({ items: [] }),
        })
      );
    });
  });

  describe('addItem', () => {
    it('should add item to cart', async () => {
      req.body = { productId: 'prod1', quantity: 2 };
      const mockCart = {
        userId: 'user123',
        items: [],
        save: jest.fn().mockResolvedValue(true),
      };
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);

      await addItem(req, res);

      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      req.params.productId = 'prod1';
      const mockCart = {
        userId: 'user123',
        items: [{ productId: 'prod1', quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);

      await removeItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      req.params.productId = 'prod1';
      req.body = { quantity: 5 };
      const mockCart = {
        userId: 'user123',
        items: [{ productId: 'prod1', quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);

      await updateQuantity(req, res);

      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const mockCart = {
        userId: 'user123',
        items: [{ productId: 'prod1', quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);

      await clearCart(req, res);

      expect(mockCart.items).toHaveLength(0);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
