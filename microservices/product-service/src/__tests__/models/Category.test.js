/**
 * Tests para el modelo Category
 */

const Category = require('../../models/Category');

describe('Category Model', () => {
  describe('getAll', () => {
    it('should return all categories', () => {
      const categories = Category.getAll();
      
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should include standard categories', () => {
      const categories = Category.getAll();
      const categoryIds = categories.map((c) => c.id);
      
      expect(categoryIds).toContain('rosas');
      expect(categoryIds).toContain('ramos');
      expect(categoryIds).toContain('arreglos');
    });

    it('should have proper structure', () => {
      const categories = Category.getAll();
      
      categories.forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
      });
    });
  });

  describe('getById', () => {
    it('should return category by id', () => {
      const category = Category.getById('rosas');
      
      expect(category).toBeDefined();
      expect(category.id).toBe('rosas');
      expect(category.name).toBeDefined();
    });

    it('should return undefined for non-existent id', () => {
      const category = Category.getById('non-existent-category');
      
      expect(category).toBeUndefined();
    });
  });

  describe('Category data integrity', () => {
    it('should not have duplicate ids', () => {
      const categories = Category.getAll();
      const ids = categories.map((c) => c.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have Spanish names', () => {
      const categories = Category.getAll();
      
      categories.forEach((category) => {
        expect(category.name.length).toBeGreaterThan(0);
      });
    });

    it('should have slug-friendly ids', () => {
      const categories = Category.getAll();
      
      categories.forEach((category) => {
        // IDs should be URL-safe
        expect(category.id).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });
});
