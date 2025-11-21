describe('Order Routes', () => {
  let orderRoutes;

  beforeAll(() => {
    orderRoutes = require('../../routes/orders');
  });

  const getRoutes = () =>
    orderRoutes.router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

  it('should export router', () => {
    expect(orderRoutes.router).toBeDefined();
    expect(typeof orderRoutes.router).toBe('function');
  });

  it('should export setDatabase function', () => {
    expect(orderRoutes.setDatabase).toBeDefined();
    expect(typeof orderRoutes.setDatabase).toBe('function');
  });

  it('should have POST / route', () => {
    const routes = getRoutes();
    const postRoute = routes.find((r) => r.path === '/' && r.methods.includes('post'));
    expect(postRoute).toBeDefined();
  });

  it('should have GET / route', () => {
    const routes = getRoutes();
    const getRoute = routes.find((r) => r.path === '/' && r.methods.includes('get'));
    expect(getRoute).toBeDefined();
  });

  it('should have GET /:id route', () => {
    const routes = getRoutes();
    const getRoute = routes.find((r) => r.path === '/:id' && r.methods.includes('get'));
    expect(getRoute).toBeDefined();
  });

  it('should call setDatabase without errors', () => {
    const mockDb = {
      collection: jest.fn(),
    };

    expect(() => orderRoutes.setDatabase(mockDb)).not.toThrow();
  });
});
