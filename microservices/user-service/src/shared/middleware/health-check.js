// Health check middleware stub for microservices
const createHealthCheck = (opts) => (req, res) => 
  res.json({ status: 'ok', service: opts?.serviceName || 'unknown', timestamp: new Date().toISOString() });

const createLivenessCheck = (name) => (req, res) => 
  res.json({ status: 'ok', service: name });

const createReadinessCheck = (name) => (req, res) => 
  res.json({ status: 'ok', service: name });

const healthCheckMiddleware = (req, res, next) => next();

module.exports = { 
  createHealthCheck, 
  createLivenessCheck, 
  createReadinessCheck, 
  healthCheckMiddleware 
};
