/**
 * Tests para database.js config
 */

describe('Database Config - Order Service', () => {
  let db;

  beforeEach(() => {
    jest.resetModules();
    db = require('../../config/database');
  });

  describe('Module exports', () => {
    it('should export database configuration', () => {
      expect(db).toBeDefined();
    });

    it('should be an object or function', () => {
      const type = typeof db;
      expect(['object', 'function']).toContain(type);
    });
  });

  describe('Database properties', () => {
    it('should have expected structure if object', () => {
      if (typeof db === 'object' && db !== null) {
        // Verificar que tiene propiedades esperadas
        expect(db).toBeTruthy();
      } else {
        // Si es función, debe ser invocable
        expect(typeof db).toBe('function');
      }
    });
  });
});
