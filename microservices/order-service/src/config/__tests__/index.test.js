/**
 * Tests for order-service configuration (MongoDB)
 */

describe('Order Service Config', () => {
  let config;

  beforeEach(() => {
    jest.resetModules();
    delete process.env.PORT;
    delete process.env.ORDER_SERVICE_MONGODB_URI;
    delete process.env.MONGODB_URI;
  });

  it('should use default values when env vars are not set', () => {
    config = require('../index');

    expect(config.port).toBe(3004);
    expect(config.mongodb).toBeDefined();
    expect(config.mongodb.uri).toContain('mongodb://');
  });

  it('should use environment variables when set', () => {
    process.env.PORT = '5004';
    process.env.ORDER_SERVICE_MONGODB_URI = 'mongodb://custom-host:27017/custom_db';

    config = require('../index');

    expect(config.port).toBe('5004');
    expect(config.mongodb.uri).toBe('mongodb://custom-host:27017/custom_db');
  });

  it('should have rate limit configuration', () => {
    config = require('../index');

    expect(config.rateLimit).toBeDefined();
    expect(config.rateLimit.windowMs).toBe(15 * 60 * 1000); // 15 min
    expect(config.rateLimit.max).toBe(100);
  });

  it('should have mongodb configuration with uri', () => {
    config = require('../index');

    expect(config.mongodb).toHaveProperty('uri');
  });
});
