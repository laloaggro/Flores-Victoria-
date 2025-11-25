/**
 * @flores-victoria/shared
 * Módulo compartido para microservicios
 *
 * Exporta todos los componentes reutilizables
 */

module.exports = {
  // Logging
  logger: require('./logging/logger'),

  // Error handling
  errors: require('./errors'),

  // Middleware
  middleware: require('./middleware'),

  // Health checks
  health: require('./health'),

  // Metrics
  metrics: require('./metrics'),

  // Tracing
  tracing: require('./tracing'),

  // Security
  security: require('./security'),

  // Cache
  cache: require('./cache'),
};
