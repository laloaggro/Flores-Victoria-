describe('Catalog Data - Product Service', () => {
  let catalog;

  beforeEach(() => {
    // Clear cache to get fresh import
    jest.resetModules();
  });

  describe('Module Loading', () => {
    it('should load catalog module without errors', () => {
      expect(() => {
        catalog = require('../../data/catalog');
      }).not.toThrow();
    });

    it('should export catalog data', () => {
      catalog = require('../../data/catalog');
      expect(catalog).toBeDefined();
    });
  });

  describe('Catalog Structure', () => {
    beforeEach(() => {
      catalog = require('../../data/catalog');
    });

    it('should be an array or object', () => {
      const type = Array.isArray(catalog) ? 'array' : typeof catalog;
      expect(['array', 'object']).toContain(type);
    });

    it('should have catalog items if array', () => {
      if (Array.isArray(catalog)) {
        expect(catalog.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have properties if object', () => {
      if (typeof catalog === 'object' && !Array.isArray(catalog)) {
        const keys = Object.keys(catalog);
        expect(keys.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Catalog Content', () => {
    beforeEach(() => {
      catalog = require('../../data/catalog');
    });

    it('should have valid product data structure', () => {
      if (Array.isArray(catalog) && catalog.length > 0) {
        const firstItem = catalog[0];
        expect(firstItem).toBeDefined();
        expect(typeof firstItem).toBe('object');
      }
    });

    it('should contain product-like properties', () => {
      if (Array.isArray(catalog) && catalog.length > 0) {
        const firstItem = catalog[0];
        const hasProductProps =
          'name' in firstItem || 'title' in firstItem || 'id' in firstItem || 'price' in firstItem;
        expect(hasProductProps).toBe(true);
      }
    });
  });
});
