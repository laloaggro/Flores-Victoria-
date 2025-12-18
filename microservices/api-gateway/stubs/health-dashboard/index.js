/**
 * Health Dashboard Stub for Railway Deployment
 * Provides simplified health dashboard functionality
 */

const serviceHealthCache = new Map();
const CACHE_TTL = 30000;

/**
 * Creates a health dashboard middleware that shows aggregated service health
 */
const createHealthDashboard = (options = {}) => {
  const { timeout = 5000, cacheTtl = CACHE_TTL } = options;

  return async (req, res) => {
    try {
      const dashboardData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          'api-gateway': { status: 'healthy', responseTime: 0 },
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * Creates a Prometheus-compatible metrics endpoint
 */
const createMetricsEndpoint = (options = {}) => {
  return (req, res) => {
    const metrics = [
      '# HELP api_gateway_up API Gateway up status',
      '# TYPE api_gateway_up gauge',
      'api_gateway_up 1',
      '',
      '# HELP api_gateway_uptime_seconds API Gateway uptime in seconds',
      '# TYPE api_gateway_uptime_seconds counter',
      `api_gateway_uptime_seconds ${Math.floor(process.uptime())}`,
      '',
      '# HELP nodejs_heap_size_used_bytes Node.js heap used',
      '# TYPE nodejs_heap_size_used_bytes gauge',
      `nodejs_heap_size_used_bytes ${process.memoryUsage().heapUsed}`,
      '',
    ].join('\n');

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  };
};

module.exports = {
  createHealthDashboard,
  createMetricsEndpoint,
};
