/**
 * Tests para mcp-helper de order-service
 */

const mcpHelper = require('../../mcp-helper');

describe('MCP Helper - Order Service', () => {
  it('should be defined', () => {
    expect(mcpHelper).toBeDefined();
  });

  it('should export helper functions', () => {
    expect(typeof mcpHelper).toBe('object');
  });

  describe('validateOrderFormat', () => {
    it('should validate correct order format', () => {
      const order = {
        userId: 'user123',
        items: [{ productId: 'p1', quantity: 1, price: 100 }],
        total: 100,
        shippingAddress: { street: '123 Main St' },
        paymentMethod: 'credit_card',
      };
      expect(mcpHelper.validateOrderFormat(order)).toBe(true);
    });

    it('should reject null or undefined order', () => {
      expect(mcpHelper.validateOrderFormat(null)).toBe(false);
      expect(mcpHelper.validateOrderFormat(undefined)).toBe(false);
    });

    it('should reject non-object order', () => {
      expect(mcpHelper.validateOrderFormat('string')).toBe(false);
      expect(mcpHelper.validateOrderFormat(123)).toBe(false);
    });

    it('should reject order missing userId', () => {
      const order = {
        items: [],
        total: 100,
        shippingAddress: {},
        paymentMethod: 'card',
      };
      expect(mcpHelper.validateOrderFormat(order)).toBe(false);
    });

    it('should reject order missing items', () => {
      const order = {
        userId: 'user123',
        total: 100,
        shippingAddress: {},
        paymentMethod: 'card',
      };
      expect(mcpHelper.validateOrderFormat(order)).toBe(false);
    });

    it('should reject order missing total', () => {
      const order = {
        userId: 'user123',
        items: [],
        shippingAddress: {},
        paymentMethod: 'card',
      };
      expect(mcpHelper.validateOrderFormat(order)).toBe(false);
    });

    it('should reject order missing shippingAddress', () => {
      const order = {
        userId: 'user123',
        items: [],
        total: 100,
        paymentMethod: 'card',
      };
      expect(mcpHelper.validateOrderFormat(order)).toBe(false);
    });

    it('should reject order missing paymentMethod', () => {
      const order = {
        userId: 'user123',
        items: [],
        total: 100,
        shippingAddress: {},
      };
      expect(mcpHelper.validateOrderFormat(order)).toBe(false);
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate total for single item', () => {
      const items = [{ price: 100, quantity: 2 }];
      expect(mcpHelper.calculateOrderTotal(items)).toBe(200);
    });

    it('should calculate total for multiple items', () => {
      const items = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 3 },
        { price: 25, quantity: 1 },
      ];
      expect(mcpHelper.calculateOrderTotal(items)).toBe(375);
    });

    it('should return 0 for empty array', () => {
      expect(mcpHelper.calculateOrderTotal([])).toBe(0);
    });

    it('should return 0 for non-array', () => {
      expect(mcpHelper.calculateOrderTotal(null)).toBe(0);
      expect(mcpHelper.calculateOrderTotal('string')).toBe(0);
    });

    it('should handle invalid price as 0', () => {
      const items = [
        { price: 'invalid', quantity: 2 },
        { price: 50, quantity: 1 },
      ];
      expect(mcpHelper.calculateOrderTotal(items)).toBe(50);
    });

    it('should handle invalid quantity as 0', () => {
      const items = [
        { price: 100, quantity: 'invalid' },
        { price: 50, quantity: 2 },
      ];
      expect(mcpHelper.calculateOrderTotal(items)).toBe(100);
    });

    it('should handle decimal prices', () => {
      const items = [
        { price: 10.5, quantity: 2 },
        { price: 15.75, quantity: 1 },
      ];
      expect(mcpHelper.calculateOrderTotal(items)).toBe(36.75);
    });
  });

  describe('canCancelOrder', () => {
    it('should allow cancellation of pending orders', () => {
      expect(mcpHelper.canCancelOrder('pending')).toBe(true);
    });

    it('should allow cancellation of processing orders', () => {
      expect(mcpHelper.canCancelOrder('processing')).toBe(true);
    });

    it('should allow cancellation of confirmed orders', () => {
      expect(mcpHelper.canCancelOrder('confirmed')).toBe(true);
    });

    it('should not allow cancellation of shipped orders', () => {
      expect(mcpHelper.canCancelOrder('shipped')).toBe(false);
    });

    it('should not allow cancellation of delivered orders', () => {
      expect(mcpHelper.canCancelOrder('delivered')).toBe(false);
    });

    it('should not allow cancellation of already cancelled orders', () => {
      expect(mcpHelper.canCancelOrder('cancelled')).toBe(false);
    });

    it('should handle undefined status', () => {
      expect(mcpHelper.canCancelOrder(undefined)).toBe(true);
    });

    it('should handle null status', () => {
      expect(mcpHelper.canCancelOrder(null)).toBe(true);
    });
  });

  describe('formatOrderResponse', () => {
    it('should return null for null order', () => {
      expect(mcpHelper.formatOrderResponse(null)).toBeNull();
    });

    it('should return null for undefined order', () => {
      expect(mcpHelper.formatOrderResponse(undefined)).toBeNull();
    });

    it('should format complete order correctly', () => {
      const order = {
        _id: 'order123',
        orderNumber: 'ORD-001',
        userId: 'user123',
        items: [{ productId: 'p1', quantity: 1 }],
        subtotal: 100,
        taxes: 10,
        shipping: 5,
        discount: 15,
        total: 100,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'card',
        paymentStatus: 'paid',
        shippingAddress: { street: '123 Main' },
        trackingNumber: 'TRACK123',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      const formatted = mcpHelper.formatOrderResponse(order);
      expect(formatted.id).toBe('order123');
      expect(formatted.orderNumber).toBe('ORD-001');
      expect(formatted.userId).toBe('user123');
      expect(formatted.items).toEqual([{ productId: 'p1', quantity: 1 }]);
      expect(formatted.subtotal).toBe(100);
      expect(formatted.taxes).toBe(10);
      expect(formatted.shipping).toBe(5);
      expect(formatted.discount).toBe(15);
      expect(formatted.total).toBe(100);
      expect(formatted.currency).toBe('USD');
      expect(formatted.status).toBe('pending');
      expect(formatted.paymentMethod).toBe('card');
      expect(formatted.paymentStatus).toBe('paid');
      expect(formatted.trackingNumber).toBe('TRACK123');
    });

    it('should use default values for missing fields', () => {
      const order = {
        _id: 'order123',
        orderNumber: 'ORD-001',
        userId: 'user123',
        items: [],
        subtotal: 100,
        total: 100,
        status: 'pending',
        paymentMethod: 'card',
        paymentStatus: 'pending',
        shippingAddress: {},
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      const formatted = mcpHelper.formatOrderResponse(order);
      expect(formatted.taxes).toBe(0);
      expect(formatted.shipping).toBe(0);
      expect(formatted.discount).toBe(0);
      expect(formatted.currency).toBe('CLP');
      expect(formatted.trackingNumber).toBeUndefined();
    });

    it('should handle order with id field instead of _id', () => {
      const order = {
        id: 'order456',
        orderNumber: 'ORD-002',
        userId: 'user456',
        items: [],
        subtotal: 50,
        total: 50,
        status: 'delivered',
        paymentMethod: 'paypal',
        paymentStatus: 'paid',
        shippingAddress: {},
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      const formatted = mcpHelper.formatOrderResponse(order);
      expect(formatted.id).toBe('order456');
    });
  });

  describe('validateOrderItems', () => {
    it('should validate correct items', () => {
      const items = [
        { productId: 'p1', name: 'Product 1', price: 100, quantity: 1 },
        { productId: 'p2', name: 'Product 2', price: 50, quantity: 2 },
      ];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject non-array items', () => {
      const result = mcpHelper.validateOrderItems('not-array');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Items debe ser un array');
    });

    it('should reject null items', () => {
      const result = mcpHelper.validateOrderItems(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Items debe ser un array');
    });

    it('should reject empty array', () => {
      const result = mcpHelper.validateOrderItems([]);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La orden debe contener al menos un item');
    });

    it('should reject item without productId', () => {
      const items = [{ name: 'Product 1', price: 100, quantity: 1 }];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item 1: productId es requerido');
    });

    it('should reject item without name', () => {
      const items = [{ productId: 'p1', price: 100, quantity: 1 }];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item 1: name es requerido');
    });

    it('should reject item with invalid price', () => {
      const items = [{ productId: 'p1', name: 'Product 1', price: 0, quantity: 1 }];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item 1: price debe ser mayor a 0');
    });

    it('should reject item with negative price', () => {
      const items = [{ productId: 'p1', name: 'Product 1', price: -10, quantity: 1 }];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item 1: price debe ser mayor a 0');
    });

    it('should reject item without quantity', () => {
      const items = [{ productId: 'p1', name: 'Product 1', price: 100 }];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item 1: quantity debe ser mayor a 0');
    });

    it('should reject item with zero quantity', () => {
      const items = [{ productId: 'p1', name: 'Product 1', price: 100, quantity: 0 }];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item 1: quantity debe ser mayor a 0');
    });

    it('should collect multiple errors for same item', () => {
      const items = [{ productId: '', name: '', price: 0, quantity: 0 }];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });

    it('should validate multiple items and report errors for specific items', () => {
      const items = [
        { productId: 'p1', name: 'Product 1', price: 100, quantity: 1 },
        { productId: '', name: 'Product 2', price: 0, quantity: 1 },
        { productId: 'p3', name: 'Product 3', price: 50, quantity: 2 },
      ];
      const result = mcpHelper.validateOrderItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Item 2'))).toBe(true);
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate subtotal from order items', () => {
      const order = {
        items: [
          { price: 100, quantity: 2 },
          { price: 50, quantity: 1 },
        ],
      };
      expect(mcpHelper.calculateSubtotal(order)).toBe(250);
    });

    it('should return 0 for order without items', () => {
      expect(mcpHelper.calculateSubtotal({})).toBe(0);
    });

    it('should return 0 for null order', () => {
      expect(mcpHelper.calculateSubtotal(null)).toBe(0);
    });

    it('should return 0 for undefined order', () => {
      expect(mcpHelper.calculateSubtotal(undefined)).toBe(0);
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with default prefix', () => {
      const orderNumber = mcpHelper.generateOrderNumber();
      expect(orderNumber).toMatch(/^ORD-\d+-\d{3}$/);
    });

    it('should generate order number with custom prefix', () => {
      const orderNumber = mcpHelper.generateOrderNumber('CUSTOM');
      expect(orderNumber).toMatch(/^CUSTOM-\d+-\d{3}$/);
    });

    it('should generate unique order numbers', () => {
      const num1 = mcpHelper.generateOrderNumber();
      const num2 = mcpHelper.generateOrderNumber();
      expect(num1).not.toBe(num2);
    });

    it('should include timestamp', () => {
      const orderNumber = mcpHelper.generateOrderNumber();
      const timestamp = orderNumber.split('-')[1];
      expect(parseInt(timestamp, 10)).toBeGreaterThan(0);
    });

    it('should include 3-digit random number', () => {
      const orderNumber = mcpHelper.generateOrderNumber();
      const random = orderNumber.split('-')[2];
      expect(random.length).toBe(3);
    });
  });

  describe('isOrderPaid', () => {
    it('should return true for paid order', () => {
      const order = { paymentStatus: 'paid' };
      expect(mcpHelper.isOrderPaid(order)).toBe(true);
    });

    it('should return true for completed payment', () => {
      const order = { paymentStatus: 'completed' };
      expect(mcpHelper.isOrderPaid(order)).toBe(true);
    });

    it('should return false for pending payment', () => {
      const order = { paymentStatus: 'pending' };
      expect(mcpHelper.isOrderPaid(order)).toBe(false);
    });

    it('should return false for failed payment', () => {
      const order = { paymentStatus: 'failed' };
      expect(mcpHelper.isOrderPaid(order)).toBe(false);
    });

    it('should return false for order without paymentStatus', () => {
      expect(mcpHelper.isOrderPaid({})).toBe(false);
    });

    it('should return false for null order', () => {
      expect(mcpHelper.isOrderPaid(null)).toBe(false);
    });

    it('should return false for undefined order', () => {
      expect(mcpHelper.isOrderPaid(undefined)).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for pending status', () => {
      const transitions = mcpHelper.getValidTransitions('pending');
      expect(transitions).toEqual(['processing', 'cancelled']);
    });

    it('should return valid transitions for processing status', () => {
      const transitions = mcpHelper.getValidTransitions('processing');
      expect(transitions).toEqual(['confirmed', 'cancelled']);
    });

    it('should return valid transitions for confirmed status', () => {
      const transitions = mcpHelper.getValidTransitions('confirmed');
      expect(transitions).toEqual(['shipped', 'cancelled']);
    });

    it('should return valid transitions for shipped status', () => {
      const transitions = mcpHelper.getValidTransitions('shipped');
      expect(transitions).toEqual(['delivered']);
    });

    it('should return empty array for delivered status', () => {
      const transitions = mcpHelper.getValidTransitions('delivered');
      expect(transitions).toEqual([]);
    });

    it('should return empty array for cancelled status', () => {
      const transitions = mcpHelper.getValidTransitions('cancelled');
      expect(transitions).toEqual([]);
    });

    it('should return empty array for unknown status', () => {
      const transitions = mcpHelper.getValidTransitions('unknown');
      expect(transitions).toEqual([]);
    });

    it('should return empty array for null status', () => {
      const transitions = mcpHelper.getValidTransitions(null);
      expect(transitions).toEqual([]);
    });
  });

  describe('isValidTransition', () => {
    it('should allow transition from pending to processing', () => {
      expect(mcpHelper.isValidTransition('pending', 'processing')).toBe(true);
    });

    it('should allow transition from pending to cancelled', () => {
      expect(mcpHelper.isValidTransition('pending', 'cancelled')).toBe(true);
    });

    it('should not allow transition from pending to shipped', () => {
      expect(mcpHelper.isValidTransition('pending', 'shipped')).toBe(false);
    });

    it('should allow transition from processing to confirmed', () => {
      expect(mcpHelper.isValidTransition('processing', 'confirmed')).toBe(true);
    });

    it('should allow transition from confirmed to shipped', () => {
      expect(mcpHelper.isValidTransition('confirmed', 'shipped')).toBe(true);
    });

    it('should allow transition from shipped to delivered', () => {
      expect(mcpHelper.isValidTransition('shipped', 'delivered')).toBe(true);
    });

    it('should not allow transition from delivered to any status', () => {
      expect(mcpHelper.isValidTransition('delivered', 'cancelled')).toBe(false);
      expect(mcpHelper.isValidTransition('delivered', 'shipped')).toBe(false);
    });

    it('should not allow transition from cancelled to any status', () => {
      expect(mcpHelper.isValidTransition('cancelled', 'processing')).toBe(false);
    });

    it('should not allow backward transitions', () => {
      expect(mcpHelper.isValidTransition('shipped', 'confirmed')).toBe(false);
      expect(mcpHelper.isValidTransition('confirmed', 'processing')).toBe(false);
    });

    it('should handle unknown current status', () => {
      expect(mcpHelper.isValidTransition('unknown', 'processing')).toBe(false);
    });
  });
});
