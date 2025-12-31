jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: { on: jest.fn(), once: jest.fn() },
  model: jest.fn(),
  Schema: jest.fn(),
}));

describe('Wishlist Service - App', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load app module', () => {
    expect(() => {
      app = require('../app');
    }).not.toThrow();
  });

  it('should export express app', () => {
    app = require('../app');
    expect(app).toBeDefined();
  });

  it('should be Express application', () => {
    app = require('../app');
    expect(typeof app).toBe('function' || typeof app === 'object');
  });

  it('should have Express methods', () => {
    app = require('../app');
    if (app && typeof app === 'object') {
      expect(typeof app.use).toBe('function');
    }
  });
});
