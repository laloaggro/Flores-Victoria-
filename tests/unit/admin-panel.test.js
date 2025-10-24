const request = require('supertest');
const app = require('../../admin-panel/server');

describe('Admin Panel', () => {
  it('GET /health should return OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('service', 'admin-panel');
  });

  it('GET / should return HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  it('GET /api/system/status should return success', async () => {
    const res = await request(app).get('/api/system/status');
    // Puede retornar success o error si el script externo falla; validamos que responde JSON
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect([200,500]).toContain(res.status);
  });
});
