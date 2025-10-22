const { cacheMiddleware } = require('../../microservices/product-service/src/middlewares/cache');

// Mock de redis
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn(),
    on: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn(),
  }),
}));

describe('Cache Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/test-url',
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  test('debería llamar a next() cuando no hay datos en caché', async () => {
    const middleware = cacheMiddleware('test', 100);
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('debería devolver datos de la caché cuando están disponibles', async () => {
    const cachedData = JSON.stringify({ test: 'data' });
    require('redis').createClient.mockReturnValue({
      connect: jest.fn(),
      on: jest.fn(),
      get: jest.fn().mockResolvedValue(cachedData),
      setEx: jest.fn(),
    });

    const middleware = cacheMiddleware('test', 100);
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(JSON.parse(cachedData));
    expect(next).not.toHaveBeenCalled();
  });
});
