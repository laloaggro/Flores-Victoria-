/**
 * Jaeger Distributed Tracing Configuration
 * 
 * Configura OpenTelemetry con Jaeger para tracing distribuido
 * Permite rastrear requests a través de todos los microservicios
 */

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger-thrift');
const { BasicTracerProvider, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
const { RedisInstrumentation } = require('@opentelemetry/instrumentation-redis');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const logger = require('../utils/logger');

/**
 * Inicializar Jaeger Tracing
 * 
 * Debe ejecutarse ANTES de cualquier require de otros módulos
 * 
 * Uso en server.js:
 * const { initJaeger } = require('@flores-victoria/shared/tracing/jaeger');
 * initJaeger('auth-service');
 */
function initJaeger(serviceName) {
  try {
    // Configuración de Jaeger
    const jaegerHost = process.env.JAEGER_AGENT_HOST || 'localhost';
    const jaegerPort = parseInt(process.env.JAEGER_AGENT_PORT || '6831');
    
    logger.info(`🔍 Initializing Jaeger tracing for ${serviceName}`, {
      host: jaegerHost,
      port: jaegerPort
    });

    // Crear exporter
    const jaegerExporter = new JaegerExporter({
      serviceName: serviceName,
      endpoint: `http://${jaegerHost}:${jaegerPort}/api/traces`
    });

    // Crear resource
    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      })
    );

    // Crear tracer provider
    const tracerProvider = new BasicTracerProvider({ resource });
    tracerProvider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));

    // Registrar instrumentaciones
    registerInstrumentations({
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new PgInstrumentation(),
        new MongoDBInstrumentation(),
        new RedisInstrumentation()
      ]
    });

    logger.info('✅ Jaeger tracing initialized', {
      service: serviceName,
      tracerProvider: 'BasicTracerProvider',
      spanProcessor: 'BatchSpanProcessor'
    });

    return tracerProvider;
  } catch (error) {
    logger.error('❌ Failed to initialize Jaeger tracing', {
      error: error.message,
      stack: error.stack
    });
    
    // No fallar si Jaeger no está disponible
    logger.warn('⚠️  Continuing without distributed tracing');
    return null;
  }
}

/**
 * Middleware para añadir tracing info a logs
 */
function jaegerLoggingMiddleware(req, res, next) {
  // Obtener trace ID si está disponible
  const traceId = req.headers['x-trace-id'] || req.id;
  
  // Guardar en request para usar en logs
  req.traceId = traceId;
  
  // Propagar a responses
  res.setHeader('X-Trace-ID', traceId);
  
  next();
}

/**
 * Crear span para operaciones específicas
 */
function createSpan(tracer, name, attributes = {}) {
  if (!tracer) return null;
  
  const span = tracer.startSpan(name, {
    attributes: {
      'component': 'flores-victoria',
      ...attributes
    }
  });
  
  return span;
}

/**
 * Recordar evento en span
 */
function recordSpanEvent(span, eventName, attributes = {}) {
  if (!span) return;
  
  span.addEvent(eventName, attributes);
}

/**
 * Finalizar span con resultado
 */
function endSpan(span, status = 'ok', error = null) {
  if (!span) return;
  
  if (error) {
    span.recordException(error);
    span.setStatus({ code: 'ERROR', message: error.message });
  } else {
    span.setStatus({ code: 'OK', message: status });
  }
  
  span.end();
}

module.exports = {
  initJaeger,
  jaegerLoggingMiddleware,
  createSpan,
  recordSpanEvent,
  endSpan
};
