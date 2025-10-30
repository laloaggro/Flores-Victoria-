/**
 * Middleware de Access Log
 * Registra método, path, estado y duración para cada request.
 * Usa req.log si existe; si no, usa el logger pasado.
 */

function accessLog(serviceLogger) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const logger = req.log || serviceLogger;

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;
      const meta = {
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        durationMs: Math.round(durationMs),
        contentLength: res.getHeader('content-length') || undefined,
      };
      if (logger && typeof logger.info === 'function') {
        logger.info('HTTP access', meta);
      }
    });

    next();
  };
}

module.exports = { accessLog };
