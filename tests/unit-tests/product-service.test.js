const {
  calculateDiscount,
  formatProduct,
} = require('../../microservices/product-service/src/utils/productUtils');

describe('Product Service - Unit Tests', () => {
  describe('calculateDiscount', () => {
    test('should calculate discount correctly', () => {
      expect(calculateDiscount(100, 10)).toBe(90);
      expect(calculateDiscount(50, 0)).toBe(50);
      expect(calculateDiscount(200, 25)).toBe(150);
    });

    test('should handle edge cases', () => {
      expect(calculateDiscount(0, 10)).toBe(0);
      expect(calculateDiscount(100, 100)).toBe(0);
      expect(calculateDiscount(100, 110)).toBeLessThan(0); // Negative price case
    });
  });

  describe('formatProduct', () => {
    test('should format product correctly', () => {
      const product = {
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        category: 'flowers',
      };

      const formatted = formatProduct(product);
      expect(formatted).toHaveProperty('name', 'Test Product');
      expect(formatted).toHaveProperty('price', 100);
      expect(formatted).toHaveProperty('description', 'Test Description');
      expect(formatted).toHaveProperty('category', 'flowers');
      expect(formatted).toHaveProperty('formattedPrice');
    });

    test('should handle missing properties', () => {
      const product = {
        name: 'Test Product',
      };

      const formatted = formatProduct(product);
      expect(formatted).toHaveProperty('name', 'Test Product');
      expect(formatted).toHaveProperty('price', 0);
    });
  });
});
