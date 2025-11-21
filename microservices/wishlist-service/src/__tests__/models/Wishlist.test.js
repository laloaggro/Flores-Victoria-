const Wishlist = require('../../models/Wishlist');

describe('Wishlist Model', () => {
  let wishlist;
  let mockRedis;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    wishlist = new Wishlist(mockRedis);
  });

  describe('getWishlist', () => {
    it('should return existing wishlist', async () => {
      const mockWishlist = { items: [{ productId: '1', name: 'Rosas' }] };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockWishlist));

      const result = await wishlist.getWishlist('user123');

      expect(result).toEqual(mockWishlist);
      expect(mockRedis.get).toHaveBeenCalledWith('wishlist:user123');
    });

    it('should return empty wishlist if not exists', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await wishlist.getWishlist('user123');

      expect(result).toEqual({ items: [] });
    });
  });

  describe('addItem', () => {
    it('should add new item to wishlist', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ items: [] }));
      mockRedis.set.mockResolvedValue('OK');

      const item = { productId: '1', name: 'Rosas', price: 50 };
      const result = await wishlist.addItem('user123', item);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(item);
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should not add duplicate item', async () => {
      const existingItem = { productId: '1', name: 'Rosas', price: 50 };
      mockRedis.get.mockResolvedValue(JSON.stringify({ items: [existingItem] }));

      const result = await wishlist.addItem('user123', existingItem);

      expect(result.items).toHaveLength(1);
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist', async () => {
      const mockWishlist = {
        items: [
          { productId: '1', name: 'Rosas' },
          { productId: '2', name: 'Tulipanes' },
        ],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockWishlist));
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.removeItem('user123', '1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('2');
    });
  });

  describe('clearWishlist', () => {
    it('should clear wishlist completely', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const result = await wishlist.clearWishlist('user123');

      expect(result).toEqual({ items: [] });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'wishlist:user123',
        JSON.stringify({ items: [] }),
        { EX: 86400 }
      );
    });
  });
});
