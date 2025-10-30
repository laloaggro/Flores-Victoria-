const Cart = require('../../models/Cart');

describe('Cart Model - Unit Tests', () => {
  let cart;
  let mockRedis;

  beforeEach(() => {
    // Mock Redis client
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    };

    cart = new Cart(mockRedis);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return existing cart from Redis', async () => {
      const userId = 'user123';
      const existingCart = {
        items: [{ productId: 'prod1', name: 'Rosa Roja', price: 15000, quantity: 2 }],
        total: 30000,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));

      const result = await cart.getCart(userId);

      expect(mockRedis.get).toHaveBeenCalledWith('cart:user123');
      expect(result).toEqual(existingCart);
    });

    it('should return empty cart when Redis returns null', async () => {
      const userId = 'user123';
      mockRedis.get.mockResolvedValue(null);

      const result = await cart.getCart(userId);

      expect(mockRedis.get).toHaveBeenCalledWith('cart:user123');
      expect(result).toEqual({ items: [], total: 0 });
    });

    it('should handle Redis errors gracefully', async () => {
      const userId = 'user123';
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      await expect(cart.getCart(userId)).rejects.toThrow('Redis connection failed');
    });
  });

  describe('addItem', () => {
    it('should add new item to empty cart', async () => {
      const userId = 'user123';
      const newItem = {
        productId: 'prod1',
        name: 'Rosa Roja',
        price: 15000,
        quantity: 2,
      };

      mockRedis.get.mockResolvedValue(null); // Empty cart
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.addItem(userId, newItem);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(newItem);
      expect(result.total).toBe(30000);
      expect(mockRedis.set).toHaveBeenCalledWith('cart:user123', JSON.stringify(result), {
        EX: 86400,
      });
    });

    it('should increase quantity when item already exists', async () => {
      const userId = 'user123';
      const existingCart = {
        items: [{ productId: 'prod1', name: 'Rosa Roja', price: 15000, quantity: 2 }],
        total: 30000,
      };
      const newItem = {
        productId: 'prod1',
        name: 'Rosa Roja',
        price: 15000,
        quantity: 3,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.addItem(userId, newItem);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(5); // 2 + 3
      expect(result.total).toBe(75000); // 15000 * 5
    });

    it('should add multiple different items', async () => {
      const userId = 'user123';
      const existingCart = {
        items: [{ productId: 'prod1', name: 'Rosa Roja', price: 15000, quantity: 2 }],
        total: 30000,
      };
      const newItem = {
        productId: 'prod2',
        name: 'Tulipán Amarillo',
        price: 12000,
        quantity: 1,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.addItem(userId, newItem);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(42000); // 30000 + 12000
    });

    it('should calculate total correctly with multiple items', async () => {
      const userId = 'user123';
      const existingCart = {
        items: [
          { productId: 'prod1', name: 'Rosa Roja', price: 15000, quantity: 2 },
          { productId: 'prod2', name: 'Tulipán', price: 12000, quantity: 3 },
        ],
        total: 66000,
      };
      const newItem = {
        productId: 'prod3',
        name: 'Lirio',
        price: 18000,
        quantity: 1,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.addItem(userId, newItem);

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(84000); // 30000 + 36000 + 18000
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const userId = 'user123';
      const existingCart = {
        items: [
          { productId: 'prod1', name: 'Rosa Roja', price: 15000, quantity: 2 },
          { productId: 'prod2', name: 'Tulipán', price: 12000, quantity: 1 },
        ],
        total: 42000,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.removeItem(userId, 'prod1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod2');
      expect(result.total).toBe(12000);
    });

    it('should handle removing non-existent item', async () => {
      const userId = 'user123';
      const existingCart = {
        items: [{ productId: 'prod1', name: 'Rosa Roja', price: 15000, quantity: 2 }],
        total: 30000,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.removeItem(userId, 'prod999');

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(30000);
    });

    it('should result in empty cart when removing last item', async () => {
      const userId = 'user123';
      const existingCart = {
        items: [{ productId: 'prod1', name: 'Rosa Roja', price: 15000, quantity: 2 }],
        total: 30000,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.removeItem(userId, 'prod1');

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should recalculate total after removing item', async () => {
      const userId = 'user123';
      const existingCart = {
        items: [
          { productId: 'prod1', name: 'Rosa Roja', price: 15000, quantity: 2 },
          { productId: 'prod2', name: 'Tulipán', price: 12000, quantity: 3 },
          { productId: 'prod3', name: 'Lirio', price: 18000, quantity: 1 },
        ],
        total: 84000,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.removeItem(userId, 'prod2');

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(48000); // 30000 + 18000
    });
  });

  describe('clearCart', () => {
    it('should clear cart completely', async () => {
      const userId = 'user123';
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.clearCart(userId);

      expect(result).toEqual({ items: [], total: 0 });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'cart:user123',
        JSON.stringify({ items: [], total: 0 }),
        { EX: 86400 }
      );
    });

    it('should set expiration time when clearing cart', async () => {
      const userId = 'user123';
      mockRedis.set.mockResolvedValue('OK');

      await cart.clearCart(userId);

      const setCall = mockRedis.set.mock.calls[0];
      expect(setCall[2]).toEqual({ EX: 86400 }); // 24 hours
    });
  });

  describe('Cart Key Generation', () => {
    it('should use correct key format for different users', async () => {
      mockRedis.get.mockResolvedValue(null);

      await cart.getCart('user123');
      await cart.getCart('user456');
      await cart.getCart('admin-001');

      expect(mockRedis.get).toHaveBeenCalledWith('cart:user123');
      expect(mockRedis.get).toHaveBeenCalledWith('cart:user456');
      expect(mockRedis.get).toHaveBeenCalledWith('cart:admin-001');
    });
  });

  describe('Total Calculation Edge Cases', () => {
    it('should handle zero price items', async () => {
      const userId = 'user123';
      const newItem = {
        productId: 'free-item',
        name: 'Free Sample',
        price: 0,
        quantity: 5,
      };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.addItem(userId, newItem);

      expect(result.total).toBe(0);
    });

    it('should handle large quantities', async () => {
      const userId = 'user123';
      const newItem = {
        productId: 'prod1',
        name: 'Rosa',
        price: 15000,
        quantity: 100,
      };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.addItem(userId, newItem);

      expect(result.total).toBe(1500000);
    });

    it('should handle decimal prices (if supported)', async () => {
      const userId = 'user123';
      const newItem = {
        productId: 'prod1',
        name: 'Rosa',
        price: 15000.5,
        quantity: 2,
      };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.addItem(userId, newItem);

      expect(result.total).toBe(30001);
    });
  });
});
