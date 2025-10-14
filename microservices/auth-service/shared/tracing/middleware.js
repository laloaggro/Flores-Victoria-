const { createSpan } = require('./tracer');

/**
 * Middleware para tracing distribuido
 * @param {string} serviceName - Nombre del servicio
 * @returns {function} Middleware function
 */
const tracingMiddleware = (serviceName) => (req, res, next) => {
  // Crear contexto de trace
  const traceContext = {
    traceId: req.headers['x-trace-id'] || require('uuid').v4(),
    spanId: require('uuid').v4(),
    parentId: req.headers['x-parent-span-id'] || null,
    serviceName: serviceName,
    operationName: 'http_request',
    startTime: Date.now()
  };

  // Añadir contexto al request
  req.traceContext = traceContext;
  
  // Crear función para crear spans hijos
  req.createChildSpan = (operationName) => {
    return createSpan(traceContext, operationName);
  };

  // Añadir headers de tracing a las respuestas
  res.setHeader('X-Trace-ID', traceContext.traceId);
  
  // Registrar fin de la solicitud
  res.on('finish', () => {
    const duration = Date.now() - traceContext.startTime;
    console.log(`[${serviceName}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

/**
 * Crear un span hijo
 * @param {object} parentSpan - Span padre
 * @param {string} operationName - Nombre de la operación
 * @returns {object} Nuevo span
 */
const createChildSpan = (parentSpan, operationName) => {
  if (!parentSpan) return null;
  
  const childSpan = createSpan(parentSpan, operationName);
  
  // Métodos para el span
  childSpan.setTag = (key, value) => {
    childSpan.tags = childSpan.tags || {};
    childSpan.tags[key] = value;
  };
  
  childSpan.log = (fields) => {
    childSpan.logs = childSpan.logs || [];
    childSpan.logs.push({
      timestamp: Date.now(),
      ...fields
    });
  };
  
  childSpan.finish = () => {
    const duration = Date.now() - childSpan.startTime;
    console.log(`[SPAN] ${childSpan.operationName} - ${duration}ms`, childSpan.tags || {});
  };
  
  return childSpan;
};

module.exports = {
  tracingMiddleware,
  createChildSpan
};