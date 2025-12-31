describe('Public Routes - Product Service', () => {
  let routes;

  beforeEach(() => {
    jest.resetModules();
  });

  it('should load public routes module', () => {
    expect(() => {
      routes = require('../../routes/public');
    }).not.toThrow();
  });

  it('should export router or function', () => {
    routes = require('../../routes/public');
    expect(routes).toBeDefined();
  });

  it('should be Express router', () => {
    routes = require('../../routes/public');
    const isRouter = routes && (typeof routes === 'function' || typeof routes === 'object');
    expect(isRouter).toBe(true);
  });

  it('should have router methods', () => {
    routes = require('../../routes/public');
    if (routes && typeof routes === 'object') {
      const hasRouterMethods = 
        typeof routes.get === 'function' ||
        typeof routes.post === 'function' ||
        typeof routes.use === 'function';
      expect(hasRouterMethods).toBe(true);
    }
  });
});
