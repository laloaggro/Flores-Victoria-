// Metrics middleware stub
const initMetrics = () => {};
const metricsMiddleware = (req, res, next) => next();
const metricsEndpoint = (req, res) => res.json({ metrics: {} });
module.exports = { initMetrics, metricsMiddleware, metricsEndpoint };
