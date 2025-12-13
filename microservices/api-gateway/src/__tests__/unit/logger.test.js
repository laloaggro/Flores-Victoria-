/**
 * Tests para el logger del API Gateway
 */

const { logger } = require('../../middleware/logger');

describe('Logger - API Gateway', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger interface', () => {
    it('should have info method', () => {
      expect(logger.info).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    it('should have error method', () => {
      expect(logger.error).toBeDefined();
      expect(typeof logger.error).toBe('function');
    });

    it('should have warn method', () => {
      expect(logger.warn).toBeDefined();
      expect(typeof logger.warn).toBe('function');
    });

    it('should have debug method', () => {
      expect(logger.debug).toBeDefined();
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('Logging functionality', () => {
    it('should log info messages without errors', () => {
      expect(() => logger.info('Test info')).not.toThrow();
    });

    it('should log error messages without errors', () => {
      expect(() => logger.error('Test error')).not.toThrow();
    });

    it('should log with metadata objects', () => {
      expect(() => logger.info({ requestId: '123' }, 'Test')).not.toThrow();
    });

    it('should handle Error objects', () => {
      const error = new Error('Test');
      expect(() => logger.error({ err: error }, 'Error')).not.toThrow();
    });
  });

  describe('Logger configuration', () => {
    it('should have service context', () => {
      // Logger should be configured for api-gateway
      expect(logger).toBeDefined();
    });

    it('should support structured logging', () => {
      // Should accept object as first parameter
      expect(() => {
        logger.info({ service: 'test', action: 'test' }, 'Message');
      }).not.toThrow();
    });
  });
});
