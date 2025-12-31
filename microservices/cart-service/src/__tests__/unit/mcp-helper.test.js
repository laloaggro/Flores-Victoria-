/**
 * Tests para mcp-helper de cart-service
 */

const mcpHelper = require('../../mcp-helper');

describe('MCP Helper - Cart Service', () => {
  describe('validateCartItem', () => {
    it('should validate a valid cart item', () => {
      const validItem = {
        productId: '123',
        quantity: 2,
        price: 100,
      };
      expect(() => mcpHelper.validateCartItem(validItem)).not.toThrow();
    });

    it('should throw error for null item', () => {
      expect(() => mcpHelper.validateCartItem(null)).toThrow('Item debe ser un objeto');
    });

    it('should throw error for missing productId', () => {
      expect(() => mcpHelper.validateCartItem({ quantity: 2, price: 100 })).toThrow(
        'Item debe tener productId'
      );
    });

    it('should throw error for invalid quantity', () => {
      expect(() =>
        mcpHelper.validateCartItem({ productId: '123', quantity: 0, price: 100 })
      ).toThrow('La cantidad debe ser un número mayor a 0');
    });

    it('should throw error for negative price', () => {
      expect(() =>
        mcpHelper.validateCartItem({ productId: '123', quantity: 2, price: -10 })
      ).toThrow('El precio debe ser un número no negativo');
    });
  });

  describe('calculateItemTotal', () => {
    it('should calculate total for valid item', () => {
      const item = { quantity: 3, price: 100 };
      expect(mcpHelper.calculateItemTotal(item)).toBe(300);
    });

    it('should return 0 for null item', () => {
      expect(mcpHelper.calculateItemTotal(null)).toBe(0);
    });

    it('should handle string numbers', () => {
      const item = { quantity: '2', price: '50.5' };
      expect(mcpHelper.calculateItemTotal(item)).toBe(101);
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate total for multiple items', () => {
      const items = [
        { quantity: 2, price: 100 },
        { quantity: 1, price: 50 },
      ];
      expect(mcpHelper.calculateCartTotal(items)).toBe(250);
    });

    it('should return 0 for empty array', () => {
      expect(mcpHelper.calculateCartTotal([])).toBe(0);
    });

    it('should return 0 for non-array', () => {
      expect(mcpHelper.calculateCartTotal(null)).toBe(0);
    });
  });

  describe('isCartEmpty', () => {
    it('should return true for empty cart', () => {
      expect(mcpHelper.isCartEmpty({ items: [] })).toBe(true);
    });

    it('should return false for cart with items', () => {
      expect(mcpHelper.isCartEmpty({ items: [{ productId: '123' }] })).toBe(false);
    });

    it('should return true for null cart', () => {
      expect(mcpHelper.isCartEmpty(null)).toBe(true);
    });
  });

  describe('formatCartResponse', () => {
    it('should format cart correctly', () => {
      const cart = {
        userId: 'user123',
        items: [{ productId: 'p1', quantity: 2, price: 100 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const formatted = mcpHelper.formatCartResponse(cart);
      expect(formatted).toHaveProperty('userId', 'user123');
      expect(formatted).toHaveProperty('items');
      expect(formatted).toHaveProperty('itemCount', 1);
      expect(formatted).toHaveProperty('total', 200);
    });

    it('should return null for null cart', () => {
      expect(mcpHelper.formatCartResponse(null)).toBeNull();
    });
  });

  describe('findCartItem', () => {
    const items = [
      { productId: '123', quantity: 1 },
      { productId: '456', quantity: 2 },
    ];

    it('should find item by productId', () => {
      const item = mcpHelper.findCartItem(items, '123');
      expect(item).toBeDefined();
      expect(item.productId).toBe('123');
    });

    it('should return null for non-existing item', () => {
      expect(mcpHelper.findCartItem(items, '999')).toBeNull();
    });

    it('should return null for invalid inputs', () => {
      expect(mcpHelper.findCartItem(null, '123')).toBeNull();
      expect(mcpHelper.findCartItem(items, null)).toBeNull();
    });
  });

  describe('hasEnoughStock', () => {
    it('should return true when stock is sufficient', () => {
      const item = { quantity: 3 };
      expect(mcpHelper.hasEnoughStock(item, 5)).toBe(true);
    });

    it('should return false when stock is insufficient', () => {
      const item = { quantity: 10 };
      expect(mcpHelper.hasEnoughStock(item, 5)).toBe(false);
    });

    it('should return false for invalid inputs', () => {
      expect(mcpHelper.hasEnoughStock(null, 5)).toBe(false);
      expect(mcpHelper.hasEnoughStock({ quantity: 3 }, 'invalid')).toBe(false);
    });
  });
});
