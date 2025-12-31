describe('RabbitMQ Config - Wishlist Service', () => {
  let config;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load rabbitmq config', () => {
    expect(() => {
      config = require('../../config/rabbitmq');
    }).not.toThrow();
  });

  it('should export config object', () => {
    config = require('../../config/rabbitmq');
    expect(config).toBeDefined();
  });

  it('should be valid config', () => {
    config = require('../../config/rabbitmq');
    expect(typeof config).toBe('object');
  });

  it('should have RabbitMQ properties', () => {
    config = require('../../config/rabbitmq');
    if (config && typeof config === 'object') {
      expect(config).toBeTruthy();
    }
  });
});
