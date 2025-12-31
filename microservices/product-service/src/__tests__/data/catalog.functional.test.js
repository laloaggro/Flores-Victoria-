// Import catalog directly - sin mock
const catalog = require('../../data/catalog');

describe('Product Catalog - Functional Tests', () => {
  describe('Catalog Structure', () => {
    test('catalog is defined', () => {
      expect(catalog).toBeDefined();
    });

    test('catalog is an object', () => {
      expect(typeof catalog).toBe('object');
      expect(catalog).not.toBeNull();
    });

    test('catalog has categories', () => {
      const categories = Object.keys(catalog);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('each category contains product arrays', () => {
      for (const category in catalog) {
        expect(Array.isArray(catalog[category])).toBe(true);
      }
    });
  });

  describe('Product Properties', () => {
    let allProducts;

    beforeAll(() => {
      allProducts = [];
      for (const category in catalog) {
        allProducts = allProducts.concat(catalog[category]);
      }
    });

    test('all products have id', () => {
      for (const product of allProducts) {
        expect(product.id).toBeDefined();
        expect(typeof product.id).toBe('string');
      }
    });

    test('all products have name', () => {
      for (const product of allProducts) {
        expect(product.name).toBeDefined();
        expect(typeof product.name).toBe('string');
      }
    });

    test('all products have price', () => {
      for (const product of allProducts) {
        expect(product.price).toBeDefined();
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThan(0);
      }
    });

    test('all products have description', () => {
      for (const product of allProducts) {
        expect(product.description).toBeDefined();
        expect(typeof product.description).toBe('string');
        expect(product.description.length).toBeGreaterThan(0);
      }
    });

    test('all products have occasions', () => {
      for (const product of allProducts) {
        expect(product.occasions).toBeDefined();
        expect(Array.isArray(product.occasions)).toBe(true);
      }
    });

    test('all products have category', () => {
      for (const product of allProducts) {
        expect(product.category).toBeDefined();
        expect(typeof product.category).toBe('string');
      }
    });

    test('all products have stock', () => {
      for (const product of allProducts) {
        expect(product.stock).toBeDefined();
        expect(typeof product.stock).toBe('number');
      }
    });
  });

  describe('Catalog Operations', () => {
    test('can filter by category', () => {
      const categories = Object.keys(catalog);
      const firstCategory = categories[0];
      const products = catalog[firstCategory];
      expect(products.length).toBeGreaterThan(0);
    });

    test('can find products by occasion', () => {
      let found = false;
      for (const category in catalog) {
        for (const product of catalog[category]) {
          if (product.occasions && product.occasions.length > 0) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      expect(found).toBe(true);
    });

    test('product IDs are unique', () => {
      const allProducts = [];
      for (const category in catalog) {
        allProducts.push(...catalog[category]);
      }
      const ids = allProducts.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    test('can calculate total inventory', () => {
      let totalStock = 0;
      for (const category in catalog) {
        for (const product of catalog[category]) {
          totalStock += product.stock;
        }
      }
      expect(totalStock).toBeGreaterThan(0);
    });

    test('can find products by price range', () => {
      const allProducts = [];
      for (const category in catalog) {
        allProducts.push(...catalog[category]);
      }
      const affordableProducts = allProducts.filter(p => p.price <= 50);
      expect(affordableProducts.length).toBeGreaterThan(0);
    });
  });
});
