/**
 * Tests para el modelo Occasion (Mongoose)
 */

const Occasion = require('../../models/Occasion');

describe('Occasion Model', () => {
  describe('Mongoose Model', () => {
    it('should be defined', () => {
      expect(Occasion).toBeDefined();
    });

    it('should be a Mongoose model', () => {
      expect(Occasion.modelName).toBe('Occasion');
    });

    it('should have schema with required fields', () => {
      const schema = Occasion.schema.obj;
      expect(schema.name).toBeDefined();
      expect(schema.slug).toBeDefined();
      expect(schema.name.required).toBe(true);
      expect(schema.slug.required).toBe(true);
    });

    it('should have unique constraints', () => {
      const schema = Occasion.schema.obj;
      expect(schema.name.unique).toBe(true);
      expect(schema.slug.unique).toBe(true);
    });

    it('should have active field with default true', () => {
      const schema = Occasion.schema.obj;
      expect(schema.active).toBeDefined();
      expect(schema.active.default).toBe(true);
    });

    it('should have timestamps enabled', () => {
      expect(Occasion.schema.options.timestamps).toBe(true);
    });

    it('should have proper indexes', () => {
      const indexes = Occasion.schema.indexes();
      expect(indexes.length).toBeGreaterThan(0);
    });
  });

  describe('Field validation', () => {
    it('should require name field', () => {
      const schema = Occasion.schema.obj;
      expect(schema.name.required).toBe(true);
    });

    it('should trim name and description', () => {
      const schema = Occasion.schema.obj;
      expect(schema.name.trim).toBe(true);
      expect(schema.description.trim).toBe(true);
    });

    it('should make slug lowercase', () => {
      const schema = Occasion.schema.obj;
      expect(schema.slug.lowercase).toBe(true);
    });
  });
});
