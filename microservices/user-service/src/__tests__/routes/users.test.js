describe('User Routes', () => {
  let userRoutes;

  beforeAll(() => {
    // Mock del modelo User antes de importar las rutas
    jest.mock('../../models/User', () => ({
      User: jest.fn().mockImplementation(() => ({
        findAll: jest.fn(),
        findById: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
    }));

    userRoutes = require('../../routes/users');
  });

  it('should export router', () => {
    expect(userRoutes).toBeDefined();
    expect(typeof userRoutes).toBe('function');
  });

  it('should have stack property', () => {
    expect(userRoutes.stack).toBeDefined();
    expect(Array.isArray(userRoutes.stack)).toBe(true);
  });

  describe('Route definitions', () => {
    const getRoutes = () =>
      userRoutes.stack
        .filter((layer) => layer.route)
        .map((layer) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        }));

    it('should have GET / route for listing users', () => {
      const routes = getRoutes();
      const getRoute = routes.find((r) => r.path === '/' && r.methods.includes('get'));
      expect(getRoute).toBeDefined();
    });

    it('should have GET /:id route for getting user by id', () => {
      const routes = getRoutes();
      const getRoute = routes.find((r) => r.path === '/:id' && r.methods.includes('get'));
      expect(getRoute).toBeDefined();
    });

    it('should have POST / route for creating users', () => {
      const routes = getRoutes();
      const postRoute = routes.find((r) => r.path === '/' && r.methods.includes('post'));
      expect(postRoute).toBeDefined();
    });

    it('should have PUT /:id route for updating users', () => {
      const routes = getRoutes();
      const putRoute = routes.find((r) => r.path === '/:id' && r.methods.includes('put'));
      expect(putRoute).toBeDefined();
    });

    it('should have DELETE /:id route for deleting users', () => {
      const routes = getRoutes();
      const deleteRoute = routes.find((r) => r.path === '/:id' && r.methods.includes('delete'));
      expect(deleteRoute).toBeDefined();
    });
  });

  describe('Route count', () => {
    it('should have at least 5 routes defined', () => {
      const routes = userRoutes.stack.filter((layer) => layer.route);
      expect(routes.length).toBeGreaterThanOrEqual(5);
    });
  });
});
