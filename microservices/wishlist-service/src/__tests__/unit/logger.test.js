/**
 * Tests básicos para logger de wishlist-service  
 */

const logger = require('../../logger');

describe('Logger - Wishlist Service', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have standard methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it('should work without throwing', () => {
    expect(() => logger.info('Test')).not.toThrow();
  });
});
