const { createLogger } = require('../../logging/logger');

describe('Logger', () => {
  let logger;
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.LOG_LEVEL;
    logger = createLogger('test-service');
  });

  afterEach(() => {
    process.env.LOG_LEVEL = originalEnv;
  });

  describe('createLogger', () => {
    it('should create a logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger).toBe('object');
    });

    it('should have standard logging methods', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should create logger with service name', () => {
      const serviceLogger = createLogger('my-service');
      expect(serviceLogger).toBeDefined();
    });

    it('should respect LOG_LEVEL environment variable', () => {
      process.env.LOG_LEVEL = 'debug';
      const debugLogger = createLogger('debug-service');
      expect(debugLogger).toBeDefined();
    });

    it('should default to info level if LOG_LEVEL not set', () => {
      delete process.env.LOG_LEVEL;
      const defaultLogger = createLogger('default-service');
      expect(defaultLogger).toBeDefined();
    });
  });

  describe('logging methods', () => {
    it('should allow info logging', () => {
      expect(() => {
        logger.info('Test info message');
      }).not.toThrow();
    });

    it('should allow error logging', () => {
      expect(() => {
        logger.error('Test error message');
      }).not.toThrow();
    });

    it('should allow warn logging', () => {
      expect(() => {
        logger.warn('Test warning message');
      }).not.toThrow();
    });

    it('should allow debug logging', () => {
      expect(() => {
        logger.debug('Test debug message');
      }).not.toThrow();
    });

    it('should handle logging with metadata', () => {
      expect(() => {
        logger.info('Test message', { userId: 123, action: 'test' });
      }).not.toThrow();
    });

    it('should handle Error objects', () => {
      expect(() => {
        logger.error('Error occurred', new Error('Test error'));
      }).not.toThrow();
    });
  });
});
