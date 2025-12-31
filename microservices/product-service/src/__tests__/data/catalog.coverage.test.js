const catalog = require('../../data/catalog');

describe('Catalog Data - Complete Coverage', () => {
  it('should export catalog object', () => {
    expect(catalog).toBeDefined();
    expect(typeof catalog).toBe('object');
  });

  it('should have product categories', () => {
    const keys = Object.keys(catalog);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('should contain arrays of products', () => {
    Object.values(catalog).forEach(category => {
      expect(Array.isArray(category)).toBe(true);
    });
  });

  it('should have products with all required fields', () => {
    const allProducts = Object.values(catalog).flat();
    expect(allProducts.length).toBeGreaterThan(0);
    
    allProducts.forEach(product => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('occasions');
      expect(product).toHaveProperty('category');
    });
  });

  it('should have valid prices', () => {
    const allProducts = Object.values(catalog).flat();
    allProducts.forEach(product => {
      expect(typeof product.price).toBe('number');
      expect(product.price).toBeGreaterThan(0);
    });
  });

  it('should have string descriptions', () => {
    const allProducts = Object.values(catalog).flat();
    allProducts.forEach(product => {
      expect(typeof product.description).toBe('string');
      expect(product.description.length).toBeGreaterThan(0);
    });
  });

  it('should have occasions as arrays', () => {
    const allProducts = Object.values(catalog).flat();
    allProducts.forEach(product => {
      expect(Array.isArray(product.occasions)).toBe(true);
    });
  });

  it('should be filterable by category', () => {
    const categories = Object.keys(catalog);
    expect(categories.length).toBeGreaterThan(0);
    
    const firstCategoryProducts = catalog[categories[0]];
    expect(Array.isArray(firstCategoryProducts)).toBe(true);
  });

  it('should have unique product IDs', () => {
    const allProducts = Object.values(catalog).flat();
    const ids = allProducts.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should support searching by occasion', () => {
    const allProducts = Object.values(catalog).flat();
    const productsWithLove = allProducts.filter(p => 
      p.occasions.includes('amor') || p.occasions.includes('aniversario')
    );
    expect(productsWithLove.length).toBeGreaterThan(0);
  });

  it('should have stock information', () => {
    const allProducts = Object.values(catalog).flat();
    allProducts.forEach(product => {
      expect(product).toHaveProperty('stock');
      expect(typeof product.stock).toBe('number');
      expect(product.stock).toBeGreaterThanOrEqual(0);
    });
  });
});
