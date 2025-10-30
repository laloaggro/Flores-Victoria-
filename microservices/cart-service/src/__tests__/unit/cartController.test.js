const CartController = require('../../controllers/cartController');

describe('CartController - Unit Tests', () => {
  let cartController;
  let mockRedis;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    };

    cartController = new CartController(mockRedis);

    mockReq = {
      user: { id: 'user123' },
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return user cart successfully', async () => {
      const mockCart = {
        items: [{ productId: 'prod1', name: 'Rosa', price: 15000, quantity: 2 }],
        total: 30000,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(mockCart));

      await cartController.getCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          cart: mockCart,
        },
      });
    });

    it('should return empty cart for new user', async () => {
      mockRedis.get.mockResolvedValue(null);

      await cartController.getCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          cart: { items: [], total: 0 },
        },
      });
    });

    it('should handle errors when getting cart', async () => {
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
    it('should add item to cart successfully', async () => {
      mockReq.body = {
        productId: 'prod1',
        name: 'Rosa Roja',
        price: 15000,
        quantity: 2,
      };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await cartController.addItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item agregado al carrito',
        data: {
          cart: expect.objectContaining({
            items: expect.arrayContaining([expect.objectContaining({ productId: 'prod1' })]),
            total: 30000,
          }),
        },
      });
    });

    it('should reject request without productId', async () => {
      mockReq.body = {
        name: 'Rosa Roja',
        price: 15000,
        quantity: 2,
      };

      await cartController.addItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID de producto, nombre, precio y cantidad son requeridos',
      });
    });

    it('should reject request without name', async () => {
      mockReq.body = {
        productId: 'prod1',
        price: 15000,
        quantity: 2,
      };

      await cartController.addItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID de producto, nombre, precio y cantidad son requeridos',
      });
    });

    it('should reject request without price', async () => {
      mockReq.body = {
        productId: 'prod1',
        name: 'Rosa Roja',
        quantity: 2,
      };

      await cartController.addItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID de producto, nombre, precio y cantidad son requeridos',
      });
    });

    it('should reject request without quantity', async () => {
      mockReq.body = {
        productId: 'prod1',
        name: 'Rosa Roja',
        price: 15000,
      };

      await cartController.addItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'ID de producto, nombre, precio y cantidad son requeridos',
      });
    });

    it('should handle errors when adding item', async () => {
      mockReq.body = {
        productId: 'prod1',
        name: 'Rosa Roja',
        price: 15000,
        quantity: 2,
      };

      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      await cartController.addItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart successfully', async () => {
      mockReq.params = { productId: 'prod1' };

      const mockCart = {
        items: [{ productId: 'prod2', name: 'Tulipán', price: 12000, quantity: 1 }],
        total: 12000,
      };

      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          items: [
            { productId: 'prod1', name: 'Rosa', price: 15000, quantity: 2 },
            { productId: 'prod2', name: 'Tulipán', price: 12000, quantity: 1 },
          ],
          total: 42000,
        })
      );
      mockRedis.set.mockResolvedValue('OK');

      await cartController.removeItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item removido del carrito',
        data: {
          cart: expect.objectContaining({
            total: 12000,
          }),
        },
      });
    });

    it('should handle removing non-existent item', async () => {
      mockReq.params = { productId: 'prod999' };

      const mockCart = {
        items: [{ productId: 'prod1', name: 'Rosa', price: 15000, quantity: 2 }],
        total: 30000,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(mockCart));
      mockRedis.set.mockResolvedValue('OK');

      await cartController.removeItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Item removido del carrito',
        data: {
          cart: expect.objectContaining({
            items: expect.arrayContaining([expect.objectContaining({ productId: 'prod1' })]),
          }),
        },
      });
    });

    it('should handle errors when removing item', async () => {
      mockReq.params = { productId: 'prod1' };
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      await cartController.removeItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await cartController.clearCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Carrito limpiado',
        data: {
          cart: { items: [], total: 0 },
        },
      });
    });

    it('should handle errors when clearing cart', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      await cartController.clearCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  });

  describe('User Authentication', () => {
    it('should use authenticated user ID for all operations', async () => {
      mockReq.user.id = 'special-user-789';
      mockRedis.get.mockResolvedValue(null);

      await cartController.getCart(mockReq, mockRes);

      expect(mockRedis.get).toHaveBeenCalledWith('cart:special-user-789');
    });
  });
});
