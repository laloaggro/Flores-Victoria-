/**
 * Tests para configuración de wishlist-service
 */

const config = require('../../config');

describe('Config - Wishlist Service', () => {
  it('should have port', () => {
    expect(config.port || config.PORT).toBeDefined();
  });

  it('should have Redis config', () => {
    expect(config.redis || config.REDIS_HOST).toBeDefined();
  });

  it('should export config', () => {
    expect(config).toBeDefined();
  });
});
