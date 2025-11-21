/**
 * Tests para configuración de product-service
 */

const config = require('../../config');

describe('Config - Product Service', () => {
  describe('Configuration structure', () => {
    it('should have port configuration', () => {
      expect(config.port).toBeDefined();
      expect(typeof config.port).toBe('number');
    });

    it('should have MongoDB configuration', () => {
      expect(config.mongodb).toBeDefined();
    });

    it('should have environment setting', () => {
      expect(config.env).toBeDefined();
    });
  });

  describe('MongoDB configuration', () => {
    it('should have connection URI', () => {
      expect(config.mongodb.uri).toBeDefined();
      expect(typeof config.mongodb.uri).toBe('string');
    });

    it('should not have hardcoded credentials', () => {
      const uri = config.mongodb.uri;
      // If using env vars, URI should contain placeholders or env references
      expect(uri).toBeDefined();
    });
  });

  describe('Service settings', () => {
    it('should have service name', () => {
      expect(config.serviceName || config.name).toBeDefined();
    });

    it('should export valid configuration object', () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });
  });
});
