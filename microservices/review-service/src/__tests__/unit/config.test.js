/**
 * Tests para configuración de review-service
 */

const config = require('../../config');

describe('Config - Review Service', () => {
  it('should have port', () => {
    expect(config.port || config.PORT).toBeDefined();
  });

  it('should have database config', () => {
    expect(config.mongodb || config.database).toBeDefined();
  });

  it('should export configuration', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });
});
