const config = require('../../config');

describe('Config - Product Service', () => {
  it('should export config', () => {
    expect(config).toBeDefined();
  });

  it('should be valid', () => {
    const isValid = typeof config === 'object' || typeof config === 'function';
    expect(isValid).toBe(true);
  });
});
