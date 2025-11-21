const Cart = require('../../models/Cart');

describe('Cart Model', () => {
  let cart;
  let mockRedis;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    cart = new Cart(mockRedis);
  });

  describe('getCart', () => {
    it('should return existing cart', async () => {
      const mockCart = { items: [{ productId: '1', quantity: 2 }], total: 100 };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockCart));

      const result = await cart.getCart('user123');

      expect(result).toEqual(mockCart);
      expect(mockRedis.get).toHaveBeenCalledWith('cart:user123');
    });

    it('should return empty cart if not exists', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cart.getCart('user123');

      expect(result).toEqual({ items: [], total: 0 });
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ items: [], total: 0 }));
      mockRedis.set.mockResolvedValue('OK');

      const item = { productId: '1', name: 'Rosas', price: 50, quantity: 2 };
      const result = await cart.addItem('user123', item);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(item);
      expect(result.total).toBe(100);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'cart:user123',
        expect.any(String),
        expect.objectContaining({ EX: 86400 })
      );
    });

    it('should update quantity if item already exists', async () => {
      const existingItem = { productId: '1', name: 'Rosas', price: 50, quantity: 2 };
      mockRedis.get.mockResolvedValue(JSON.stringify({ items: [existingItem], total: 100 }));
      mockRedis.set.mockResolvedValue('OK');

      const newItem = { productId: '1', name: 'Rosas', price: 50, quantity: 3 };
      const result = await cart.addItem('user123', newItem);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(5);
      expect(result.total).toBe(250);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const mockCart = {
        items: [
          { productId: '1', price: 50, quantity: 2 },
          { productId: '2', price: 30, quantity: 1 },
        ],
        total: 130,
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockCart));
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.removeItem('user123', '1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('2');
      expect(result.total).toBe(30);
    });
  });

  describe('clearCart', () => {
    it('should clear cart completely', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const result = await cart.clearCart('user123');

      expect(result).toEqual({ items: [], total: 0 });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'cart:user123',
        JSON.stringify({ items: [], total: 0 }),
        { EX: 86400 }
      );
    });
  });
});
