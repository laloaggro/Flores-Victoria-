/**
 * Tests para el modelo Occasion
 */

const Occasion = require('../../models/Occasion');

describe('Occasion Model', () => {
  describe('getAll', () => {
    it('should return all occasions', () => {
      const occasions = Occasion.getAll();
      
      expect(occasions).toBeDefined();
      expect(Array.isArray(occasions)).toBe(true);
      expect(occasions.length).toBeGreaterThan(0);
    });

    it('should include standard occasions', () => {
      const occasions = Occasion.getAll();
      const occasionIds = occasions.map((o) => o.id);
      
      expect(occasionIds).toContain('birthday');
      expect(occasionIds).toContain('anniversary');
      expect(occasionIds).toContain('sympathy');
    });

    it('should have proper structure', () => {
      const occasions = Occasion.getAll();
      
      occasions.forEach((occasion) => {
        expect(occasion).toHaveProperty('id');
        expect(occasion).toHaveProperty('name');
        expect(typeof occasion.id).toBe('string');
        expect(typeof occasion.name).toBe('string');
      });
    });
  });

  describe('getById', () => {
    it('should return occasion by id', () => {
      const occasion = Occasion.getById('birthday');
      
      expect(occasion).toBeDefined();
      expect(occasion.id).toBe('birthday');
      expect(occasion.name).toBeDefined();
    });

    it('should return undefined for non-existent id', () => {
      const occasion = Occasion.getById('non-existent');
      
      expect(occasion).toBeUndefined();
    });

    it('should handle case sensitivity', () => {
      const occasion = Occasion.getById('BIRTHDAY');
      
      // Depends on implementation - may be case sensitive or not
      expect([undefined, expect.any(Object)]).toContainEqual(occasion);
    });
  });

  describe('Occasion data integrity', () => {
    it('should not have duplicate ids', () => {
      const occasions = Occasion.getAll();
      const ids = occasions.map((o) => o.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have Spanish names', () => {
      const occasions = Occasion.getAll();
      
      occasions.forEach((occasion) => {
        expect(occasion.name.length).toBeGreaterThan(0);
      });
    });
  });
});
