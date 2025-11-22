/**
 * Tests for wishlist-service configuration
 */

describe('Wishlist Service Config', () => {
  let config;

  beforeEach(() => {
    jest.resetModules();
    delete process.env.PORT;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
  });

  it('should use default values when env vars are not set', () => {
    config = require('../index');

    expect(config.port).toBe(3006);
    expect(config.redis.host).toBe('redis');
    expect(config.redis.port).toBe(6379);
    expect(config.rateLimit.windowMs).toBe(15 * 60 * 1000);
    expect(config.rateLimit.max).toBe(100);
  });

  it('should use environment variables when set', () => {
    process.env.PORT = '5000';
    process.env.REDIS_HOST = 'custom-redis-host';
    process.env.REDIS_PORT = '7000';

    config = require('../index');

    expect(config.port).toBe('5000');
    expect(config.redis.host).toBe('custom-redis-host');
    expect(config.redis.port).toBe('7000');
  });

  it('should have correct rate limit configuration', () => {
    config = require('../index');

    expect(config.rateLimit.windowMs).toBe(900000); // 15 minutes
    expect(config.rateLimit.max).toBe(100);
  });
});
