/**
 * Health Check Middleware Stub for Railway Deployment
 */

const createHealthCheck = (options = {}) => {
  const serviceName = options.serviceName || 'unknown';

  return (req, res) => {
    res.json({
      status: 'ok',
      service: serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  };
};

const createLivenessCheck = (serviceName) => (req, res) => {
  res.json({ status: 'ok', service: serviceName, alive: true });
};

const createReadinessCheck = (serviceName) => (req, res) => {
  res.json({ status: 'ok', service: serviceName, ready: true });
};

module.exports = {
  createHealthCheck,
  createLivenessCheck,
  createReadinessCheck,
};
