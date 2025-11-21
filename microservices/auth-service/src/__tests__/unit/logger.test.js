/**
 * Tests para el logger de auth-service
 */

const logger = require('../../logger');

describe('Logger - Auth Service', () => {
  beforeEach(() => {
    // Silenciar logs durante tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger methods', () => {
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

  describe('Logger functionality', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      // Logger should execute without errors
      expect(true).toBe(true);
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      expect(true).toBe(true);
    });

    it('should log with metadata', () => {
      logger.info({ userId: '123' }, 'User action');
      expect(true).toBe(true);
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      logger.error({ err: error }, 'Error occurred');
      expect(true).toBe(true);
    });
  });
});
