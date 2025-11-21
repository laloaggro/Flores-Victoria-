const CartController = require('../../controllers/cartController');

describe('CartController', () => {
  let cartController;
  let mockRedis;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    cartController = new CartController(mockRedis);

    mockReq = {
      user: { id: 'user123' },
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      const mockCart = {
        items: [{ productId: '1', name: 'Rosas', price: 50, quantity: 2 }],
        totalItems: 2,
        totalPrice: 100,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(mockCart));

      await cartController.getCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { cart: mockCart },
      });
    });

    it('should handle errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      await cartController.getCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });

  describe('addItem', () => {
    it('should add item to cart', async () => {
      mockReq.body = {
        productId: '1',
        name: 'Rosas',
        price: 50,
        quantity: 2,
      };

      const mockCart = {
        items: [mockReq.body],
        totalItems: 2,
        totalPrice: 100,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify({ items: [] }));
      mockRedis.set.mockResolvedValue('OK');

      await cartController.addItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item agregado al carrito',
        data: expect.objectContaining({
          cart: expect.any(Object),
        }),
      });
    });

    it('should reject incomplete item data', async () => {
      mockReq.body = {
        productId: '1',
        // Faltan name, price, quantity
      };

      await cartController.addItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID de producto, nombre, precio y cantidad son requeridos',
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      mockReq.params = { productId: '1' };

      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          items: [{ productId: '1', name: 'Rosas', price: 50, quantity: 2 }],
        })
      );
      mockRedis.set.mockResolvedValue('OK');

      await cartController.removeItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: expect.any(String),
        data: expect.objectContaining({
          cart: expect.any(Object),
        }),
      });
    });
  });

  describe('clearCart', () => {
    it('should clear user cart', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await cartController.clearCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: expect.any(String),
        data: expect.objectContaining({
          cart: expect.any(Object),
        }),
      });
    });
  });
});
