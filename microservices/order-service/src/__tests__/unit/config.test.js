/**
 * Tests para configuración de order-service
 */

const config = require('../../config');

describe('Config - Order Service', () => {
  it('should have port configuration', () => {
    expect(config.port).toBeDefined();
  });

  it('should have database configuration', () => {
    expect(config.database || config.db).toBeDefined();
  });

  it('should have environment setting', () => {
    expect(config.env || process.env.NODE_ENV).toBeDefined();
  });

  it('should export configuration object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });
});
