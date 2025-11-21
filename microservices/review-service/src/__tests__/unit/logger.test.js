/**
 * Tests básicos para logger de review-service
 */

const logger = require('../../logger');

describe('Logger - Review Service', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have logging methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it('should execute without errors', () => {
    expect(() => logger.info('Test message')).not.toThrow();
  });
});
