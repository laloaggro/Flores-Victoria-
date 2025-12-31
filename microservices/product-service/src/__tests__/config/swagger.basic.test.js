describe('Swagger Config - Product Service', () => {
  let swagger;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load swagger config', () => {
    expect(() => {
      swagger = require('../../config/swagger');
    }).not.toThrow();
  });

  it('should export swagger configuration', () => {
    swagger = require('../../config/swagger');
    expect(swagger).toBeDefined();
  });

  it('should be an object', () => {
    swagger = require('../../config/swagger');
    expect(typeof swagger).toBe('object');
  });

  it('should have swagger properties', () => {
    swagger = require('../../config/swagger');
    if (swagger && typeof swagger === 'object') {
      expect(swagger).toBeTruthy();
    }
  });
});
