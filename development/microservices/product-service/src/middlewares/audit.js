const axios = require('axios');
const { createLogger } = require('/shared/logging/logger');

// Configuración del servicio de auditoría
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://localhost:3005';

/**
 * Middleware para registrar eventos de auditoría
 * @param {string} action - Acción realizada
 * @param {string} resource - Recurso afectado
 * @param {function} dataExtractor - Función para extraer datos de la solicitud/respuesta
 * @param {Object} customLogger - Logger personalizado
 */
function auditMiddleware(action, resource, dataExtractor, customLogger) {
  return async (req, res, next) => {
    try {
      // Registrar evento de auditoría
      const auditEvent = {
        timestamp: new Date().toISOString(),
        userId: req.user ? req.user.id : null,
        action,
        resource,
        resourceId: req.params.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        data: dataExtractor ? dataExtractor(req, res) : {},
      };

      // Enviar evento al servicio de auditoría
      await axios.post(`${AUDIT_SERVICE_URL}/events`, auditEvent);

      customLogger.info(`Evento de auditoría registrado: ${action} en ${resource}`, {
        action,
        resource,
        userId: auditEvent.userId,
      });
    } catch (error) {
      customLogger.error('Error al registrar evento de auditoría:', error);
    } finally {
      next();
    }
  };
}

module.exports = auditMiddleware;
