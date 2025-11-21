/**
 * Tests para configuración de user-service
 */

const config = require('../../config');

describe('Config - User Service', () => {
  it('should have port configuration', () => {
    expect(config.port || config.PORT).toBeDefined();
  });

  it('should have database configuration', () => {
    expect(config.database || config.db).toBeDefined();
  });

  it('should export valid configuration', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });
});
