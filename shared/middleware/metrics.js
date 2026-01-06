/**
 * Sistema avanzado de Métricas con Prometheus
 *
 * Características:
 * - Métricas HTTP (requests, duration, active)
 * - Métricas de negocio personalizadas
 * - Métricas de rate limiting
 * - Métricas de errores
 * - Integración con middleware stack existente
 * - Registry compartido por servicio
 */

const client = require('prom-client');

// Registry global por servicio
let serviceRegistry = null;
let serviceName = 'unknown';

/**
 * Inicializar sistema de métricas para un servicio
 * @param {string} name - Nombre del servicio
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Registry y métricas
 */
function initMetrics(name, options = {}) {
  serviceName = name;

  const { collectDefaultMetrics = true, defaultMetricsInterval = 10000 } = options;

  // Crear registry
  serviceRegistry = new client.Registry();

  // Agregar label por defecto con el nombre del servicio
  serviceRegistry.setDefaultLabels({
    service: serviceName,
  });

  // Recopilar métricas por defecto (CPU, memoria, etc.)
  if (collectDefaultMetrics) {
    client.collectDefaultMetrics({
      register: serviceRegistry,
      timeout: defaultMetricsInterval,
    });
  }

  return {
    registry: serviceRegistry,
    metrics: createMetrics(serviceRegistry),
  };
}

/**
 * Crear métricas estándar
 * @param {Object} registry - Registry de Prometheus
 * @returns {Object} - Objeto con todas las métricas
 */
function createMetrics(registry) {
  // Limpiar todas las métricas para evitar re-registro en development
  registry.clear();

  // ═══════════════════════════════════════════════════════════════
  // HTTP METRICS
  // ═══════════════════════════════════════════════════════════════

  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duración de requests HTTP en segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [registry],
  });

  const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total de requests HTTP',
    labelNames: ['method', 'route', 'status_code'],
    registers: [registry],
  });

  const httpRequestsActive = new client.Gauge({
    name: 'http_requests_active',
    help: 'Número de requests HTTP activos',
    labelNames: ['method'],
    registers: [registry],
  });

  const httpRequestSize = new client.Histogram({
    name: 'http_request_size_bytes',
    help: 'Tamaño de request HTTP en bytes',
    labelNames: ['method', 'route'],
    buckets: [100, 1000, 10000, 100000, 1000000],
    registers: [registry],
  });

  const httpResponseSize = new client.Histogram({
    name: 'http_response_size_bytes',
    help: 'Tamaño de response HTTP en bytes',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [100, 1000, 10000, 100000, 1000000],
    registers: [registry],
  });

  // ═══════════════════════════════════════════════════════════════
  // ERROR METRICS
  // ═══════════════════════════════════════════════════════════════

  const errorsTotal = new client.Counter({
    name: 'errors_total',
    help: 'Total de errores por tipo',
    labelNames: ['type', 'status_code', 'route'],
    registers: [registry],
  });

  const validationErrorsTotal = new client.Counter({
    name: 'validation_errors_total',
    help: 'Total de errores de validación',
    labelNames: ['source', 'field'],
    registers: [registry],
  });

  // ═══════════════════════════════════════════════════════════════
  // RATE LIMITING METRICS
  // ═══════════════════════════════════════════════════════════════

  const rateLimitHitsTotal = new client.Counter({
    name: 'rate_limit_hits_total',
    help: 'Total de requests que pasaron rate limiting',
    labelNames: ['scope', 'identifier_type'],
    registers: [registry],
  });

  const rateLimitBlocksTotal = new client.Counter({
    name: 'rate_limit_blocks_total',
    help: 'Total de requests bloqueados por rate limiting',
    labelNames: ['scope', 'identifier_type'],
    registers: [registry],
  });

  const rateLimitBypassTotal = new client.Counter({
    name: 'rate_limit_bypass_total',
    help: 'Total de requests con bypass de rate limiting',
    labelNames: ['reason'],
    registers: [registry],
  });

  // ═══════════════════════════════════════════════════════════════
  // DATABASE METRICS
  // ═══════════════════════════════════════════════════════════════

  const dbQueryDuration = new client.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duración de queries a base de datos',
    labelNames: ['operation', 'collection'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    registers: [registry],
  });

  const dbConnectionsActive = new client.Gauge({
    name: 'db_connections_active',
    help: 'Número de conexiones activas a base de datos',
    labelNames: ['type'],
    registers: [registry],
  });

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS METRICS (Ejemplos personalizables)
  // ═══════════════════════════════════════════════════════════════

  const businessOperationsTotal = new client.Counter({
    name: 'business_operations_total',
    help: 'Total de operaciones de negocio',
    labelNames: ['operation', 'status'],
    registers: [registry],
  });

  const businessOperationDuration = new client.Histogram({
    name: 'business_operation_duration_seconds',
    help: 'Duración de operaciones de negocio',
    labelNames: ['operation'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [registry],
  });

  return {
    // HTTP
    httpRequestDuration,
    httpRequestTotal,
    httpRequestsActive,
    httpRequestSize,
    httpResponseSize,

    // Errors
    errorsTotal,
    validationErrorsTotal,

    // Rate Limiting
    rateLimitHitsTotal,
    rateLimitBlocksTotal,
    rateLimitBypassTotal,

    // Database
    dbQueryDuration,
    dbConnectionsActive,

    // Business
    businessOperationsTotal,
    businessOperationDuration,
  };
}

/**
 * Middleware principal de métricas HTTP
 * Debe colocarse al inicio del middleware stack
 */
