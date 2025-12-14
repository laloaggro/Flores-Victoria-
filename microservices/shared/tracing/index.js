/**
 * @fileoverview Distributed Tracing con Jaeger + Lightweight Fallback
 * @description Propagación de trace IDs entre microservicios
 * @author Flores Victoria Team
 * @version 2.0.0
 */

const crypto = require('crypto');

let initJaegerTracer;
try {
  initJaegerTracer = require('jaeger-client').initTracer;
} catch {
  // Jaeger no disponible, usar implementación lightweight
  initJaegerTracer = null;
}

// Headers estándar para tracing
const TRACE_HEADERS = {
  traceId: 'x-trace-id',
  spanId: 'x-span-id',
  parentSpanId: 'x-parent-span-id',
  sampled: 'x-trace-sampled',
  baggage: 'x-trace-baggage',
};

// Configuración por defecto
const DEFAULT_CONFIG = {
  serviceName: process.env.SERVICE_NAME || 'unknown-service',
  sampleRate: parseFloat(process.env.TRACE_SAMPLE_RATE) || 1.0,
  logTraces: process.env.TRACE_LOG_ENABLED === 'true' || process.env.NODE_ENV !== 'production',
  propagateHeaders: true,
  jaegerEnabled: process.env.JAEGER_ENABLED === 'true',
};

/**
 * Genera un ID único de 16 caracteres hex
 * @returns {string}
 */
const generateId = () => crypto.randomBytes(8).toString('hex');

/**
 * Genera un trace ID de 32 caracteres hex
 * @returns {string}
 */
const generateTraceId = () => crypto.randomBytes(16).toString('hex');

/**
 * Inicializar tracer de Jaeger
 * @param {string} serviceName - Nombre del servicio
 * @returns {object} Tracer de Jaeger o null si no está disponible
 */
function initTracer(serviceName) {
  if (!initJaegerTracer || !DEFAULT_CONFIG.jaegerEnabled) {
    console.info(`[Tracing] Usando tracing lightweight para ${serviceName}`);
    return null;
  }

  const config = {
    serviceName,
    sampler: {
      type: 'const',
      param: 1,
    },
    reporter: {
      logSpans: true,
      agentHost: process.env.JAEGER_AGENT_HOST || 'jaeger',
      agentPort: parseInt(process.env.JAEGER_AGENT_PORT) || 6832,
    },
  };

  const options = {
    tags: {
      [`${serviceName}.version`]: process.env.SERVICE_VERSION || '1.0.0',
    },
  };

  console.info(`[Tracing] Inicializando Jaeger para ${serviceName}`);
  return initJaegerTracer(config, options);
}

/**
 * Contexto del trace (lightweight fallback)
 */
class TraceContext {
  constructor(options = {}) {
    this.traceId = options.traceId || generateTraceId();
    this.spanId = options.spanId || generateId();
    this.parentSpanId = options.parentSpanId || null;
    this.sampled = options.sampled !== undefined ? options.sampled : Math.random() < DEFAULT_CONFIG.sampleRate;
    this.baggage = options.baggage || {};
    this.serviceName = options.serviceName || DEFAULT_CONFIG.serviceName;
    this.operationName = options.operationName || 'unknown';
    this.startTime = Date.now();
    this.tags = {};
    this.logs = [];
  }

  /**
   * Crea un span hijo
   * @param {string} operationName - Nombre de la operación
   * @returns {TraceContext}
   */
  createChild(operationName) {
    return new TraceContext({
      traceId: this.traceId,
      parentSpanId: this.spanId,
      sampled: this.sampled,
      baggage: { ...this.baggage },
      serviceName: this.serviceName,
      operationName,
    });
  }

  /**
   * Añade un tag al span
   * @param {string} key - Clave
   * @param {*} value - Valor
   * @returns {TraceContext}
   */
  setTag(key, value) {
    this.tags[key] = value;
    return this;
  }

  /**
   * Añade un log al span
   * @param {Object} fields - Campos del log
   * @returns {TraceContext}
   */
  log(fields) {
    this.logs.push({
      timestamp: Date.now(),
      ...fields,
    });
    return this;
  }

  /**
   * Finaliza el span y retorna duración
   * @returns {number} Duración en ms
   */
  finish() {
    const duration = Date.now() - this.startTime;
    this.duration = duration;

    if (DEFAULT_CONFIG.logTraces && this.sampled) {
      this._logSpan();
    }

    return duration;
  }

  /**
   * Log del span estructurado
   * @private
   */
  _logSpan() {
    console.info(
      JSON.stringify({
        type: 'span',
        traceId: this.traceId,
        spanId: this.spanId,
        parentSpanId: this.parentSpanId,
        service: this.serviceName,
        operation: this.operationName,
        duration: this.duration,
        tags: this.tags,
        logs: this.logs,
        timestamp: new Date(this.startTime).toISOString(),
      })
    );
  }

  /**
   * Extrae headers para propagación
   * @returns {Object}
   */
  toHeaders() {
    const headers = {
      [TRACE_HEADERS.traceId]: this.traceId,
      [TRACE_HEADERS.spanId]: this.spanId,
      [TRACE_HEADERS.sampled]: this.sampled ? '1' : '0',
    };

    if (this.parentSpanId) {
      headers[TRACE_HEADERS.parentSpanId] = this.parentSpanId;
    }

    if (Object.keys(this.baggage).length > 0) {
      headers[TRACE_HEADERS.baggage] = JSON.stringify(this.baggage);
    }

    return headers;
  }

