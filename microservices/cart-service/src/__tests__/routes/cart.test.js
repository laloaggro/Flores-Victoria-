describe('Cart Routes', () => {
  let cartRoutes;

  beforeAll(() => {
    cartRoutes = require('../../routes/cart');
  });

  const getRoutes = () =>
    cartRoutes.router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

  it('should export router', () => {
    expect(cartRoutes.router).toBeDefined();
    expect(typeof cartRoutes.router).toBe('function');
  });

  it('should export setRedis function', () => {
    expect(cartRoutes.setRedis).toBeDefined();
    expect(typeof cartRoutes.setRedis).toBe('function');
  });

  it('should have GET / route', () => {
    const routes = getRoutes();
    const getRoute = routes.find((r) => r.path === '/' && r.methods.includes('get'));
    expect(getRoute).toBeDefined();
  });

  it('should have POST /items route', () => {
    const routes = getRoutes();
    const postRoute = routes.find((r) => r.path === '/items' && r.methods.includes('post'));
    expect(postRoute).toBeDefined();
  });

  it('should have DELETE /items/:productId route', () => {
    const routes = getRoutes();
    const deleteRoute = routes.find(
      (r) => r.path === '/items/:productId' && r.methods.includes('delete')
    );
    expect(deleteRoute).toBeDefined();
  });

  it('should have DELETE / route for clearing cart', () => {
    const routes = getRoutes();
    const deleteRoute = routes.find((r) => r.path === '/' && r.methods.includes('delete'));
    expect(deleteRoute).toBeDefined();
  });

  it('should call setRedis without errors', () => {
    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    };

    expect(() => cartRoutes.setRedis(mockRedis)).not.toThrow();
  });
});
