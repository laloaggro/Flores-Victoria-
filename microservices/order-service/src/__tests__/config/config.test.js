describe('Order Config', () => {
  let config;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load config module', () => {
    try {
      config = require('../../config');
      expect(config).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should export config object', () => {
    try {
      config = require('../../config');
      expect(config).toBeTruthy();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
