/**
 * Tests for @flores-victoria/shared/middleware/health-check
 */
const {
  createHealthCheck,
  simpleHealthCheck,
  createReadinessCheck,
  createLivenessCheck,
} = require('../middleware/health-check');

describe('Health Check Middleware', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('createHealthCheck', () => {
    it('should return healthy status when no checks configured', async () => {
      const middleware = createHealthCheck({ serviceName: 'test-service' });

      await middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'test-service',
        })
      );
    });

    it('should include timestamp in response', async () => {
      const middleware = createHealthCheck();

      await middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
    });

    it('should include uptime in response', async () => {
      const middleware = createHealthCheck();

      await middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(typeof response.uptime).toBe('number');
      expect(response.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include system memory metrics', async () => {
      const middleware = createHealthCheck();

      await middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.system).toBeDefined();
      expect(response.system.memory).toBeDefined();
      expect(typeof response.system.memory.used).toBe('number');
      expect(typeof response.system.memory.total).toBe('number');
      expect(typeof response.system.memory.percentage).toBe('number');
    });

    it('should check database when dbCheck provided and healthy', async () => {
      const dbCheck = jest.fn().mockResolvedValue(true);
      const middleware = createHealthCheck({
        serviceName: 'test-service',
        dbCheck,
      });

      await middleware(mockReq, mockRes);

      expect(dbCheck).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          checks: expect.objectContaining({
            database: expect.objectContaining({ status: 'up' }),
          }),
        })
      );
    });

    it('should return unhealthy when dbCheck returns false', async () => {
      const dbCheck = jest.fn().mockResolvedValue(false);
      const middleware = createHealthCheck({
        serviceName: 'test-service',
        dbCheck,
      });

      await middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          checks: expect.objectContaining({
            database: expect.objectContaining({ status: 'down' }),
          }),
        })
      );
    });

    it('should return unhealthy when dbCheck throws error', async () => {
      const dbCheck = jest.fn().mockRejectedValue(new Error('Connection failed'));
      const middleware = createHealthCheck({
        serviceName: 'test-service',
        dbCheck,
      });

      await middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          checks: expect.objectContaining({
            database: expect.objectContaining({
              status: 'down',
              error: 'Connection failed',
            }),
          }),
        })
      );
    });

    it('should check cache when cacheCheck provided', async () => {
      const cacheCheck = jest.fn().mockResolvedValue(true);
      const middleware = createHealthCheck({
        serviceName: 'test-service',
        cacheCheck,
      });

      await middleware(mockReq, mockRes);

      expect(cacheCheck).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            cache: expect.objectContaining({ status: 'up' }),
          }),
        })
      );
    });

    it('should still be healthy when cache fails (non-critical)', async () => {
      const cacheCheck = jest.fn().mockRejectedValue(new Error('Redis unavailable'));
      const middleware = createHealthCheck({
        serviceName: 'test-service',
        cacheCheck,
      });

      await middleware(mockReq, mockRes);

      // Cache is non-critical, should still be 200
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          checks: expect.objectContaining({
            cache: expect.objectContaining({ status: 'down' }),
          }),
        })
      );
    });

    it('should run custom checks', async () => {
      const customCheck = jest.fn().mockResolvedValue(true);
      const middleware = createHealthCheck({
        customChecks: { myCheck: customCheck },
      });

      await middleware(mockReq, mockRes);

      expect(customCheck).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            myCheck: { status: 'up' },
          }),
        })
      );
    });

    it('should be unhealthy when custom check fails', async () => {
      const customCheck = jest.fn().mockResolvedValue(false);
      const middleware = createHealthCheck({
        customChecks: { myCheck: customCheck },
      });

      await middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
        })
      );
    });

    it('should be unhealthy when custom check throws', async () => {
      const customCheck = jest.fn().mockRejectedValue(new Error('Check failed'));
      const middleware = createHealthCheck({
        customChecks: { myCheck: customCheck },
      });

      await middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          checks: expect.objectContaining({
            myCheck: expect.objectContaining({
              status: 'down',
              error: 'Check failed',
            }),
          }),
        })
      );
    });
  });

  describe('simpleHealthCheck', () => {
    it('should return healthy status', () => {
      const middleware = simpleHealthCheck('my-service');

      middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'my-service',
        })
      );
    });

    it('should include timestamp', () => {
      const middleware = simpleHealthCheck();

      middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
    });

    it('should include uptime', () => {
      const middleware = simpleHealthCheck();

      middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(typeof response.uptime).toBe('number');
    });

    it('should use default service name when not provided', () => {
      const middleware = simpleHealthCheck();

      middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.service).toBe('unknown');
    });
  });

  describe('createReadinessCheck', () => {
    it('should return ready when no checks configured', async () => {
      const middleware = createReadinessCheck({ serviceName: 'test-service' });

      await middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          ready: true,
        })
      );
    });

    it('should check database and return ready when healthy', async () => {
      const dbCheck = jest.fn().mockResolvedValue(true);
      const middleware = createReadinessCheck({
        serviceName: 'test-service',
        dbCheck,
      });

      await middleware(mockReq, mockRes);

      expect(dbCheck).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ready: true,
          database: 'ready',
        })
      );
    });

    it('should return not ready when database is down', async () => {
      const dbCheck = jest.fn().mockResolvedValue(false);
      const middleware = createReadinessCheck({
        dbCheck,
      });

      await middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ready: false,
          database: 'not_ready',
        })
      );
    });

    it('should handle database check error', async () => {
      const dbCheck = jest.fn().mockRejectedValue(new Error('DB error'));
      const middleware = createReadinessCheck({
        dbCheck,
      });

      await middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ready: false,
          database: 'not_ready',
        })
      );
    });

    it('should check cache when provided', async () => {
      const cacheCheck = jest.fn().mockResolvedValue(true);
      const middleware = createReadinessCheck({
        cacheCheck,
      });

      await middleware(mockReq, mockRes);

      expect(cacheCheck).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: 'ready',
        })
      );
    });

    it('should mark cache not_ready when check fails', async () => {
      const cacheCheck = jest.fn().mockResolvedValue(false);
      const middleware = createReadinessCheck({
        cacheCheck,
      });

      await middleware(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: 'not_ready',
        })
      );
    });

    it('should handle cache check error', async () => {
      const cacheCheck = jest.fn().mockRejectedValue(new Error('Redis error'));
      const middleware = createReadinessCheck({
        cacheCheck,
      });

      await middleware(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: 'not_ready',
        })
      );
    });

    it('should include timestamp', async () => {
      const middleware = createReadinessCheck();

      await middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('createLivenessCheck', () => {
    it('should return alive status', () => {
      const middleware = createLivenessCheck('my-service');

      middleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'alive',
          service: 'my-service',
        })
      );
    });

    it('should include timestamp', () => {
      const middleware = createLivenessCheck();

      middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
    });

    it('should use default service name when not provided', () => {
      const middleware = createLivenessCheck();

      middleware(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.service).toBe('unknown');
    });
  });
});
