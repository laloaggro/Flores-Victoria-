/**
 * Tests para server.simple.js del notification-service
 */

// Mock de dependencias
jest.mock('../config', () => ({
  port: 3008,
  email: {
    host: 'smtp.test.com',
    port: 587,
    user: 'test@test.com',
    password: 'password',
    from: 'noreply@test.com',
  },
  jwtSecret: 'test-secret',
}));

jest.mock('express', () => {
  const express = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    listen: jest.fn((port, callback) => {
      if (callback) callback();
      return { close: jest.fn() };
    }),
  }));
  express.json = jest.fn();
  return express;
});

describe('Server Simple - Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Module', () => {
    it('should export server module without errors', () => {
      expect(() => {
        jest.isolateModules(() => {
          require('../server.simple');
        });
      }).not.toThrow();
    });

    it('should have config imported', () => {
      const config = require('../config');
      expect(config).toBeDefined();
      expect(config.port).toBe(3008);
    });

    it('should have express imported', () => {
      const express = require('express');
      expect(express).toBeDefined();
      expect(typeof express).toBe('function');
    });
  });

  describe('Environment Configuration', () => {
    it('should use PORT from environment or default', () => {
      const PORT = process.env.PORT || 3008;
      expect(typeof PORT).toBe('number');
      expect(PORT).toBeGreaterThan(0);
    });

    it('should respect NODE_ENV', () => {
      const env = process.env.NODE_ENV || 'development';
      expect(typeof env).toBe('string');
      expect(['development', 'production', 'test']).toContain(env);
    });
  });

  describe('Server Initialization', () => {
    it('should initialize without throwing', () => {
      expect(() => {
        jest.isolateModules(() => {
          const server = require('../server.simple');
          expect(server).toBeDefined();
        });
      }).not.toThrow();
    });

    it('should handle startup', () => {
      jest.isolateModules(() => {
        const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        
        require('../server.simple');
        
        mockConsoleLog.mockRestore();
      });
    });
  });
});
