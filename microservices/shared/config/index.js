/**
 * Configuraciones compartidas de Flores Victoria
 * @module @flores-victoria/shared/config
 */

const databasePool = require('./database-pool');

module.exports = {
  // Roles y permisos
  roles: require('./roles'),
  
  // Rate limits por rol
  rateLimits: require('./rate-limits-by-role'),
  
  // Whitelist de CORS
  corsWhitelist: require('./cors-whitelist'),
  
  // Zonas de entrega
  deliveryZones: require('./deliveryZones'),
  
  // Database pool configuration
  databasePool,
  postgresPoolConfig: databasePool.postgresPoolConfig,
  mongoPoolConfig: databasePool.mongoPoolConfig,
  redisPoolConfig: databasePool.redisPoolConfig,
  dbHealthChecks: databasePool.healthChecks,
};
