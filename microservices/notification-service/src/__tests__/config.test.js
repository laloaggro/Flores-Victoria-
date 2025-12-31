/**
 * Tests para config.js del notification-service
 */

describe('Config - Notification Service', () => {
  let config;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    config = require('../config');
  });

  describe('Configuration Object', () => {
    it('should export config object', () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should have port configured', () => {
      expect(config).toHaveProperty('port');
      expect(typeof config.port).toBe('number');
      expect(config.port).toBeGreaterThan(0);
    });

    it('should have email configuration', () => {
      expect(config).toHaveProperty('email');
      expect(typeof config.email).toBe('object');
    });

    it('should have JWT secret configured', () => {
      expect(config).toHaveProperty('jwtSecret');
      expect(typeof config.jwtSecret).toBe('string');
    });
  });

  describe('Email Configuration', () => {
    it('should have email host', () => {
      expect(config.email).toHaveProperty('host');
    });

    it('should have email port', () => {
      expect(config.email).toHaveProperty('port');
      expect(typeof config.email.port).toBe('number');
    });

    it('should have email credentials', () => {
      expect(config.email).toHaveProperty('user');
      expect(config.email).toHaveProperty('password');
    });

    it('should have from address', () => {
      expect(config.email).toHaveProperty('from');
      expect(typeof config.email.from).toBe('string');
    });
  });

  describe('Environment Variables', () => {
    it('should use PORT from environment', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '4000';

      jest.resetModules();
      const newConfig = require('../config');

      expect(newConfig.port).toBe(4000);

      process.env.PORT = originalPort;
    });

    it('should fallback to default port', () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;

      jest.resetModules();
      const newConfig = require('../config');

      expect(typeof newConfig.port).toBe('number');
      expect(newConfig.port).toBeGreaterThan(0);

      process.env.PORT = originalPort;
    });
  });

  describe('JWT Configuration', () => {
    it('should have JWT secret string', () => {
      expect(config.jwtSecret).toBeDefined();
      expect(config.jwtSecret.length).toBeGreaterThan(0);
    });

    it('should use JWT_SECRET from environment', () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'test-secret-123';

      jest.resetModules();
      const newConfig = require('../config');

      expect(newConfig.jwtSecret).toBe('test-secret-123');

      process.env.JWT_SECRET = originalSecret;
    });
  });
});