function metricsMiddleware() {
  if (!serviceRegistry) {
    throw new Error('Metrics not initialized. Call initMetrics() first.');
  }

  const metrics = createMetrics(serviceRegistry);

  return (req, res, next) => {
    const startTime = process.hrtime.bigint();
    const method = req.method;

    // Incrementar requests activos
    metrics.httpRequestsActive.inc({ method });

    // Medir tamaño de request
    const reqSize = Number.parseInt(req.headers['content-length'], 10) || 0;

    // Registrar cuando la respuesta termina
    res.on('finish', () => {
      // Decrementar requests activos
      metrics.httpRequestsActive.dec({ method });

      // Calcular duración
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e9; // Convertir a segundos

      // Obtener route (usa req.route.path si está disponible, sino req.path)
      const route = req.route?.path || req.path || 'unknown';
      const statusCode = res.statusCode;

      // Registrar métricas
      metrics.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);

      metrics.httpRequestTotal.inc({
        method,
        route,
        status_code: statusCode,
      });

      // Tamaño de request
      if (reqSize > 0) {
        metrics.httpRequestSize.observe({ method, route }, reqSize);
      }

      // Tamaño de response
      const resSize = Number.parseInt(res.getHeader('content-length'), 10) || 0;
      if (resSize > 0) {
        metrics.httpResponseSize.observe({ method, route, status_code: statusCode }, resSize);
      }

      // Registrar errores (4xx, 5xx)
      if (statusCode >= 400) {
        const errorType = statusCode >= 500 ? 'server_error' : 'client_error';
        metrics.errorsTotal.inc({
          type: errorType,
          status_code: statusCode,
          route,
        });
      }
    });

    next();
  };
}

/**
 * Endpoint para exponer métricas
 * @returns {Function} - Express handler
 */
function metricsEndpoint() {
  return async (req, res) => {
    if (!serviceRegistry) {
      return res.status(500).json({ error: 'Metrics not initialized' });
    }

    try {
      res.set('Content-Type', serviceRegistry.contentType);
      const metrics = await serviceRegistry.metrics();
      res.end(metrics);
    } catch (err) {
      res.status(500).end(err.message);
    }
  };
}

/**
 * Helpers para métricas de negocio
 */
class MetricsHelper {
  constructor(metrics) {
    this.metrics = metrics;
  }

  /**
   * Medir duración de una operación de negocio
   * @param {string} operation - Nombre de la operación
   * @param {Function} fn - Función a ejecutar
   * @returns {Promise} - Resultado de la función
   */
  async measureOperation(operation, fn) {
    const startTime = process.hrtime.bigint();
    let status = 'success';

    try {
      const result = await fn();
      return result;
    } catch (err) {
      status = 'error';
      throw err;
    } finally {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e9;

      this.metrics.businessOperationDuration.observe({ operation }, duration);
      this.metrics.businessOperationsTotal.inc({ operation, status });
    }
  }

  /**
   * Incrementar contador de operación
   * @param {string} operation - Nombre de la operación
   * @param {string} status - Estado (success/error)
   */
  recordOperation(operation, status = 'success') {
    this.metrics.businessOperationsTotal.inc({ operation, status });
  }

  /**
   * Medir query de base de datos
   * @param {string} operation - Tipo de operación (find, create, update, delete)
   * @param {string} collection - Nombre de la colección
   * @param {Function} fn - Función de query
   * @returns {Promise} - Resultado del query
   */
  async measureDbQuery(operation, collection, fn) {
    const startTime = process.hrtime.bigint();

    try {
      return await fn();
    } finally {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e9;

      this.metrics.dbQueryDuration.observe({ operation, collection }, duration);
    }
  }

  /**
   * Registrar error de validación
   * @param {string} source - Fuente (body, query, params, headers)
   * @param {string} field - Campo con error
   */
  recordValidationError(source, field) {
    this.metrics.validationErrorsTotal.inc({ source, field });
  }

  /**
   * Registrar hit de rate limiting
   * @param {string} scope - Scope (user, ip, endpoint)
   * @param {string} identifierType - Tipo (userId, ip)
   */
  recordRateLimitHit(scope, identifierType) {
    this.metrics.rateLimitHitsTotal.inc({ scope, identifier_type: identifierType });
  }

  /**
   * Registrar bloqueo por rate limiting
   * @param {string} scope - Scope (user, ip, endpoint)
   * @param {string} identifierType - Tipo (userId, ip)
   */
  recordRateLimitBlock(scope, identifierType) {
    this.metrics.rateLimitBlocksTotal.inc({ scope, identifier_type: identifierType });
  }

  /**
   * Registrar bypass de rate limiting
   * @param {string} reason - Razón (admin, api_key, health_check)
   */
  recordRateLimitBypass(reason) {
    this.metrics.rateLimitBypassTotal.inc({ reason });
  }

  /**
   * Actualizar gauge de conexiones de BD
   * @param {number} count - Número de conexiones
   * @param {string} type - Tipo de BD (mongodb, redis, postgres)
   */
  setDbConnections(count, type) {
    this.metrics.dbConnectionsActive.set({ type }, count);
  }
}

/**
 * Obtener helper de métricas
 * @returns {MetricsHelper} - Helper con métodos de métricas
 */
function getMetricsHelper() {
  if (!serviceRegistry) {
    throw new Error('Metrics not initialized. Call initMetrics() first.');
  }
  const metrics = createMetrics(serviceRegistry);
  return new MetricsHelper(metrics);
}

module.exports = {
  // Inicialización
  initMetrics,

  // Middleware
  metricsMiddleware,
  metricsEndpoint,

  // Helpers
  getMetricsHelper,
  MetricsHelper,

  // Acceso directo a registry y client
  getRegistry: () => serviceRegistry,
  client,
};
