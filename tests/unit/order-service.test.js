const request = require('supertest');

const app = require('../../order-service-simple');

describe('Order Service', () => {
  it('GET /health should return OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.service).toBe('Order Service');
  });

  it('GET /api/orders should return list', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.orders)).toBe(true);
  });
});
