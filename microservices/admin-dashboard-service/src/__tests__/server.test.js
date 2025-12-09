const request = require('supertest');
const app = require('../server');

describe('admin-dashboard-service - Health Check', () => {
  it('GET /health - should return healthy status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'admin-dashboard-service');
    expect(response.body).toHaveProperty('uptime');
  });
});

describe('admin-dashboard-service - API Info', () => {
  it('GET /api/admin_dashboard_service - should return service info', async () => {
    const response = await request(app).get('/api/admin_dashboard_service');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
  });
});

describe('admin-dashboard-service - 404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/ruta-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', true);
  });
});
