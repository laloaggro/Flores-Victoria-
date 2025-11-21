/**
 * Tests para el modelo Category (Mongoose)
 */

const Category = require('../../models/Category');

describe('Category Model', () => {
  describe('Mongoose Model', () => {
    it('should be defined', () => {
      expect(Category).toBeDefined();
    });

    it('should be a Mongoose model', () => {
      expect(Category.modelName).toBe('Category');
    });

    it('should have schema with required fields', () => {
      const schema = Category.schema.obj;
      expect(schema.name).toBeDefined();
      expect(schema.slug).toBeDefined();
      expect(schema.name.required).toBe(true);
      expect(schema.slug.required).toBe(true);
    });

    it('should have unique constraints', () => {
      const schema = Category.schema.obj;
      expect(schema.name.unique).toBe(true);
      expect(schema.slug.unique).toBe(true);
    });

    it('should have active field with default true', () => {
      const schema = Category.schema.obj;
      expect(schema.active).toBeDefined();
      expect(schema.active.default).toBe(true);
    });

    it('should have timestamps enabled', () => {
      expect(Category.schema.options.timestamps).toBe(true);
    });

    it('should have proper indexes', () => {
      const indexes = Category.schema.indexes();
      expect(indexes.length).toBeGreaterThan(0);
    });
  });

  describe('Field validation', () => {
    it('should require name field', () => {
      const schema = Category.schema.obj;
      expect(schema.name.required).toBe(true);
    });

    it('should trim name and description', () => {
      const schema = Category.schema.obj;
      expect(schema.name.trim).toBe(true);
      expect(schema.description.trim).toBe(true);
    });

    it('should make slug lowercase', () => {
      const schema = Category.schema.obj;
      expect(schema.slug.lowercase).toBe(true);
    });
  });
});
