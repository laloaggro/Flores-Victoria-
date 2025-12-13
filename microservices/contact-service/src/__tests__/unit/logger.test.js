/**
 * Tests básicos para logger de contact-service
 */

const logger = require('../../logger.simple');

describe('Logger - Contact Service', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have logging interface', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it('should log without errors', () => {
    expect(() => logger.info('Test')).not.toThrow();
  });
});
