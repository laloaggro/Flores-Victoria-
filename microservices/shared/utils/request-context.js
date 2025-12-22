/**
 * Request Context Manager
 * 
 * Maneja contexto de requests (trace IDs, user info, metadata)
 * Sin usar Jaeger/OpenTelemetry (para evitar segfault)
 * 
 * Alternativa ligera para tracing distribuido
 */

const AsyncLocalStorage = require('async_hooks').AsyncLocalStorage;

const requestContextStore = new AsyncLocalStorage();

/**
 * Inicializar contexto de request
 */
function initializeRequestContext(req, res, next) {
  const traceId = req.id || req.headers['x-trace-id'] || generateTraceId();
  const startTime = Date.now();

  const context = {
    traceId,
    requestId: req.id,
    userId: req.user?.id,
    email: req.user?.email,
    method: req.method,
    path: req.path,
    ip: req.ip,
    startTime,
    duration: null,
    spanId: generateSpanId()
  };

  requestContextStore.run(context, () => {
    res.setHeader('X-Trace-ID', traceId);
    res.setHeader('X-Request-ID', req.id || traceId);

    // Calcular duración al finalizar
    res.on('finish', () => {
      context.duration = Date.now() - startTime;
    });

    next();
  });
}

/**
 * Obtener contexto actual
 */
function getRequestContext() {
  return requestContextStore.getStore();
}

/**
 * Obtener trace ID
 */
function getTraceId() {
  const context = getRequestContext();
  return context?.traceId;
}

/**
 * Crear span (evento trazable)
 */
function createSpan(name, attributes = {}) {
  const context = getRequestContext();
  if (!context) return null;

  return {
    name,
    spanId: generateSpanId(),
    traceId: context.traceId,
    parentSpanId: context.spanId,
    startTime: Date.now(),
    attributes: {
      ...attributes,
      'trace.id': context.traceId,
      'request.id': context.requestId,
      'user.id': context.userId
    },
    events: [],
    duration: null,

    /**
     * Registrar evento en el span
     */
    addEvent(eventName, eventAttributes = {}) {
      this.events.push({
        name: eventName,
        timestamp: Date.now(),
        attributes: eventAttributes
      });
    },

    /**
     * Finalizar span
     */
    end(status = 'OK', error = null) {
      this.duration = Date.now() - this.startTime;
      if (error) {
        this.attributes['error'] = true;
        this.attributes['error.message'] = error.message;
        this.attributes['error.stack'] = error.stack;
      }
      this.attributes['span.status'] = status;
      this.attributes['span.duration_ms'] = this.duration;

      return {
        traceId: this.traceId,
        spanId: this.spanId,
        parentSpanId: this.parentSpanId,
        name: this.name,
        duration: this.duration,
        status,
        error: error?.message || null
      };
    }
  };
}

/**
 * Generar trace ID
 */
function generateTraceId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generar span ID
 */
function generateSpanId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Propagar contexto a llamadas externas
 */
function propagateContext(headers = {}) {
  const context = getRequestContext();
  if (!context) return headers;

  return {
    ...headers,
    'X-Trace-ID': context.traceId,
    'X-Request-ID': context.requestId,
    'X-Parent-Span-ID': context.spanId,
    'X-User-ID': context.userId
  };
}

module.exports = {
  initializeRequestContext,
  getRequestContext,
  getTraceId,
  createSpan,
  propagateContext,
  generateTraceId,
  generateSpanId
};
