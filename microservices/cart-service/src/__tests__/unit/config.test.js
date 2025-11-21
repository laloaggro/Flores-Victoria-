/**
 * Tests para configuración de cart-service
 */

const config = require('../../config');

describe('Config - Cart Service', () => {
  it('should have port', () => {
    expect(config.port || config.PORT).toBeDefined();
  });

  it('should have Redis config', () => {
    expect(config.redis || config.REDIS_HOST).toBeDefined();
  });

  it('should export config object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });
});
