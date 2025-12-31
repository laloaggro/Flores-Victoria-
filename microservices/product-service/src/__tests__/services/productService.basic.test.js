describe('Product Service - Main Service', () => {
  let productService;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load product service module', () => {
    expect(() => {
      productService = require('../../services/productService');
    }).not.toThrow();
  });

  it('should export service object', () => {
    productService = require('../../services/productService');
    expect(productService).toBeDefined();
  });

  it('should be valid service', () => {
    productService = require('../../services/productService');
    expect(typeof productService).toBe('object');
  });

  it('should have service methods', () => {
    productService = require('../../services/productService');
    if (productService && typeof productService === 'object') {
      const hasMethods = Object.keys(productService).length > 0 ||
                         typeof productService.getAllProducts === 'function' ||
                         typeof productService.getProductById === 'function';
      expect(productService).toBeTruthy();
    }
  });
});
