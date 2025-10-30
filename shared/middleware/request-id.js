/**
 * Middleware de Request ID
 * - Propaga/crea x-request-id por cada solicitud
 * - Expone req.requestId
 * - Opción helper para adjuntar logger por-request
 */

const { randomBytes } = require('crypto');

const genId = () => {
  // Usa crypto.randomUUID si existe, si no, fallback a 16 bytes hex
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return randomBytes(16).toString('hex');
};

function requestId(headerName = 'x-request-id') {
  const name = headerName.toLowerCase();
  return (req, res, next) => {
    const existing = req.headers[name];
    const id = (Array.isArray(existing) ? existing[0] : existing) || genId();
    req.requestId = id;
    res.setHeader(headerName, id);
    next();
  };
}

function withLogger(logger) {
  if (!logger || typeof logger.withRequestId !== 'function') {
    throw new Error('withLogger requiere un logger con método withRequestId(id)');
  }
  return (req, _res, next) => {
    const id = req.requestId || genId();
    if (!req.requestId) req.requestId = id;
    req.log = logger.withRequestId(id);
    next();
  };
}

module.exports = { requestId, withLogger };
