/**
 * Logger para Product Service
 * Usa el sistema de logging centralizado
 */

const { createLogger } = require('@flores-victoria/shared/logging/logger');

const logger = createLogger('product-service');

module.exports = logger;
