/**
 * Tests para logger.simple.js del notification-service
 */

describe('Logger Simple - Notification Service', () => {
  let logger;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Suprimir console.log durante tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();

    logger = require('../logger.simple');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger Object', () => {
    it('should export logger object', () => {
      expect(logger).toBeDefined();
      expect(typeof logger).toBe('object');
    });

    it('should have info method', () => {
      expect(logger).toHaveProperty('info');
      expect(typeof logger.info).toBe('function');
    });

    it('should have error method', () => {
      expect(logger).toHaveProperty('error');
      expect(typeof logger.error).toBe('function');
    });

    it('should have warn method', () => {
      expect(logger).toHaveProperty('warn');
      expect(typeof logger.warn).toBe('function');
    });

    it('should have debug method', () => {
      expect(logger).toHaveProperty('debug');
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('Logging Methods', () => {
    it('should log info messages', () => {
      expect(() => {
        logger.info('Test info message');
      }).not.toThrow();
    });

    it('should log error messages', () => {
      expect(() => {
        logger.error('Test error message');
      }).not.toThrow();
    });

    it('should log warning messages', () => {
      expect(() => {
        logger.warn('Test warning message');
      }).not.toThrow();
    });

    it('should log debug messages', () => {
      expect(() => {
        logger.debug('Test debug message');
      }).not.toThrow();
    });

    it('should handle message with metadata', () => {
      expect(() => {
        logger.info('Test message', { userId: '123', action: 'test' });
      }).not.toThrow();
    });

    it('should handle error objects', () => {
      const testError = new Error('Test error');
      
      expect(() => {
        logger.error('Error occurred', { error: testError });
      }).not.toThrow();
    });
  });

  describe('Logger Configuration', () => {
    it('should work in different environments', () => {
      const originalEnv = process.env.NODE_ENV;

      ['development', 'production', 'test'].forEach((env) => {
        process.env.NODE_ENV = env;
        jest.resetModules();
        const envLogger = require('../logger.simple');

        expect(envLogger).toBeDefined();
        expect(typeof envLogger.info).toBe('function');
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});
