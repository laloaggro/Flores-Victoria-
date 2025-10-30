/**
 * Unit Tests for Product Utilities
 * Tests for productUtils.js helper functions
 */

const {
  calculateDiscount,
  formatProduct,
  validateProduct,
  getStockStatus,
  generateSlug,
} = require('../../utils/productUtils');

describe('Product Utilities - Unit Tests', () => {
  // ==========================================
  // calculateDiscount Tests
  // ==========================================
  describe('calculateDiscount', () => {
    test('should calculate 10% discount correctly', () => {
      const result = calculateDiscount(100, 10);
      expect(result).toBe(90);
    });

    test('should calculate 50% discount correctly', () => {
      const result = calculateDiscount(200, 50);
      expect(result).toBe(100);
    });

    test('should return same price for 0% discount', () => {
      const result = calculateDiscount(100, 0);
      expect(result).toBe(100);
    });

    test('should handle decimal prices correctly', () => {
      const result = calculateDiscount(99.99, 20);
      expect(result).toBeCloseTo(79.99, 2);
    });

    test('should throw error for negative price', () => {
      expect(() => calculateDiscount(-100, 10)).toThrow();
    });

    test('should throw error for negative discount', () => {
      expect(() => calculateDiscount(100, -10)).toThrow();
    });

    test('should handle 100% discount (free)', () => {
      const result = calculateDiscount(100, 100);
      expect(result).toBe(0);
    });
  });

  // ==========================================
  // formatProduct Tests
  // ==========================================
  describe('formatProduct', () => {
    test('should format complete product correctly', () => {
      const rawProduct = {
        _id: '123',
        name: 'Rosa Roja',
        description: 'Hermosa rosa roja',
        price: 15.99,
        category: 'flores',
        stock: 50,
        images: ['image1.jpg', 'image2.jpg'],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15'),
      };

      const formatted = formatProduct(rawProduct);

      expect(formatted).toMatchObject({
        id: '123',
        name: 'Rosa Roja',
        description: 'Hermosa rosa roja',
        price: 15.99,
        formattedPrice: '$15.99',
        category: 'flores',
        stock: 50,
        images: ['image1.jpg', 'image2.jpg'],
      });
      expect(formatted.createdAt).toBeInstanceOf(Date);
      expect(formatted.updatedAt).toBeInstanceOf(Date);
    });

    test('should handle missing optional fields', () => {
      const rawProduct = {
        _id: '456',
        name: 'Tulipán',
        price: 12.5,
      };

      const formatted = formatProduct(rawProduct);

      expect(formatted).toMatchObject({
        id: '456',
        name: 'Tulipán',
        description: '',
        price: 12.5,
        formattedPrice: '$12.50',
        category: 'uncategorized',
        stock: 0,
        images: [],
      });
    });

    test('should use default name for missing name', () => {
      const rawProduct = { _id: '789', price: 10 };
      const formatted = formatProduct(rawProduct);
      expect(formatted.name).toBe('Unknown');
    });

    test('should parse string price to number', () => {
      const rawProduct = {
        _id: '999',
        name: 'Test',
        price: '25.99',
      };

      const formatted = formatProduct(rawProduct);
      expect(formatted.price).toBe(25.99);
      expect(typeof formatted.price).toBe('number');
    });

    test('should parse string stock to integer', () => {
      const rawProduct = {
        _id: '111',
        name: 'Test',
        price: 10,
        stock: '30',
      };

      const formatted = formatProduct(rawProduct);
      expect(formatted.stock).toBe(30);
      expect(Number.isInteger(formatted.stock)).toBe(true);
    });

    test('should handle non-array images gracefully', () => {
      const rawProduct = {
        _id: '222',
        name: 'Test',
        price: 10,
        images: 'single-image.jpg',
      };

      const formatted = formatProduct(rawProduct);
      expect(Array.isArray(formatted.images)).toBe(true);
      expect(formatted.images).toEqual([]);
    });

    test('should throw error for null product', () => {
      expect(() => formatProduct(null)).toThrow('Invalid product data');
    });

    test('should throw error for non-object product', () => {
      expect(() => formatProduct('not an object')).toThrow('Invalid product data');
    });

    test('should format price with 2 decimals', () => {
      const rawProduct = { _id: '333', name: 'Test', price: 10.5 };
      const formatted = formatProduct(rawProduct);
      expect(formatted.formattedPrice).toBe('$10.50');
    });
  });

  // ==========================================
  // validateProduct Tests
  // ==========================================
  describe('validateProduct', () => {
    test('should validate correct product successfully', () => {
      const product = {
        name: 'Rosa Blanca',
        price: 20,
        category: 'flores',
        stock: 100,
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject product with short name', () => {
      const product = {
        name: 'AB',
        price: 20,
        category: 'flores',
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('name must be at least 3 characters');
    });

    test('should reject product with empty name', () => {
      const product = {
        name: '',
        price: 20,
        category: 'flores',
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject product with whitespace-only name', () => {
      const product = {
        name: '   ',
        price: 20,
        category: 'flores',
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
    });

    test('should reject product with zero price', () => {
      const product = {
        name: 'Test Product',
        price: 0,
        category: 'flores',
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('price must be greater than 0');
    });

    test('should reject product with negative price', () => {
      const product = {
        name: 'Test Product',
        price: -10,
        category: 'flores',
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
    });

    test('should reject product without category', () => {
      const product = {
        name: 'Test Product',
        price: 20,
        category: '',
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('must have a category');
    });

    test('should reject product with negative stock', () => {
      const product = {
        name: 'Test Product',
        price: 20,
        category: 'flores',
        stock: -5,
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Stock cannot be negative');
    });

    test('should allow zero stock', () => {
      const product = {
        name: 'Test Product',
        price: 20,
        category: 'flores',
        stock: 0,
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(true);
    });

    test('should collect multiple errors', () => {
      const product = {
        name: 'AB',
        price: -10,
        category: '',
        stock: -5,
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ==========================================
  // getStockStatus Tests
  // ==========================================
  describe('getStockStatus', () => {
    test('should return out_of_stock for zero stock', () => {
      expect(getStockStatus(0)).toBe('out_of_stock');
    });

    test('should return out_of_stock for negative stock', () => {
      expect(getStockStatus(-5)).toBe('out_of_stock');
    });

    test('should return low_stock for stock between 1-5', () => {
      expect(getStockStatus(1)).toBe('low_stock');
      expect(getStockStatus(3)).toBe('low_stock');
      expect(getStockStatus(5)).toBe('low_stock');
    });

    test('should return medium_stock for stock between 6-20', () => {
      expect(getStockStatus(6)).toBe('medium_stock');
      expect(getStockStatus(15)).toBe('medium_stock');
      expect(getStockStatus(20)).toBe('medium_stock');
    });

    test('should return in_stock for stock > 20', () => {
      expect(getStockStatus(21)).toBe('in_stock');
      expect(getStockStatus(50)).toBe('in_stock');
      expect(getStockStatus(1000)).toBe('in_stock');
    });

    test('should handle edge cases at boundaries', () => {
      expect(getStockStatus(5)).toBe('low_stock');
      expect(getStockStatus(6)).toBe('medium_stock');
      expect(getStockStatus(20)).toBe('medium_stock');
      expect(getStockStatus(21)).toBe('in_stock');
    });
  });

  // ==========================================
  // generateSlug Tests
  // ==========================================
  describe('generateSlug', () => {
    test('should generate slug from simple name', () => {
      expect(generateSlug('Rosa Roja')).toBe('rosa-roja');
    });

    test('should handle accented characters', () => {
      expect(generateSlug('Árbol de Navidad')).toBe('arbol-de-navidad');
      expect(generateSlug('Niño feliz')).toBe('nino-feliz');
    });

    test('should remove special characters', () => {
      expect(generateSlug('Rosa@#$ Roja!!!')).toBe('rosa-roja');
      expect(generateSlug('100% Natural')).toBe('100-natural');
    });

    test('should handle multiple spaces', () => {
      expect(generateSlug('Rosa    Blanca')).toBe('rosa-blanca');
    });

    test('should handle trailing/leading spaces', () => {
      expect(generateSlug('  Rosa Roja  ')).toBe('rosa-roja');
    });

    test('should convert to lowercase', () => {
      expect(generateSlug('ROSA ROJA')).toBe('rosa-roja');
      expect(generateSlug('RoSa RoJa')).toBe('rosa-roja');
    });

    test('should handle ñ character', () => {
      expect(generateSlug('Año Nuevo')).toBe('ano-nuevo');
    });

    test('should throw error for invalid input', () => {
      expect(() => generateSlug(null)).toThrow('Name must be a valid string');
      expect(() => generateSlug(undefined)).toThrow('Name must be a valid string');
      expect(() => generateSlug(123)).toThrow('Name must be a valid string');
      expect(() => generateSlug('')).toThrow('Name must be a valid string');
    });

    test('should remove consecutive hyphens', () => {
      expect(generateSlug('Rosa---Roja')).toBe('rosa-roja');
    });

    test('should handle complex Chilean product names', () => {
      expect(generateSlug('Ramo de Rosas Románticas')).toBe('ramo-de-rosas-romanticas');
      expect(generateSlug('Bouquet Día de la Madre')).toBe('bouquet-dia-de-la-madre');
    });
  });
});
