/**
 * Servicios compartidos de Flores Victoria
 * @module @flores-victoria/shared/services
 */

module.exports = {
  // Audit Service
  auditService: require('./auditService'),
  
  // Two Factor Authentication
  twoFactorService: require('./twoFactorService'),
  
  // Analytics Service
  analyticsService: require('./analyticsService'),
  
  // Order Tracking Service
  orderTrackingService: require('./orderTrackingService'),
};
