const {
  calculateDiscount,
  formatProduct,
  validateProduct,
  generateSlug,
  getStockStatus,
} = require('../../utils/productUtils');

describe('Product Utils', () => {
  describe('calculateDiscount', () => {
    it('should calculate discount correctly', () => {
      expect(calculateDiscount(100, 10)).toBe(90);
      expect(calculateDiscount(50, 20)).toBe(40);
      expect(calculateDiscount(200, 50)).toBe(100);
    });

    it('should handle zero discount', () => {
      expect(calculateDiscount(100, 0)).toBe(100);
    });

    it('should handle 100% discount', () => {
      expect(calculateDiscount(100, 100)).toBe(0);
    });

    it('should throw error for negative values', () => {
      expect(() => calculateDiscount(-100, 10)).toThrow();
      expect(() => calculateDiscount(100, -10)).toThrow();
    });
  });

  describe('formatProduct', () => {
    it('should format product data correctly', () => {
      const rawProduct = {
        _id: '123',
        name: 'Rose Bouquet',
        description: 'Beautiful roses',
        price: 29.99,
        category: 'bouquets',
        stock: 10,
        images: ['image1.jpg', 'image2.jpg'],
      };

      const formatted = formatProduct(rawProduct);

      expect(formatted).toHaveProperty('id', '123');
      expect(formatted).toHaveProperty('name', 'Rose Bouquet');
      expect(formatted).toHaveProperty('price', 29.99);
      expect(formatted).toHaveProperty('formattedPrice', '$29.99');
      expect(formatted).toHaveProperty('category', 'bouquets');
      expect(formatted).toHaveProperty('stock', 10);
      expect(formatted.images).toHaveLength(2);
    });

    it('should handle missing fields with defaults', () => {
      const minimalProduct = { _id: '456' };
      const formatted = formatProduct(minimalProduct);

      expect(formatted).toHaveProperty('id', '456');
      expect(formatted).toHaveProperty('name', 'Unknown');
      expect(formatted).toHaveProperty('description', '');
      expect(formatted).toHaveProperty('price', 0);
      expect(formatted).toHaveProperty('stock', 0);
      expect(formatted.images).toEqual([]);
    });

    it('should throw error for invalid input', () => {
      expect(() => formatProduct(null)).toThrow();
      expect(() => formatProduct(undefined)).toThrow();
      expect(() => formatProduct('not an object')).toThrow();
    });
  });

  describe('validateProduct', () => {
    it('should validate correct product data', () => {
      const validProduct = {
        name: 'Rose Bouquet',
        price: 29.99,
        category: 'bouquets',
        stock: 10,
      };

      const result = validateProduct(validProduct);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const result = validateProduct({});
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return error for invalid price', () => {
      const invalidProduct = {
        name: 'Test Product',
        price: -10,
        category: 'test',
        stock: 5,
      };

      const result = validateProduct(invalidProduct);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes('price'))).toBe(true);
    });

    it('should return error for short name', () => {
      const result = validateProduct({
        name: 'AB',
        price: 10,
        category: 'test',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes('name'))).toBe(true);
    });

    it('should return error for negative stock', () => {
      const result = validateProduct({
        name: 'Test Product',
        price: 10,
        category: 'test',
        stock: -5,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((err) => err.includes('stock'))).toBe(true);
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from product name', () => {
      expect(generateSlug('Rose Bouquet')).toBe('rose-bouquet');
      expect(generateSlug('Beautiful Red Roses')).toBe('beautiful-red-roses');
    });

    it('should handle special characters', () => {
      const slug = generateSlug('Rosas @ $29.99');
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug).toBe('rosas-2999');
    });

    it('should handle accented characters', () => {
      expect(generateSlug('Café con Leche')).toBe('cafe-con-leche');
      expect(generateSlug('Niño Feliz')).toBe('nino-feliz');
    });

    it('should throw error for invalid input', () => {
      expect(() => generateSlug(null)).toThrow();
      expect(() => generateSlug(undefined)).toThrow();
      expect(() => generateSlug(123)).toThrow();
    });
  });

  describe('getStockStatus', () => {
    it('should return out_of_stock for zero stock', () => {
      expect(getStockStatus(0)).toBe('out_of_stock');
      expect(getStockStatus(-1)).toBe('out_of_stock');
    });

    it('should return low_stock for low quantities', () => {
      expect(getStockStatus(1)).toBe('low_stock');
      expect(getStockStatus(5)).toBe('low_stock');
    });

    it('should return medium_stock for medium quantities', () => {
      expect(getStockStatus(6)).toBe('medium_stock');
      expect(getStockStatus(20)).toBe('medium_stock');
    });

    it('should return in_stock for high quantities', () => {
      expect(getStockStatus(21)).toBe('in_stock');
      expect(getStockStatus(100)).toBe('in_stock');
    });
  });
});
