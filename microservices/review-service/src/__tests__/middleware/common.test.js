/**
 * Tests para middleware común de review-service
 */

const express = require('express');
const request = require('supertest');
const { applyCommonMiddleware, setupHealthChecks } = require('../../middleware/common');

describe('Common Middleware - Review Service', () => {
  let app;

  beforeEach(() => {
    app = express();
  });

  it('should export middleware functions', () => {
    expect(applyCommonMiddleware).toBeDefined();
    expect(setupHealthChecks).toBeDefined();
  });

  it('should export applyCommonMiddleware as a function', () => {
    expect(typeof applyCommonMiddleware).toBe('function');
  });

  it('should export setupHealthChecks as a function', () => {
    expect(typeof setupHealthChecks).toBe('function');
  });

  describe('applyCommonMiddleware', () => {
    it('should apply middleware without errors', () => {
      expect(() => {
        applyCommonMiddleware(app);
      }).not.toThrow();
    });

    it('should enable JSON body parsing', () => {
      applyCommonMiddleware(app);

      app.post('/test', (req, res) => {
        res.json(req.body);
      });

      return request(app)
        .post('/test')
        .send({ message: 'test' })
        .expect(200)
        .expect({ message: 'test' });
    });

    it('should handle CORS', () => {
      applyCommonMiddleware(app);

      app.get('/test', (req, res) => {
        res.json({ ok: true });
      });

      return request(app).get('/test').expect('Access-Control-Allow-Origin', /.*/).expect(200);
    });
  });

  describe('setupHealthChecks', () => {
    it('should setup health check endpoints without errors', () => {
      applyCommonMiddleware(app);

      expect(() => {
        setupHealthChecks(app);
      }).not.toThrow();
    });

    it('should create /health endpoint', async () => {
      applyCommonMiddleware(app);
      setupHealthChecks(app);

      const response = await request(app).get('/health');
      expect([200, 503]).toContain(response.status);
    });

    it('should create /ready endpoint', async () => {
      applyCommonMiddleware(app);
      setupHealthChecks(app);

      const response = await request(app).get('/ready');
      expect([200, 503]).toContain(response.status);
    });

    it('should create /live endpoint', async () => {
      applyCommonMiddleware(app);
      setupHealthChecks(app);

      const response = await request(app).get('/live');
      expect([200, 503]).toContain(response.status);
    });
  });
});
