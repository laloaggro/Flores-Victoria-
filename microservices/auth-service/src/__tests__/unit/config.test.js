/**
 * Tests para configuración de auth-service
 */

const config = require('../../config');

describe('Config - Auth Service', () => {
  describe('Configuration structure', () => {
    it('should have port configuration', () => {
      expect(config.port).toBeDefined();
      expect(typeof config.port).toBe('number');
    });

    it('should have database configuration', () => {
      expect(config.database).toBeDefined();
    });

    it('should have JWT secret', () => {
      expect(config.jwtSecret).toBeDefined();
      expect(typeof config.jwtSecret).toBe('string');
    });

    it('should have environment setting', () => {
      expect(config.env).toBeDefined();
    });
  });

  describe('Database configuration', () => {
    it('should have SQLite database path', () => {
      if (config.database) {
        expect(config.database.path || config.database.filename).toBeDefined();
      }
    });
  });

  describe('Security settings', () => {
    it('should have secure JWT secret in production', () => {
      if (config.env === 'production') {
        expect(config.jwtSecret.length).toBeGreaterThan(20);
      }
    });

    it('should have token expiration', () => {
      expect(config.jwtExpiration || config.tokenExpiration).toBeDefined();
    });
  });

  describe('Service settings', () => {
    it('should have service name', () => {
      expect(config.serviceName || config.name).toBeDefined();
    });

    it('should export valid configuration', () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });
  });
});
