/**
 * Tests para el logger de product-service
 */

const logger = require('../../logger.simple');

describe('Logger - Product Service', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger interface', () => {
    it('should expose standard logging methods', () => {
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should log without throwing errors', () => {
      expect(() => logger.info('Test')).not.toThrow();
      expect(() => logger.error('Test')).not.toThrow();
      expect(() => logger.warn('Test')).not.toThrow();
    });
  });
});
