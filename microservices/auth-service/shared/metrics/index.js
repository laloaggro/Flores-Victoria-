const client = require('prom-client');

// Crear un Registry que registra las métricas
const register = new client.Registry();

// Añadir métricas predeterminadas
client.collectDefaultMetrics({ register });

// Crear métricas personalizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
});

const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users',
});

const totalProducts = new client.Gauge({
  name: 'product_count',
  help: 'Total number of products',
});

const userCount = new client.Gauge({
  name: 'user_count',
  help: 'Total number of users',
});

// Registrar todas las métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeUsers);
register.registerMetric(totalProducts);
register.registerMetric(userCount);

module.exports = {
  register,
  httpRequestDuration,
  httpRequestTotal,
  activeUsers,
  totalProducts,
  userCount,
};
