// Request ID middleware with logger
const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9);
  res.setHeader('x-request-id', req.id);
  next();
};

const withLogger = (logger) => (req, res, next) => {
  req.logger = logger;
  next();
};

module.exports = { requestId, withLogger };
