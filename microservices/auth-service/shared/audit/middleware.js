/**
 * Middleware de auditoría para microservicios
 * @param {string} action - Acción realizada
 * @param {string} resourceType - Tipo de recurso afectado
 * @param {function} getDetails - Función para obtener detalles adicionales
 * @returns {function} Middleware de Express
 */
function auditMiddleware(action, resourceType, getDetails) {
  return async (req, res, next) => {
    try {
      // Registrar información de auditoría
      const auditInfo = {
        timestamp: new Date().toISOString(),
        action,
        resourceType,
        userId: req.headers['x-user-id'] || 'unknown',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl,
        details: getDetails ? getDetails(req, res) : {},
      };

      // En un entorno real, esto se enviaría a un servicio de auditoría
      console.log('Audit Log:', JSON.stringify(auditInfo));

      // Si hay un servicio de auditoría, enviar la información
      // await auditService.log(auditInfo);

      next();
    } catch (error) {
      console.error('Error en middleware de auditoría:', error);
      // No detener la solicitud por errores en la auditoría
      next();
    }
  };
}

module.exports = {
  auditMiddleware,
};
