const jaeger = require('jaeger-client');
const { initTracer: initJaegerTracer } = require('jaeger-client');

/**
 * Inicializar tracer de Jaeger
 * @param {string} serviceName - Nombre del servicio
 * @returns {object} Tracer de Jaeger
 */
function initTracer(serviceName) {
  const config = {
    serviceName,
    sampler: {
      type: 'const',
      param: 1,
    },
    reporter: {
      logSpans: true,
      agentHost: process.env.JAEGER_AGENT_HOST || 'jaeger',
      agentPort: process.env.JAEGER_AGENT_PORT || 6832,
    },
  };

  const options = {
    tags: {
      'my-awesome-service.version': '1.0.0',
    },
    metrics: {},
  };

  return initJaegerTracer(config, options);
}

module.exports = {
  initTracer,
};
