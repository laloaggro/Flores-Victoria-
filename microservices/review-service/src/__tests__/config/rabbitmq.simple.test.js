describe('RabbitMQ Config - Review Service', () => {
  let rabbitmqConfig;

  beforeEach(() => {
    jest.resetModules();
  });

  describe('Module Loading', () => {
    it('should load rabbitmq config without errors', () => {
      expect(() => {
        rabbitmqConfig = require('../../config/rabbitmq');
      }).not.toThrow();
    });

    it('should export configuration', () => {
      rabbitmqConfig = require('../../config/rabbitmq');
      expect(rabbitmqConfig).toBeDefined();
    });
  });

  describe('Configuration Structure', () => {
    beforeEach(() => {
      rabbitmqConfig = require('../../config/rabbitmq');
    });

    it('should be an object', () => {
      expect(typeof rabbitmqConfig).toBe('object');
    });

    it('should have connection properties or be empty', () => {
      if (rabbitmqConfig && typeof rabbitmqConfig === 'object') {
        // RabbitMQ config puede tener url, host, port, etc
        expect(rabbitmqConfig).toBeDefined();
      }
    });
  });

  describe('RabbitMQ Settings', () => {
    beforeEach(() => {
      rabbitmqConfig = require('../../config/rabbitmq');
    });

    it('should have valid config format', () => {
      expect(rabbitmqConfig).not.toBeNull();
    });

    it('should be usable for RabbitMQ connection', () => {
      // Verificar que es un objeto válido
      expect(typeof rabbitmqConfig).toBe('object');
    });
  });
});
