/**
 * Configuraciones compartidas de Flores Victoria
 * @module @flores-victoria/shared/config
 */

module.exports = {
  // Roles y permisos
  roles: require('./roles'),
  
  // Rate limits por rol
  rateLimits: require('./rate-limits-by-role'),
  
  // Whitelist de CORS
  corsWhitelist: require('./cors-whitelist'),
  
  // Zonas de entrega
  deliveryZones: require('./deliveryZones'),
};
