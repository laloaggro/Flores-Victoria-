/**
 * Tests for auth-service configuration
 */

describe('Auth Service Config', () => {
  let config;

  beforeEach(() => {
    jest.resetModules();
    delete process.env.PORT;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });

  it('should use default values when env vars are not set', () => {
    config = require('../index');

    expect(config.port).toBe(3001);
    expect(config.database.host).toBe('postgres');
    expect(config.database.port).toBe(5432);
    expect(config.database.name).toBe('flores_db');
    expect(config.database.user).toBe('flores_user');
    expect(config.database.password).toBe('flores_password');
    expect(config.jwt.secret).toBe('my_secret_key');
    expect(config.jwt.expiresIn).toBe('24h');
  });

  it('should use environment variables when set', () => {
    process.env.PORT = '4001';
    process.env.DB_HOST = 'custom-host';
    process.env.DB_PORT = '5555';
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_pass';
    process.env.JWT_SECRET = 'custom_secret';
    process.env.JWT_EXPIRES_IN = '48h';
    process.env.GOOGLE_CLIENT_ID = 'google_id';
    process.env.GOOGLE_CLIENT_SECRET = 'google_secret';

    config = require('../index');

    expect(config.port).toBe(4001);
    expect(config.database.host).toBe('custom-host');
    expect(config.database.port).toBe(5555);
    expect(config.database.name).toBe('test_db');
    expect(config.jwt.secret).toBe('custom_secret');
    expect(config.jwt.expiresIn).toBe('48h');
    expect(config.google.clientId).toBe('google_id');
    expect(config.google.clientSecret).toBe('google_secret');
  });

  it('should have all required configuration sections', () => {
    config = require('../index');

    expect(config).toHaveProperty('port');
    expect(config).toHaveProperty('database');
    expect(config).toHaveProperty('jwt');
    expect(config).toHaveProperty('google');
  });
});
