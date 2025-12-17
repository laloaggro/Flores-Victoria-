/**
 * Order Routes Tests
 * 
 * Nota: Este test se enfoca en la definición de rutas.
 * El setDatabase requiere refactorización del controlador para Mongoose.
 */

// Mock del modelo Order para evitar el error de constructor
jest.mock('../../models/Order', () => {
  return {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };
});

// Mock del controlador
jest.mock('../../controllers/orderController', () => {
  return jest.fn().mockImplementation(() => ({
    createOrder: jest.fn(),
    getOrders: jest.fn(),
    getOrder: jest.fn(),
    updateOrder: jest.fn(),
  }));
});

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
