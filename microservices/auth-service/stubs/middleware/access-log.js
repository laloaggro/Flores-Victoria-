/**
 * Access Log Middleware Stub for Railway Deployment
 */

const accessLog = (options = {}) => {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms`;
      console.log(`[ACCESS] ${log}`);
    });

    next();
  };
};

module.exports = accessLog;
module.exports.default = accessLog;
