/**
 * Unit tests for Cart calculation helpers
 */

/**
 * Calculate cart total from items
 * @param {Array} items - Cart items with price and quantity
 * @returns {number} Total price
 */
const calculateCartTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      return total;
    }
    return total + item.price * item.quantity;
  }, 0);
};

/**
 * Merge item into cart items array
 * @param {Array} items - Existing cart items
 * @param {Object} newItem - Item to add/merge
 * @returns {Array} Updated items array
 */
const mergeCartItem = (items, newItem) => {
  if (!Array.isArray(items) || !newItem || !newItem.productId) {
    return items || [];
  }

  const existingIndex = items.findIndex((i) => i.productId === newItem.productId);

  if (existingIndex >= 0) {
    // Update existing item
    const updatedItems = [...items];
    updatedItems[existingIndex] = {
      ...updatedItems[existingIndex],
      quantity: updatedItems[existingIndex].quantity + (newItem.quantity || 1),
    };
    return updatedItems;
  }

  // Add new item
  return [...items, newItem];
};

/**
 * Remove item from cart
 * @param {Array} items - Cart items
 * @param {string} productId - Product ID to remove
 * @returns {Array} Updated items array
 */
const removeCartItem = (items, productId) => {
  if (!Array.isArray(items) || !productId) {
    return items || [];
  }
  return items.filter((item) => item.productId !== productId);
};

/**
 * Update item quantity
 * @param {Array} items - Cart items
 * @param {string} productId - Product ID to update
 * @param {number} quantity - New quantity
 * @returns {Array} Updated items array
 */
const updateCartItemQuantity = (items, productId, quantity) => {
  if (!Array.isArray(items) || !productId || typeof quantity !== 'number' || quantity < 0) {
    return items || [];
  }

  const updatedItems = [...items];
  const index = updatedItems.findIndex((i) => i.productId === productId);

  if (index >= 0) {
    if (quantity === 0) {
      // Remove item if quantity is 0
      return updatedItems.filter((_, i) => i !== index);
    }
    updatedItems[index] = { ...updatedItems[index], quantity };
  }

  return updatedItems;
};

describe('Cart Helper Functions - Total Calculation', () => {
  describe('calculateCartTotal', () => {
    it('should calculate total for multiple items', () => {
      const items = [
        { productId: '1', price: 100, quantity: 2 },
        { productId: '2', price: 50, quantity: 3 },
        { productId: '3', price: 25, quantity: 1 },
      ];
      expect(calculateCartTotal(items)).toBe(375); // 200 + 150 + 25
    });

    it('should return 0 for empty cart', () => {
      expect(calculateCartTotal([])).toBe(0);
    });

    it('should handle single item', () => {
      const items = [{ productId: '1', price: 50, quantity: 1 }];
      expect(calculateCartTotal(items)).toBe(50);
    });

    it('should handle items with decimal prices', () => {
      const items = [
        { productId: '1', price: 19.99, quantity: 2 },
        { productId: '2', price: 5.5, quantity: 3 },
      ];
      expect(calculateCartTotal(items)).toBeCloseTo(56.48, 2);
    });

    it('should handle invalid input gracefully', () => {
      expect(calculateCartTotal(null)).toBe(0);
      expect(calculateCartTotal(undefined)).toBe(0);
      expect(calculateCartTotal('not an array')).toBe(0);
    });

    it('should skip items with invalid data', () => {
      const items = [
        { productId: '1', price: 100, quantity: 2 },
        { productId: '2', price: 'invalid', quantity: 3 }, // Invalid price
        { productId: '3', price: 50 }, // Missing quantity
        null, // Null item
        { productId: '4', price: 25, quantity: 2 },
      ];
      expect(calculateCartTotal(items)).toBe(250); // Only valid items: 200 + 50
    });
  });
});

