/**
 * Tests for order-service configuration
 */

describe('Order Service Config', () => {
  let config;

  beforeEach(() => {
    jest.resetModules();
    delete process.env.PORT;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
  });

  it('should use default values when env vars are not set', () => {
    config = require('../index');

    expect(config.port).toBe(3004);
    expect(config.database.host).toBe('postgres');
    expect(config.database.port).toBe(5432);
    expect(config.database.name).toBe('flores_db');
    expect(config.database.user).toBe('flores_user');
    expect(config.database.password).toBe('flores_password');
  });

  it('should use environment variables when set', () => {
    process.env.PORT = '5004';
    process.env.DB_HOST = 'custom-postgres';
    process.env.DB_PORT = '5433';
    process.env.DB_NAME = 'custom_db';
    process.env.DB_USER = 'custom_user';
    process.env.DB_PASSWORD = 'custom_pass';

    config = require('../index');

    expect(config.port).toBe('5004');
    expect(config.database.host).toBe('custom-postgres');
    expect(config.database.port).toBe('5433');
    expect(config.database.name).toBe('custom_db');
    expect(config.database.user).toBe('custom_user');
    expect(config.database.password).toBe('custom_pass');
  });

  it('should have all required database fields', () => {
    config = require('../index');

    expect(config.database).toHaveProperty('host');
    expect(config.database).toHaveProperty('port');
    expect(config.database).toHaveProperty('name');
    expect(config.database).toHaveProperty('user');
    expect(config.database).toHaveProperty('password');
  });
});
