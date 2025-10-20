const { httpRequestDuration, httpRequestTotal } = require('./index');

const metricsMiddleware = (serviceName) => (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const end = process.hrtime(start);
    const duration = (end[0] * 1e9 + end[1]) / 1e9;

    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
      service: serviceName
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });

  next();
};

module.exports = metricsMiddleware;