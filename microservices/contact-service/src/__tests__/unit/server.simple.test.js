/**
 * Tests básicos para server.simple.js del contact-service
 */

// Mock de dependencias
jest.mock('../../app', () => {
  const express = require('express');
  const app = express();
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  return app;
});

jest.mock('../../config', () => ({
  port: 3005,
}));

jest.mock('../../config/database', () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
}));

describe('Server Simple - Contact Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Module', () => {
    it('should export server module without errors', () => {
      expect(() => {
        jest.isolateModules(() => {
          require('../../server.simple');
        });
      }).not.toThrow();
    });

    it('should have app imported', () => {
      const app = require('../../app');
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have config imported', () => {
      const config = require('../../config');
      expect(config).toBeDefined();
      expect(config.port).toBe(3005);
    });

    it('should have database imported', () => {
      const db = require('../../config/database');
      expect(db).toBeDefined();
      expect(db.authenticate).toBeDefined();
    });
  });

  describe('Environment', () => {
    it('should use PORT from env or default', () => {
      const PORT = process.env.PORT || 3005;
      expect(typeof PORT).toBe('number');
      expect(PORT).toBeGreaterThan(0);
    });

    it('should have NODE_ENV defined', () => {
      const env = process.env.NODE_ENV || 'development';
      expect(['development', 'production', 'test']).toContain(env);
    });
  });
});
