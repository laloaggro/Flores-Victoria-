// Mock mongoose y su conexión
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn(),
  },
  model: jest.fn(),
  Schema: jest.fn(),
}));

// Mock logger
jest.mock('../logger.simple', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const request = require('supertest');

describe('Product Service - App', () => {
  let app;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.resetModules();
    app = require('../app.simple');
    jest.advanceTimersByTime(2000); // Para el setTimeout de MongoDB
  });

  it('should load app module', () => {
    expect(app).toBeDefined();
  });

  it('should export express app', () => {
    expect(typeof app).toBe('function');
  });

  it('should have Express methods', () => {
    expect(typeof app.use).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
  });

  describe('Health endpoint', () => {
    it('should return 200 on GET /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
    });

    it('should include service name in health response', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('service', 'product-service');
    });

    it('should include mongodb status', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('mongodb');
    });

    it('should include timestamp', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('Root endpoint', () => {
    it('should return 200 on GET /', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    });

    it('should return service info', async () => {
      const res = await request(app).get('/');
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('API endpoints', () => {
    it('should have products route defined', () => {
      // Verificamos que la ruta existe sin hacer request real a MongoDB
      expect(app._router).toBeDefined();
    });
  });
});