  /**
   * Crea contexto desde headers HTTP
   * @param {Object} headers - Headers del request
   * @param {Object} options - Opciones adicionales
   * @returns {TraceContext}
   */
  static fromHeaders(headers, options = {}) {
    const normalizedHeaders = {};
    Object.keys(headers).forEach((key) => {
      normalizedHeaders[key.toLowerCase()] = headers[key];
    });

    const traceId = normalizedHeaders[TRACE_HEADERS.traceId];
    const spanId = normalizedHeaders[TRACE_HEADERS.spanId];
    const parentSpanId = normalizedHeaders[TRACE_HEADERS.parentSpanId];
    const sampled = normalizedHeaders[TRACE_HEADERS.sampled] === '1';

    let baggage = {};
    try {
      if (normalizedHeaders[TRACE_HEADERS.baggage]) {
        baggage = JSON.parse(normalizedHeaders[TRACE_HEADERS.baggage]);
      }
    } catch {
      // Ignorar error de parsing
    }

    return new TraceContext({
      traceId: traceId || generateTraceId(),
      parentSpanId: spanId || parentSpanId,
      sampled: traceId ? sampled : undefined,
      baggage,
      ...options,
    });
  }
}

/**
 * Middleware Express para distributed tracing
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Express middleware
 */
const tracingMiddleware = (options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options };

  return (req, res, next) => {
    // Crear o extraer contexto de trace
    const traceContext = TraceContext.fromHeaders(req.headers, {
      serviceName: config.serviceName,
      operationName: `${req.method} ${req.path}`,
    });

    // Añadir tags del request
    traceContext
      .setTag('http.method', req.method)
      .setTag('http.url', req.originalUrl)
      .setTag('http.route', req.route?.path || req.path)
      .setTag('http.user_agent', req.headers['user-agent'] || 'unknown');

    // Adjuntar al request
    req.trace = traceContext;
    req.traceId = traceContext.traceId;
    req.spanId = traceContext.spanId;

    // Añadir headers a la respuesta
    res.setHeader(TRACE_HEADERS.traceId, traceContext.traceId);
    res.setHeader(TRACE_HEADERS.spanId, traceContext.spanId);

    // Hook en finish para completar el span
    res.on('finish', () => {
      traceContext
        .setTag('http.status_code', res.statusCode)
        .setTag('http.response_size', res.get('content-length') || 0)
        .finish();
    });

    next();
  };
};

/**
 * Helper para propagar trace context en llamadas HTTP salientes
 * @param {TraceContext} traceContext - Contexto actual
 * @param {Object} options - Opciones de fetch/axios
 * @returns {Object} Opciones con headers de trace
 */
const propagateTrace = (traceContext, options = {}) => {
  if (!traceContext) {
    return options;
  }

  const childSpan = traceContext.createChild('http-client');

  return {
    ...options,
    headers: {
      ...options.headers,
      ...childSpan.toHeaders(),
    },
    _traceSpan: childSpan,
  };
};

/**
 * Wrapper para fetch con tracing
 * @param {TraceContext} traceContext - Contexto del trace
 * @param {string} url - URL
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Response>}
 */
const tracedFetch = async (traceContext, url, options = {}) => {
  const tracedOptions = propagateTrace(traceContext, options);
  const childSpan = tracedOptions._traceSpan;
  delete tracedOptions._traceSpan;

  if (childSpan) {
    childSpan.setTag('http.url', url).setTag('http.method', options.method || 'GET');
  }

  try {
    const response = await fetch(url, tracedOptions);

    if (childSpan) {
      childSpan.setTag('http.status_code', response.status).finish();
    }

    return response;
  } catch (error) {
    if (childSpan) {
      childSpan.setTag('error', true).log({ event: 'error', message: error.message }).finish();
    }
    throw error;
  }
};

/**
 * Crea un span manual para operaciones internas
 * @param {TraceContext} parentContext - Contexto padre
 * @param {string} operationName - Nombre de la operación
 * @param {Function} fn - Función a ejecutar
 * @returns {Promise<*>}
 */
const withSpan = async (parentContext, operationName, fn) => {
  if (!parentContext) {
    return fn(null);
  }

  const span = parentContext.createChild(operationName);

  try {
    const result = await fn(span);
    span.finish();
    return result;
  } catch (error) {
    span.setTag('error', true).log({ event: 'error', message: error.message }).finish();
    throw error;
  }
};

/**
 * Extractor de trace ID del request
 * @param {Object} req - Express request
 * @returns {string|null}
 */
const getTraceId = (req) => {
  return req?.traceId || req?.headers?.[TRACE_HEADERS.traceId] || null;
};

module.exports = {
  initTracer,
  TraceContext,
  tracingMiddleware,
  propagateTrace,
  tracedFetch,
  withSpan,
  getTraceId,
  generateId,
  generateTraceId,
  TRACE_HEADERS,
  DEFAULT_CONFIG,
};
