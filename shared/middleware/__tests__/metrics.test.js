/**
 * Metrics Middleware Tests
 * 
 * Tests para validar el comportamiento del middleware de métricas Prometheus
 */

const { register } = require('prom-client');
const { initMetrics, metricsMiddleware, MetricsHelper } = require('../metrics');

describe('Metrics Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Clear all metrics before each test
    register.clear();

    req = {
      method: 'GET',
      path: '/api/test',
      route: { path: '/api/test' },
      headers: {
        'content-length': '100',
      },
    };
    res = {
      statusCode: 200,
      on: jest.fn(),
      getHeader: jest.fn().mockReturnValue(50),
    };
    next = jest.fn();
  });

  describe('initMetrics', () => {
    test('should initialize metrics with service name', () => {
      initMetrics('test-service');

      const metrics = register.metrics();
      expect(metrics).toContain('test-service');
    });

    test('should create default HTTP metrics', async () => {
      initMetrics('test-service');

      const metrics = await register.metrics();
      expect(metrics).toContain('http_request_duration_seconds');
      expect(metrics).toContain('http_requests_total');
      expect(metrics).toContain('http_requests_active');
    });
  });

  describe('metricsMiddleware', () => {
    test('should call next', () => {
      initMetrics('test-service');
      const middleware = metricsMiddleware();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should track request duration on finish', (done) => {
      initMetrics('test-service');
      const middleware = metricsMiddleware();

      res.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
          
          // Verify metrics were updated
          register.metrics().then((metrics) => {
            expect(metrics).toContain('http_request_duration_seconds');
            done();
          });
        }
      });

      middleware(req, res, next);
    });

    test('should increment total requests counter', (done) => {
      initMetrics('test-service');
      const middleware = metricsMiddleware();

      res.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
          
          register.metrics().then((metrics) => {
            expect(metrics).toContain('http_requests_total');
            expect(metrics).toContain('method="GET"');
            expect(metrics).toContain('status="200"');
            done();
          });
        }
      });

      middleware(req, res, next);
    });

    test('should track request and response sizes', (done) => {
      initMetrics('test-service');
      const middleware = metricsMiddleware();

      res.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
          
          register.metrics().then((metrics) => {
            expect(metrics).toContain('http_request_size_bytes');
            expect(metrics).toContain('http_response_size_bytes');
            done();
          });
        }
      });

      middleware(req, res, next);
    });
  });

  describe('MetricsHelper', () => {
    beforeEach(() => {
      initMetrics('test-service');
    });

    test('should measure async operation duration', async () => {
      const operation = jest.fn().mockResolvedValue('result');

      const result = await MetricsHelper.measureOperation('test_operation', operation);

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalled();
    });

    test('should increment business metric', async () => {
      MetricsHelper.incrementBusinessMetric('orders_created', { status: 'pending' });

      const metrics = await register.metrics();
      expect(metrics).toContain('orders_created');
      expect(metrics).toContain('status="pending"');
    });

    test('should track database query duration', async () => {
      const query = jest.fn().mockResolvedValue([{ id: 1 }]);

      await MetricsHelper.trackDatabaseQuery('SELECT', 'users', query);

      const metrics = await register.metrics();
      expect(metrics).toContain('db_query_duration_seconds');
      expect(metrics).toContain('operation="SELECT"');
      expect(metrics).toContain('collection="users"');
    });

    test('should increment error counter', async () => {
      MetricsHelper.incrementErrorCounter('ValidationError', '/api/test', 'POST');

      const metrics = await register.metrics();
      expect(metrics).toContain('errors_total');
      expect(metrics).toContain('type="ValidationError"');
    });

    test('should handle operation errors and re-throw', async () => {
      const error = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(
        MetricsHelper.measureOperation('failing_operation', operation)
      ).rejects.toThrow('Operation failed');
    });
  });

  describe('metricsEndpoint', () => {
    test('should return metrics in Prometheus format', async () => {
      initMetrics('test-service');
      const { metricsEndpoint } = require('../metrics');

      const mockReq = {};
      const mockRes = {
        set: jest.fn(),
        end: jest.fn(),
      };

      const handler = metricsEndpoint();
      await handler(mockReq, mockRes);

      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', register.contentType);
      expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('http_requests_total'));
    });
  });
});
