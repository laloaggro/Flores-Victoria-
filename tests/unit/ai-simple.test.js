const request = require('supertest');

const app = require('../../ai-simple');

describe('AI Simple Service', () => {
  it('GET /health should return OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.service).toBe('AI Service');
  });

  it('GET /ai/recommendations should return list', async () => {
    const res = await request(app).get('/ai/recommendations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    expect(res.body.recommendations.length).toBeGreaterThan(0);
  });
});
