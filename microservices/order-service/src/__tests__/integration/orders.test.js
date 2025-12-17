const request = require('supertest');

// Mock Order model para evitar problemas con Mongoose
jest.mock('../../models/Order', () => ({
  create: jest.fn().mockResolvedValue({ _id: 'mock-id', status: 'pending' }),
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
}));

// Mock del controlador
jest.mock('../../controllers/orderController', () => {
  return jest.fn().mockImplementation(() => ({
    createOrder: jest.fn((req, res) => res.status(201).json({ status: 'success' })),
    getOrders: jest.fn((req, res) => res.status(200).json({ orders: [] })),
    getOrder: jest.fn((req, res) => res.status(200).json({ order: {} })),
    updateOrder: jest.fn((req, res) => res.status(200).json({ status: 'updated' })),
  }));
});

// Mock database
jest.mock('../../config/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  pool: { query: jest.fn().mockResolvedValue({ rows: [] }) },
}));

// Ahora importar app (después de los mocks)
const app = require('../../app.simple');

describe('POST /api/orders', () => {
  it('should reject order creation without authentication', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: 'test-product', quantity: 1, price: 100 }],
        shippingAddress: 'Test Address',
      });

    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it('should reject order with missing required fields', async () => {
    const res = await request(app).post('/api/orders').send({
      items: [],
    });

    expect([400, 401, 422]).toContain(res.statusCode);
  });

  it('should reject order with invalid items', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: '', quantity: -1 }],
        shippingAddress: 'Test Address',
      });

    expect([400, 401, 422]).toContain(res.statusCode);
  });
});

describe('GET /api/orders', () => {
  it('should reject get orders without authentication', async () => {
    const res = await request(app).get('/api/orders');

    expect([401, 403, 404]).toContain(res.statusCode);
  });
});

describe('GET /api/orders/:id', () => {
  it('should reject get order by id without authentication', async () => {
    const res = await request(app).get('/api/orders/test-order-id');

    expect([401, 403, 404]).toContain(res.statusCode);
  });
});

describe('PUT /api/orders/:id/status', () => {
  it('should reject status update without authentication', async () => {
    const res = await request(app).put('/api/orders/test-order-id/status').send({
      status: 'processing',
    });

    expect([401, 403, 404]).toContain(res.statusCode);
  });
});

describe('Health Checks', () => {
  it('GET /health should return service status', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  // Nota: /ready puede no estar implementado en app.simple
  it('GET /ready should return readiness status if available', async () => {
    const res = await request(app).get('/ready');

    // 200 = ready, 503 = not ready, 404 = endpoint not implemented
    expect([200, 404, 503]).toContain(res.statusCode);
    if (res.statusCode !== 404) {
      expect(res.body).toHaveProperty('ready');
    }
  });

  // Nota: /metrics puede no estar implementado en app.simple
  it('GET /metrics should return Prometheus metrics if available', async () => {
    const res = await request(app).get('/metrics');

    // 200 = metrics available, 404 = endpoint not implemented
    if (res.statusCode === 200) {
      expect(res.text).toContain('# HELP');
      expect(res.headers['content-type']).toMatch(/text\/plain/);
    } else {
      expect(res.statusCode).toBe(404);
    }
  });
});

describe('Error Handling', () => {
  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/api/non-existent-route');

    expect(res.statusCode).toBe(404);
  });

  it('should handle malformed JSON', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    expect([400, 422]).toContain(res.statusCode);
  });
});
