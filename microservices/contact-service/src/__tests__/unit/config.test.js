/**
 * Tests para configuración de contact-service
 */

const config = require('../../config');

describe('Config - Contact Service', () => {
  it('should have port', () => {
    expect(config.port || config.PORT).toBeDefined();
  });

  it('should have database config', () => {
    expect(config.mongodb || config.database).toBeDefined();
  });

  it('should export config object', () => {
    expect(config).toBeDefined();
  });
});
