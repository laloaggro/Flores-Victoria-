const Wishlist = require('../../models/Wishlist');

describe('Wishlist Model - Unit Tests', () => {
  let mockRedis;
  let wishlist;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    };

    wishlist = new Wishlist(mockRedis);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with Redis client', () => {
      expect(wishlist.redis).toBe(mockRedis);
    });
  });

  describe('getWishlist', () => {
    it('should return existing wishlist for user', async () => {
      const userId = 'user-123';
      const mockWishlistData = {
        items: [
          { productId: 'prod-1', name: 'Rosas', price: 25000 },
          { productId: 'prod-2', name: 'Lirios', price: 30000 },
        ],
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(mockWishlistData));

      const result = await wishlist.getWishlist(userId);

      expect(mockRedis.get).toHaveBeenCalledWith('wishlist:user-123');
      expect(result).toEqual(mockWishlistData);
    });

    it('should return empty wishlist when user has no wishlist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await wishlist.getWishlist('user-456');

      expect(result).toEqual({ items: [] });
    });

    it('should parse JSON correctly from Redis', async () => {
      const mockWishlistData = {
        items: [
          {
            productId: 'prod-1',
            name: 'Producto especial "Ñuñoa"',
            price: 15000,
          },
        ],
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(mockWishlistData));

      const result = await wishlist.getWishlist('user-789');

      expect(result).toEqual(mockWishlistData);
    });
  });

  describe('addItem', () => {
    it('should add new item to empty wishlist', async () => {
      const userId = 'user-123';
      const newItem = {
        productId: 'prod-1',
        name: 'Rosas rojas',
        price: 25000,
        imageUrl: '/images/rosas.jpg',
      };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.addItem(userId, newItem);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(newItem);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'wishlist:user-123',
        JSON.stringify({ items: [newItem] }),
        { EX: 86400 }
      );
    });

    it('should add item to existing wishlist', async () => {
      const userId = 'user-123';
      const existingWishlist = {
        items: [{ productId: 'prod-1', name: 'Rosas', price: 25000 }],
      };
      const newItem = {
        productId: 'prod-2',
        name: 'Lirios',
        price: 30000,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingWishlist));
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.addItem(userId, newItem);

      expect(result.items).toHaveLength(2);
      expect(result.items[1]).toEqual(newItem);
    });

    it('should not add duplicate items', async () => {
      const userId = 'user-123';
      const existingItem = {
        productId: 'prod-1',
        name: 'Rosas',
        price: 25000,
      };
      const existingWishlist = {
        items: [existingItem],
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingWishlist));

      // Intentar agregar el mismo producto nuevamente
      const result = await wishlist.addItem(userId, {
        productId: 'prod-1',
        name: 'Rosas',
        price: 25000,
      });

      expect(result.items).toHaveLength(1);
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('should set expiration to 24 hours', async () => {
      const userId = 'user-123';
      const newItem = { productId: 'prod-1', name: 'Test', price: 10000 };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      await wishlist.addItem(userId, newItem);

      expect(mockRedis.set).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
        EX: 86400,
      });
    });

    it('should handle special characters in product names', async () => {
      const userId = 'user-123';
      const newItem = {
        productId: 'prod-1',
        name: 'Flores "Especiales" - Ñuñoa',
        price: 35000,
      };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.addItem(userId, newItem);

      expect(result.items[0].name).toBe(newItem.name);
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist', async () => {
      const userId = 'user-123';
      const existingWishlist = {
        items: [
          { productId: 'prod-1', name: 'Rosas', price: 25000 },
          { productId: 'prod-2', name: 'Lirios', price: 30000 },
        ],
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingWishlist));
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.removeItem(userId, 'prod-1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod-2');
      expect(mockRedis.set).toHaveBeenCalledWith(
        'wishlist:user-123',
        JSON.stringify({ items: [{ productId: 'prod-2', name: 'Lirios', price: 30000 }] }),
        { EX: 86400 }
      );
    });

    it('should handle removing non-existent item', async () => {
      const userId = 'user-123';
      const existingWishlist = {
        items: [{ productId: 'prod-1', name: 'Rosas', price: 25000 }],
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingWishlist));
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.removeItem(userId, 'non-existent');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod-1');
    });

    it('should handle removing last item', async () => {
      const userId = 'user-123';
      const existingWishlist = {
        items: [{ productId: 'prod-1', name: 'Rosas', price: 25000 }],
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingWishlist));
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.removeItem(userId, 'prod-1');

      expect(result.items).toHaveLength(0);
    });

    it('should handle removing from empty wishlist', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.removeItem('user-123', 'prod-1');

      expect(result.items).toHaveLength(0);
    });
  });

  describe('clearWishlist', () => {
    it('should clear all items from wishlist', async () => {
      const userId = 'user-123';

      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.clearWishlist(userId);

      expect(result).toEqual({ items: [] });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'wishlist:user-123',
        JSON.stringify({ items: [] }),
        { EX: 86400 }
      );
    });

    it('should set expiration to 24 hours', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await wishlist.clearWishlist('user-456');

      expect(mockRedis.set).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
        EX: 86400,
      });
    });

    it('should work even if wishlist was already empty', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.clearWishlist('user-789');

      expect(result.items).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with many items in wishlist', async () => {
      const userId = 'user-123';
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        productId: `prod-${i}`,
        name: `Producto ${i}`,
        price: 10000 + i * 1000,
      }));
      const existingWishlist = { items: manyItems };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingWishlist));

      const result = await wishlist.getWishlist(userId);

      expect(result.items).toHaveLength(50);
    });

    it('should handle adding multiple items sequentially', async () => {
      const userId = 'user-123';
      let currentWishlist = { items: [] };

      mockRedis.get.mockImplementation(() => Promise.resolve(JSON.stringify(currentWishlist)));

      mockRedis.set.mockImplementation((key, value) => {
        currentWishlist = JSON.parse(value);
        return Promise.resolve('OK');
      });

      await wishlist.addItem(userId, { productId: 'prod-1', name: 'Item 1', price: 10000 });
      await wishlist.addItem(userId, { productId: 'prod-2', name: 'Item 2', price: 20000 });
      await wishlist.addItem(userId, { productId: 'prod-3', name: 'Item 3', price: 30000 });

      expect(currentWishlist.items).toHaveLength(3);
    });

    it('should handle userId with special characters', async () => {
      const userId = 'user-áéíóú-ñ-123';
      mockRedis.get.mockResolvedValue(null);

      const result = await wishlist.getWishlist(userId);

      expect(mockRedis.get).toHaveBeenCalledWith(`wishlist:${userId}`);
      expect(result).toEqual({ items: [] });
    });

    it('should handle products with high prices', async () => {
      const userId = 'user-123';
      const expensiveItem = {
        productId: 'prod-premium',
        name: 'Arreglo Premium',
        price: 999999.99,
      };

      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.addItem(userId, expensiveItem);

      expect(result.items[0].price).toBe(999999.99);
    });

    it('should handle removing multiple items', async () => {
      const userId = 'user-123';
      let currentWishlist = {
        items: [
          { productId: 'prod-1', name: 'Item 1', price: 10000 },
          { productId: 'prod-2', name: 'Item 2', price: 20000 },
          { productId: 'prod-3', name: 'Item 3', price: 30000 },
        ],
      };

      mockRedis.get.mockImplementation(() => Promise.resolve(JSON.stringify(currentWishlist)));

      mockRedis.set.mockImplementation((key, value) => {
        currentWishlist = JSON.parse(value);
        return Promise.resolve('OK');
      });

      await wishlist.removeItem(userId, 'prod-1');
      await wishlist.removeItem(userId, 'prod-3');

      expect(currentWishlist.items).toHaveLength(1);
      expect(currentWishlist.items[0].productId).toBe('prod-2');
    });
  });
});
