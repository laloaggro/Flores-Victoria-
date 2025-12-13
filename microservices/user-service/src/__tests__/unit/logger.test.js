/**
 * Tests básicos para logger de user-service
 */

const logger = require('../../logger.simple');

describe('Logger - User Service', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have logging methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
  });

  it('should log without errors', () => {
    expect(() => logger.info('Test message')).not.toThrow();
    expect(() => logger.error('Error message')).not.toThrow();
  });
});
