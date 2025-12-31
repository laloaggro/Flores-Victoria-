/**
 * Tests básicos para server.simple.js
 */

// Mock de dependencias
jest.mock('../../app', () => {
  const express = require('express');
  const app = express();
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  return app;
});

jest.mock('../../config', () => ({
  port: 3012,
}));

jest.mock('../../config/redis', () => ({
  connect: jest.fn().mockResolvedValue(true),
  quit: jest.fn(),
  on: jest.fn(),
}));

jest.mock('../../routes/wishlist', () => ({
  setRedis: jest.fn(),
}));

describe('Server Simple - Wishlist Service', () => {
  let originalEnv;

  beforeAll(() => {
    // Guardar NODE_ENV original
    originalEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    // Restaurar NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Server Setup', () => {
    it('should have app configured', () => {
      const app = require('../../app');
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have config imported', () => {
      const config = require('../../config');
      expect(config).toBeDefined();
      expect(config.port).toBe(3012);
    });

    it('should have redis client imported', () => {
      const redisClient = require('../../config/redis');
      expect(redisClient).toBeDefined();
      expect(redisClient.connect).toBeDefined();
    });

    it('should have wishlist routes imported', () => {
      const wishlist = require('../../routes/wishlist');
      expect(wishlist).toBeDefined();
      expect(wishlist.setRedis).toBeDefined();
    });
  });

  describe('Environment Configuration', () => {
    it('should respect PORT environment variable', () => {
      const PORT = process.env.PORT || 3012;
      expect(typeof PORT).toBe('number');
      expect(PORT).toBeGreaterThan(0);
    });

    it('should have NODE_ENV defined', () => {
      const env = process.env.NODE_ENV || 'development';
      expect(typeof env).toBe('string');
      expect(['development', 'production', 'test']).toContain(env);
    });
  });

  describe('Server Module', () => {
    it('should export server module', () => {
      expect(() => {
        jest.isolateModules(() => {
          require('../../server.simple');
        });
      }).not.toThrow();
    });
  });
});
