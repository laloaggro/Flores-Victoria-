/**
 * Módulo de métricas simplificado para servicios ligeros
 * Compatible con Prometheus
 */

// Contadores en memoria (sin dependencia de prom-client)
const metrics = {
  httpRequestsTotal: {},
  httpRequestDuration: [],
  serviceInfo: {
    version: '1.0.0',
    startTime: Date.now(),
  },
};

/**
 * Middleware para registrar métricas de requests
 */
const metricsMiddleware = (serviceName) => (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const key = `${req.method}_${req.path}_${res.statusCode}`;

    // Incrementar contador
    metrics.httpRequestsTotal[key] = (metrics.httpRequestsTotal[key] || 0) + 1;

    // Registrar duración (mantener últimas 1000)
    metrics.httpRequestDuration.push({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      timestamp: Date.now(),
    });

    if (metrics.httpRequestDuration.length > 1000) {
      metrics.httpRequestDuration.shift();
    }
  });

  next();
};

/**
 * Endpoint /metrics en formato Prometheus
 */
const metricsEndpoint = (serviceName) => (req, res) => {
  const uptime = (Date.now() - metrics.serviceInfo.startTime) / 1000;

  let output = `# HELP service_info Service information
# TYPE service_info gauge
service_info{service="${serviceName}",version="${metrics.serviceInfo.version}"} 1

# HELP service_uptime_seconds Service uptime in seconds
# TYPE service_uptime_seconds gauge
service_uptime_seconds{service="${serviceName}"} ${uptime}

# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
`;

  // Añadir contadores de requests
  for (const [key, count] of Object.entries(metrics.httpRequestsTotal)) {
    const [method, path, status] = key.split('_');
    output += `http_requests_total{service="${serviceName}",method="${method}",path="${path || '/'}",status="${status}"} ${count}\n`;
  }

  // Calcular duración promedio
  if (metrics.httpRequestDuration.length > 0) {
    const avgDuration =
      metrics.httpRequestDuration.reduce((sum, r) => sum + r.duration, 0) /
      metrics.httpRequestDuration.length;

    output += `
# HELP http_request_duration_ms_avg Average HTTP request duration in milliseconds
# TYPE http_request_duration_ms_avg gauge
http_request_duration_ms_avg{service="${serviceName}"} ${avgDuration.toFixed(2)}
`;
  }

  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(output);
};

/**
 * Obtener métricas en formato JSON (para debugging)
 */
const getMetricsJson = () => ({
  ...metrics,
  uptime: (Date.now() - metrics.serviceInfo.startTime) / 1000,
});

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  getMetricsJson,
};
