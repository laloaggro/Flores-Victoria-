const { initTracer } = require('jaeger-client');
const opentracing = require('opentracing');

/**
 * Inicializar tracer
 * @param {string} serviceName - Nombre del servicio
 * @returns {object} Tracer instance
 */
function init(serviceName) {
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
      'flores-victoria.version': '1.0.0',
    },
    logger: {
      info: function logInfo(msg) {
        console.log(`JAEGER INFO: ${msg}`);
      },
      error: function logError(msg) {
        console.log(`JAEGER ERROR: ${msg}`);
      },
    },
  };

  return initTracer(config, options);
}

/**
 * Middleware de tracing para Express
 * @param {string} serviceName - Nombre del servicio
 * @returns {function} Middleware de Express
 */
function middleware(serviceName) {
  const tracer = init(serviceName);

  return (req, res, next) => {
    // Extraer el span context de los headers
    const parentSpanContext = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers);

    // Crear un nuevo span
    const span = tracer.startSpan(req.path, { childOf: parentSpanContext });

    // Agregar tags al span
    span.setTag('http.method', req.method);
    span.setTag('http.url', req.url);
    span.setTag('span.kind', 'server');

    // Guardar el span en el request para usarlo en otras partes de la aplicación
    req.span = span;

    // Interceptamos la función res.end para finalizar el span cuando se termine la solicitud
    const oldEnd = res.end;
    res.end = function () {
      // Agregar el código de estado al span
      span.setTag('http.status_code', res.statusCode);

      // Si hay un error, marcar el span como error
      if (res.statusCode >= 400) {
        span.setTag(opentracing.Tags.ERROR, true);
      }

      // Finalizar el span
      span.finish();

      // Llamar a la función original
      oldEnd.apply(res, arguments);
    };

    next();
  };
}

/**
 * Crear un span hijo para operaciones internas
 * @param {object} parentSpan - Span padre
 * @param {string} operationName - Nombre de la operación
 * @returns {object} Span hijo
 */
function createChildSpan(parentSpan, operationName) {
  const tracer = parentSpan.tracer();
  return tracer.startSpan(operationName, { childOf: parentSpan });
}

module.exports = {
  init,
  middleware,
  createChildSpan,
};
