const request = require('supertest');
const app = require('../../app');

describe('POST /api/cart/add', () => {
  it('should reject cart operations without authentication', async () => {
    const res = await request(app).post('/api/cart/add').send({
      productId: 'test-product',
      quantity: 1,
    });

    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it('should reject invalid product data', async () => {
    const res = await request(app).post('/api/cart/add').send({
      quantity: -1,
    });

    expect([400, 401, 422]).toContain(res.statusCode);
  });
});

describe('GET /api/cart', () => {
  it('should reject get cart without authentication', async () => {
    const res = await request(app).get('/api/cart');

    expect([401, 403, 404]).toContain(res.statusCode);
  });
});

describe('PUT /api/cart/update', () => {
  it('should reject update without authentication', async () => {
    const res = await request(app).put('/api/cart/update').send({
      productId: 'test-product',
      quantity: 2,
    });

    expect([401, 403, 404]).toContain(res.statusCode);
  });
});

describe('DELETE /api/cart/remove/:productId', () => {
  it('should reject remove without authentication', async () => {
    const res = await request(app).delete('/api/cart/remove/test-product');

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
      .post('/api/cart/add')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    expect([400, 422]).toContain(res.statusCode);
  });
});
