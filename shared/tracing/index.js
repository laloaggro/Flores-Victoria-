const Tracer = require('./tracer');
const { tracingMiddleware, createChildSpan } = require('./middleware');

/**
 * Inicializar tracer para un servicio
 * @param {string} serviceName - Nombre del servicio
 * @returns {object} Objeto tracer
 */
const initTracer = (serviceName) => {
  const tracer = new Tracer(serviceName);
  
  // Añadir middleware al tracer para facilitar su uso
  tracer.middleware = tracingMiddleware(serviceName);
  tracer.createChildSpan = createChildSpan;
  
  return tracer;
};

module.exports = initTracer;