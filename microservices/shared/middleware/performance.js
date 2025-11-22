/**
 * Performance Middleware - Optimizaciones de rendimiento
 * Incluye compression, ETags, cache control headers
 */

const compression = require('compression');

/**
 * Configuración de compression optimizada
 * Comprime responses > 1KB con gzip/deflate
 */
function compressionMiddleware() {
  return compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  });
}

/**
 * Response time header middleware
 */
function responseTime() {
  return (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    });
    next();
  };
}

/**
 * Middleware para optimizar respuestas JSON
 */
function optimizeJSON() {
  return (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.send(JSON.stringify(data));
      }
      return originalJson.call(this, data);
    };
    next();
  };
}

module.exports = {
  compressionMiddleware,
  responseTime,
  optimizeJSON,
};