describe('Cart Helper Functions - Item Management', () => {
  describe('mergeCartItem', () => {
    it('should add new item to empty cart', () => {
      const items = [];
      const newItem = { productId: '1', price: 100, quantity: 1, name: 'Product 1' };
      const result = mergeCartItem(items, newItem);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(newItem);
    });

    it('should add new item to existing cart', () => {
      const items = [{ productId: '1', price: 100, quantity: 2 }];
      const newItem = { productId: '2', price: 50, quantity: 1 };
      const result = mergeCartItem(items, newItem);

      expect(result).toHaveLength(2);
      expect(result[1]).toEqual(newItem);
    });

    it('should merge quantity when item already exists', () => {
      const items = [{ productId: '1', price: 100, quantity: 2, name: 'Product 1' }];
      const newItem = { productId: '1', price: 100, quantity: 3 };
      const result = mergeCartItem(items, newItem);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(5); // 2 + 3
      expect(result[0].name).toBe('Product 1'); // Original data preserved
    });

    it('should handle invalid inputs', () => {
      expect(mergeCartItem(null, { productId: '1', quantity: 1 })).toEqual([]);
      expect(mergeCartItem([], null)).toEqual([]);
      expect(mergeCartItem([], { quantity: 1 })).toEqual([]); // Missing productId
    });

    it('should not mutate original array', () => {
      const items = [{ productId: '1', price: 100, quantity: 2 }];
      const originalLength = items.length;
      mergeCartItem(items, { productId: '2', price: 50, quantity: 1 });

      expect(items).toHaveLength(originalLength); // Original unchanged
    });
  });

  describe('removeCartItem', () => {
    it('should remove item from cart', () => {
      const items = [
        { productId: '1', price: 100, quantity: 2 },
        { productId: '2', price: 50, quantity: 1 },
        { productId: '3', price: 25, quantity: 3 },
      ];
      const result = removeCartItem(items, '2');

      expect(result).toHaveLength(2);
      expect(result.find((i) => i.productId === '2')).toBeUndefined();
      expect(result[0].productId).toBe('1');
      expect(result[1].productId).toBe('3');
    });

    it('should return same array if item not found', () => {
      const items = [{ productId: '1', price: 100, quantity: 2 }];
      const result = removeCartItem(items, 'nonexistent');

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('1');
    });

    it('should handle empty cart', () => {
      expect(removeCartItem([], '1')).toEqual([]);
    });

    it('should handle invalid inputs', () => {
      const items = [{ productId: '1', price: 100, quantity: 2 }];
      expect(removeCartItem(null, '1')).toEqual([]);
      expect(removeCartItem(items, null)).toEqual(items);
      expect(removeCartItem(items, undefined)).toEqual(items);
    });

    it('should not mutate original array', () => {
      const items = [
        { productId: '1', price: 100, quantity: 2 },
        { productId: '2', price: 50, quantity: 1 },
      ];
      const originalLength = items.length;
      removeCartItem(items, '1');

      expect(items).toHaveLength(originalLength); // Original unchanged
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update item quantity', () => {
      const items = [
        { productId: '1', price: 100, quantity: 2 },
        { productId: '2', price: 50, quantity: 1 },
      ];
      const result = updateCartItemQuantity(items, '1', 5);

      expect(result[0].quantity).toBe(5);
      expect(result[1].quantity).toBe(1); // Other items unchanged
    });

    it('should remove item when quantity is 0', () => {
      const items = [
        { productId: '1', price: 100, quantity: 2 },
        { productId: '2', price: 50, quantity: 1 },
      ];
      const result = updateCartItemQuantity(items, '1', 0);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('2');
    });

    it('should not modify array if item not found', () => {
      const items = [{ productId: '1', price: 100, quantity: 2 }];
      const result = updateCartItemQuantity(items, 'nonexistent', 5);

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(2); // Unchanged
    });

    it('should handle invalid inputs', () => {
      const items = [{ productId: '1', price: 100, quantity: 2 }];

      expect(updateCartItemQuantity(null, '1', 5)).toEqual([]);
      expect(updateCartItemQuantity(items, null, 5)).toEqual(items);
      expect(updateCartItemQuantity(items, '1', 'invalid')).toEqual(items);
      expect(updateCartItemQuantity(items, '1', -1)).toEqual(items); // Negative quantity
    });

    it('should not mutate original array', () => {
      const items = [{ productId: '1', price: 100, quantity: 2 }];
      const originalQuantity = items[0].quantity;
      updateCartItemQuantity(items, '1', 10);

      expect(items[0].quantity).toBe(originalQuantity); // Original unchanged
    });
  });
});

describe('Cart Helper Functions - Integration', () => {
  it('should handle complete cart workflow', () => {
    let items = [];

    // Add first item
    items = mergeCartItem(items, { productId: '1', price: 100, quantity: 2, name: 'Roses' });
    expect(items).toHaveLength(1);
    expect(calculateCartTotal(items)).toBe(200);

    // Add second item
    items = mergeCartItem(items, { productId: '2', price: 50, quantity: 3, name: 'Tulips' });
    expect(items).toHaveLength(2);
    expect(calculateCartTotal(items)).toBe(350);

    // Add more of first item (merge)
    items = mergeCartItem(items, { productId: '1', price: 100, quantity: 1 });
    expect(items).toHaveLength(2);
    expect(items[0].quantity).toBe(3); // 2 + 1
    expect(calculateCartTotal(items)).toBe(450); // 300 + 150

    // Update quantity
    items = updateCartItemQuantity(items, '2', 5);
    expect(calculateCartTotal(items)).toBe(550); // 300 + 250

    // Remove item
    items = removeCartItem(items, '1');
    expect(items).toHaveLength(1);
    expect(calculateCartTotal(items)).toBe(250); // Only tulips

    // Clear cart
    items = updateCartItemQuantity(items, '2', 0);
    expect(items).toHaveLength(0);
    expect(calculateCartTotal(items)).toBe(0);
  });
});

// Export functions for use in other tests
module.exports = {
  calculateCartTotal,
  mergeCartItem,
  removeCartItem,
  updateCartItemQuantity,
};
