/**
 * Access Log Middleware
 * Logs all HTTP requests
 */

const accessLog = (logger) => {
  return (req, res, next) => {
    const start = Date.now();

    // Log on response finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        correlationId: req.correlationId || req.id,
      };

      if (res.statusCode >= 400) {
        logger.warn('Request completed with error', logData);
      } else {
        logger.info('Request completed', logData);
      }
    });

    next();
  };
};

module.exports = { accessLog };
