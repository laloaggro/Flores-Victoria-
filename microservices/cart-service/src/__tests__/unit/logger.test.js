/**
 * Tests básicos para logger de cart-service
 */

const logger = require('../../logger.simple');

describe('Logger - Cart Service', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have standard methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
  });

  it('should log without throwing', () => {
    expect(() => logger.info('Test')).not.toThrow();
  });
});
