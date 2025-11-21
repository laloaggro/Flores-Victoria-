const config = require('../../config');

describe('Config - Auth Service', () => {
  it('should export config', () => {
    expect(config).toBeDefined();
  });

  it('should be an object or have properties', () => {
    const isValid = typeof config === 'object' || typeof config === 'function';
    expect(isValid).toBe(true);
  });
});
