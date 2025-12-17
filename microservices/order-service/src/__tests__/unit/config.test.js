/**
 * Tests para configuración de order-service
 */

const config = require('../../config');

describe('Config - Order Service', () => {
  it('should have port configuration', () => {
    expect(config.port).toBeDefined();
    expect(typeof config.port).toBe('number');
  });

  it('should have mongodb configuration', () => {
    expect(config.mongodb).toBeDefined();
    expect(config.mongodb.uri).toBeDefined();
  });

  it('should have rate limit configuration', () => {
    expect(config.rateLimit).toBeDefined();
    expect(config.rateLimit.windowMs).toBeDefined();
    expect(config.rateLimit.max).toBeDefined();
  });

  it('should export configuration object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  it('should use default port 3004', () => {
    expect(config.port).toBe(3004);
  });
});
