const request = require('supertest');

// Mock database antes de cargar app
jest.mock('../../config/database', () => {
  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [{ now: new Date() }] }),
    pool: {
      query: jest.fn().mockResolvedValue({ rows: [{ now: new Date() }] }),
    },
  };
  return mockPool;
});

const app = require('../../app');

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

  it('GET /ready should return readiness status', async () => {
    const res = await request(app).get('/ready');

    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('status');
  });

  it('GET /metrics should return Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('# HELP');
    expect(res.headers['content-type']).toMatch(/text\/plain/);
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
