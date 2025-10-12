const Wishlist = require('../../microservices/wishlist-service/src/models/Wishlist');

// Mock de Redis
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  expire: jest.fn()
};

describe('Wishlist Service - Unit Tests', () => {
  let wishlistModel;

  beforeEach(() => {
    wishlistModel = new Wishlist(mockRedisClient);
    jest.clearAllMocks();
  });

  describe('Wishlist Model', () => {
    describe('getWishlist', () => {
      test('should return existing wishlist from Redis', async () => {
        const userId = 'user123';
        const wishlistKey = `wishlist:${userId}`;
        const mockWishlist = {
          items: [
            { productId: 1, name: 'Product 1', price: 10 }
          ]
        };
        
        mockRedisClient.get.mockResolvedValue(JSON.stringify(mockWishlist));
        
        const result = await wishlistModel.getWishlist(userId);
        
        expect(mockRedisClient.get).toHaveBeenCalledWith(wishlistKey);
        expect(result).toEqual(mockWishlist);
      });

      test('should return empty wishlist when no wishlist exists in Redis', async () => {
        const userId = 'user123';
        const wishlistKey = `wishlist:${userId}`;
        const emptyWishlist = { items: [] };
        
        mockRedisClient.get.mockResolvedValue(null);
        
        const result = await wishlistModel.getWishlist(userId);
        
        expect(mockRedisClient.get).toHaveBeenCalledWith(wishlistKey);
        expect(result).toEqual(emptyWishlist);
      });
    });

    describe('addItem', () => {
      test('should add new item to empty wishlist', async () => {
        const userId = 'user123';
        const wishlistKey = `wishlist:${userId}`;
        const newItem = {
          productId: 1,
          name: 'Product 1',
          price: 10
        };
        
        // Mock para obtener lista de deseos vacía
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify({ items: [] }));
        
        const result = await wishlistModel.addItem(userId, newItem);
        
        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toEqual(newItem);
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          wishlistKey,
          JSON.stringify(result),
          { EX: 86400 }
        );
      });

      test('should not add duplicate item to wishlist', async () => {
        const userId = 'user123';
        const wishlistKey = `wishlist:${userId}`;
        const existingItem = {
          productId: 1,
          name: 'Product 1',
          price: 10
        };
        const duplicateItem = {
          productId: 1,
          name: 'Product 1 Updated',
          price: 15
        };
        
        // Mock para obtener lista de deseos con item existente
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify({ 
          items: [existingItem] 
        }));
        
        const result = await wishlistModel.addItem(userId, duplicateItem);
        
        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toEqual(existingItem);
        expect(mockRedisClient.set).not.toHaveBeenCalled();
      });
    });

    describe('removeItem', () => {
      test('should remove item from wishlist', async () => {
        const userId = 'user123';
        const productId = 1;
        const wishlistKey = `wishlist:${userId}`;
        const wishlistWithItems = {
          items: [
            { productId: 1, name: 'Product 1', price: 10 },
            { productId: 2, name: 'Product 2', price: 15 }
          ]
        };
        
        // Mock para obtener lista de deseos con items
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(wishlistWithItems));
        
        const result = await wishlistModel.removeItem(userId, productId);
        
        expect(result.items).toHaveLength(1);
        expect(result.items[0].productId).toBe(2);
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          wishlistKey,
          JSON.stringify(result),
          { EX: 86400 }
        );
      });

      test('should return same wishlist when removing non-existent item', async () => {
        const userId = 'user123';
        const productId = 999; // Non-existent product
        const wishlistKey = `wishlist:${userId}`;
        const wishlistWithItems = {
          items: [
            { productId: 1, name: 'Product 1', price: 10 },
            { productId: 2, name: 'Product 2', price: 15 }
          ]
        };
        
        // Mock para obtener lista de deseos con items
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(wishlistWithItems));
        
        const result = await wishlistModel.removeItem(userId, productId);
        
        expect(result).toEqual(wishlistWithItems);
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          wishlistKey,
          JSON.stringify(wishlistWithItems),
          { EX: 86400 }
        );
      });
    });

    describe('clearWishlist', () => {
      test('should clear wishlist by setting empty wishlist', async () => {
        const userId = 'user123';
        const wishlistKey = `wishlist:${userId}`;
        const emptyWishlist = { items: [] };
        
        await wishlistModel.clearWishlist(userId);
        
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          wishlistKey,
          JSON.stringify(emptyWishlist),
          { EX: 86400 }
        );
      });
    });
  });
});