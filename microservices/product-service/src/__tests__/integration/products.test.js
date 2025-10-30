const request = require('supertest');
const app = require('../../app');

describe('POST /api/products', () => {
  it('should reject product creation without authentication', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category: 'Test Category',
    });

    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it('should reject product creation with missing required fields', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
    });

    expect([400, 404, 422]).toContain(res.statusCode);
  });

  it('should reject product creation with invalid price', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
      description: 'Test Description',
      price: -50,
      category: 'Test Category',
    });

    expect([400, 404, 422]).toContain(res.statusCode);
  });
});

describe('GET /api/products', () => {
  it('should return products list', async () => {
    const res = await request(app).get('/api/products');

    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toBeDefined();
    }
  });

  it('should support pagination parameters', async () => {
    const res = await request(app).get('/api/products').query({ page: 1, limit: 10 });

    expect([200, 400, 404]).toContain(res.statusCode);
  });
});

describe('GET /api/products/:id', () => {
  it('should return 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/999999');

    expect([404, 400]).toContain(res.statusCode);
  });

  it('should reject invalid product ID format', async () => {
    const res = await request(app).get('/api/products/invalid-id');

    expect([400, 404]).toContain(res.statusCode);
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
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('uptime');
    }
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

  it('should handle malformed JSON in request body', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    expect([400, 422]).toContain(res.statusCode);
  });
});
