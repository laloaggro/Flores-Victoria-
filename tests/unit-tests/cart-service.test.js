const Cart = require('../../microservices/cart-service/src/models/Cart');

// Mock de Redis
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  expire: jest.fn()
};

describe('Cart Service - Unit Tests', () => {
  let cartModel;

  beforeEach(() => {
    cartModel = new Cart(mockRedisClient);
    jest.clearAllMocks();
  });

  describe('Cart Model', () => {
    describe('getCart', () => {
      test('should return existing cart from Redis', async () => {
        const userId = 'user123';
        const cartKey = `cart:${userId}`;
        const mockCart = {
          items: [
            { productId: 1, name: 'Product 1', price: 10, quantity: 2 }
          ],
          total: 20
        };
        
        mockRedisClient.get.mockResolvedValue(JSON.stringify(mockCart));
        
        const result = await cartModel.getCart(userId);
        
        expect(mockRedisClient.get).toHaveBeenCalledWith(cartKey);
        expect(result).toEqual(mockCart);
      });

      test('should return empty cart when no cart exists in Redis', async () => {
        const userId = 'user123';
        const cartKey = `cart:${userId}`;
        const emptyCart = { items: [], total: 0 };
        
        mockRedisClient.get.mockResolvedValue(null);
        
        const result = await cartModel.getCart(userId);
        
        expect(mockRedisClient.get).toHaveBeenCalledWith(cartKey);
        expect(result).toEqual(emptyCart);
      });
    });

    describe('addItem', () => {
      test('should add new item to empty cart', async () => {
        const userId = 'user123';
        const cartKey = `cart:${userId}`;
        const newItem = {
          productId: 1,
          name: 'Product 1',
          price: 10,
          quantity: 2
        };
        
        // Mock para obtener carrito vacío
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify({ items: [], total: 0 }));
        
        const result = await cartModel.addItem(userId, newItem);
        
        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toEqual(newItem);
        expect(result.total).toBe(20);
        expect(mockRedisClient.set).toHaveBeenCalled();
      });

      test('should update quantity of existing item in cart', async () => {
        const userId = 'user123';
        const cartKey = `cart:${userId}`;
        const existingItem = {
          productId: 1,
          name: 'Product 1',
          price: 10,
          quantity: 2
        };
        const updatedItem = {
          productId: 1,
          name: 'Product 1',
          price: 10,
          quantity: 3 // Adding 3 more
        };
        
        // Mock para obtener carrito con item existente
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify({ 
          items: [existingItem], 
          total: 20 
        }));
        
        const result = await cartModel.addItem(userId, updatedItem);
        
        expect(result.items).toHaveLength(1);
        expect(result.items[0].quantity).toBe(5); // 2 existing + 3 new
        expect(result.total).toBe(50); // 5 items * $10
        expect(mockRedisClient.set).toHaveBeenCalled();
      });
    });

    describe('removeItem', () => {
      test('should remove item from cart', async () => {
        const userId = 'user123';
        const productId = 1;
        const cartKey = `cart:${userId}`;
        const cartWithItems = {
          items: [
            { productId: 1, name: 'Product 1', price: 10, quantity: 2 },
            { productId: 2, name: 'Product 2', price: 15, quantity: 1 }
          ],
          total: 35
        };
        
        // Mock para obtener carrito con items
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(cartWithItems));
        
        const result = await cartModel.removeItem(userId, productId);
        
        expect(result.items).toHaveLength(1);
        expect(result.items[0].productId).toBe(2);
        expect(result.total).toBe(15);
        expect(mockRedisClient.set).toHaveBeenCalled();
      });

      test('should return same cart when removing non-existent item', async () => {
        const userId = 'user123';
        const productId = 999; // Non-existent product
        const cartKey = `cart:${userId}`;
        const cartWithItems = {
          items: [
            { productId: 1, name: 'Product 1', price: 10, quantity: 2 },
            { productId: 2, name: 'Product 2', price: 15, quantity: 1 }
          ],
          total: 35
        };
        
        // Mock para obtener carrito con items
        mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(cartWithItems));
        
        const result = await cartModel.removeItem(userId, productId);
        
        expect(result).toEqual(cartWithItems);
        expect(mockRedisClient.set).toHaveBeenCalled();
      });
    });

    describe('clearCart', () => {
      test('should clear cart by setting empty cart', async () => {
        const userId = 'user123';
        const cartKey = `cart:${userId}`;
        const emptyCart = { items: [], total: 0 };
        
        await cartModel.clearCart(userId);
        
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          cartKey,
          JSON.stringify(emptyCart)
        );
      });
    });
  });
});