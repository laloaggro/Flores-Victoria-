const request = require('supertest');
const app = require('../../microservices/api-gateway/src/app');

describe('API Gateway - Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('service', 'api-gateway');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /ready', () => {
    it('should return 200 and readiness status', async () => {
      const res = await request(app)
        .get('/ready')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('service', 'api-gateway');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('memory');
    });
  });

  describe('GET /metrics', () => {
    it('should return 200 and metrics data', async () => {
      const res = await request(app)
        .get('/metrics')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('service', 'api-gateway');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('memory');
      expect(res.body).toHaveProperty('cpu');
      expect(res.body).toHaveProperty('version');
    });
  });
});

describe('API Gateway - Root Endpoint', () => {
  it('should return API information', async () => {
    const res = await request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('version');
  });
});

describe('API Gateway - Swagger Documentation', () => {
  it('should serve Swagger UI', async () => {
    const res = await request(app)
      .get('/api-docs/')
      .expect(200);

    expect(res.text).toContain('swagger-ui');
  });
});

describe('API Gateway - Security Headers', () => {
  it('should include security headers', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options');
    expect(res.headers).not.toHaveProperty('x-powered-by');
  });
});

describe('API Gateway - Request ID', () => {
  it('should add X-Request-ID header to responses', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.headers).toHaveProperty('x-request-id');
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should use provided X-Request-ID if present', async () => {
    const requestId = 'test-request-id-12345';
    const res = await request(app)
      .get('/health')
      .set('X-Request-ID', requestId)
      .expect(200);

    expect(res.headers['x-request-id']).toBe(requestId);
  });
});

describe('API Gateway - CORS', () => {
  it('should handle CORS preflight requests', async () => {
    const res = await request(app)
      .options('/api/products')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(res.headers).toHaveProperty('access-control-allow-origin');
  });

  it('should include CORS headers in responses', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173')
      .expect(200);

    expect(res.headers).toHaveProperty('access-control-allow-origin');
  });
});

describe('API Gateway - Rate Limiting', () => {
  it('should include rate limit headers', async () => {
    const res = await request(app)
      .get('/api/products')
      .expect(res => {
        if (res.status !== 404 && res.status !== 200) {
          throw new Error(`Expected 404 or 200, got ${res.status}`);
        }
      });

    // Rate limit headers should be present
    expect(res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit']).toBeDefined();
  });

  it('should not rate limit health endpoints', async () => {
    // Make multiple requests to health endpoint
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .get('/health')
        .expect(200);
    }
    // Should not be rate limited
  });
});
