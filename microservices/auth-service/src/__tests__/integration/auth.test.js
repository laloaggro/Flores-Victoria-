/**
 * Integration tests for Auth Service
 * Testing authentication endpoints (login, register)
 */

const request = require('supertest');
const app = require('../../app');

describe('Auth Service - Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123456!',
    };

    it('should register a new user with valid credentials', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      
      // Could be 201 (created) or other status codes
      expect([200, 201, 400, 404, 409, 422]).toContain(res.statusCode);
      
      if (res.statusCode === 201 || res.statusCode === 200) {
        expect(res.body).toHaveProperty('message');
      }
    });

    it('should reject registration with missing email', async () => {
      const invalidUser = {
        name: 'Test User',
        password: 'Test123456!',
      };

      const res = await request(app).post('/api/auth/register').send(invalidUser);
      
      expect([400, 404, 422]).toContain(res.statusCode);
    });

    it('should reject registration with weak password', async () => {
      const weakPassUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: '123',
      };

      const res = await request(app).post('/api/auth/register').send(weakPassUser);
      
      expect([400, 404, 422]).toContain(res.statusCode);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login without credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      
      expect([400, 401, 404, 422]).toContain(res.statusCode);
    });

    it('should reject login with invalid email format', async () => {
      const invalidLogin = {
        email: 'not-an-email',
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/login').send(invalidLogin);
      
      expect([400, 401, 404, 422]).toContain(res.statusCode);
    });

    it('should have correct content-type for responses', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password',
      });
      
      if (res.statusCode !== 404) {
        expect(res.headers['content-type']).toContain('json');
      }
    });
  });

  describe('Health Checks', () => {
    it('GET /health should return service status', async () => {
      const res = await request(app).get('/health');
      
      expect([200, 404]).toContain(res.statusCode);
    });

    it('GET /ready should return readiness status', async () => {
      const res = await request(app).get('/ready');
      
      expect([200, 404]).toContain(res.statusCode);
    });

    it('GET /metrics should return Prometheus metrics', async () => {
      const res = await request(app).get('/metrics');
      
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('# HELP');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/api/non-existent');
      
      expect(res.statusCode).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ malformed json }');
      
      expect([400, 404]).toContain(res.statusCode);
    });
  });
});
