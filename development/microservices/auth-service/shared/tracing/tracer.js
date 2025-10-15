const tracer = require('@opentelemetry/sdk-node').NodeSDK;
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// Usar importación dinámica para uuid
let uuidv4;

async function initializeUuid() {
  if (!uuidv4) {
    const { v4 } = await import('uuid');
    uuidv4 = v4;
  }
}

// Inicializar uuid
initializeUuid().catch(console.error);

const sdk = new tracer({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces'
  }),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();

// Clase Tracer adaptada para usar uuidv4 desde import dinámico
class Tracer {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  /**
   * Crear un nuevo trace context
   * @returns {object} Trace context
   */
  createTraceContext() {
    // Esperar a que uuidv4 esté disponible
    if (!uuidv4) {
      throw new Error('UUID no está disponible todavía');
    }
    
    return {
      traceId: uuidv4(),
      spanId: uuidv4(),
      parentId: null,
      serviceName: this.serviceName,
      startTime: Date.now()
    };
  }

  /**
   * Crear un nuevo span
   * @param {object} parentContext - Contexto padre
   * @param {string} operationName - Nombre de la operación
   * @returns {object} Nuevo span context
   */
  createSpan(parentContext, operationName) {
    // Esperar a que uuidv4 esté disponible
    if (!uuidv4) {
      throw new Error('UUID no está disponible todavía');
    }
    
    return {
      traceId: parentContext.traceId,
      spanId: uuidv4(),
      parentId: parentContext.spanId,
      serviceName: this.serviceName,
      operationName,
      startTime: Date.now()
    };
  }

  /**
   * Finalizar un span
   * @param {object} spanContext - Contexto del span
   * @returns {object} Información del span completado
   */
  finishSpan(spanContext) {
    const endTime = Date.now();
    const duration = endTime - spanContext.startTime;
    
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      parentId: spanContext.parentId,
      serviceName: spanContext.serviceName,
      operationName: spanContext.operationName,
      startTime: spanContext.startTime,
      endTime,
      duration
    };
  }

  /**
   * Inyectar contexto de trace en headers
   * @param {object} traceContext - Contexto de trace
   * @returns {object} Headers con contexto de trace
   */
  injectTraceContext(traceContext) {
    return {
      'x-trace-id': traceContext.traceId,
      'x-span-id': traceContext.spanId,
      'x-parent-id': traceContext.parentId,
      'x-service-name': traceContext.serviceName
    };
  }

  /**
   * Extraer contexto de trace de headers
   * @param {object} headers - Headers de la solicitud
   * @returns {object|null} Contexto de trace o null
   */
  extractTraceContext(headers) {
    if (headers['x-trace-id']) {
      return {
        traceId: headers['x-trace-id'],
        spanId: headers['x-span-id'],
        parentId: headers['x-parent-id'],
        serviceName: headers['x-service-name'],
        startTime: Date.now()
      };
    }
    
    return null;
  }
}

module.exports = { sdk, Tracer, getUuidv4: () => uuidv4 };