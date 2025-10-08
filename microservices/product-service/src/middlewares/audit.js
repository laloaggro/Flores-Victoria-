const axios = require('axios');
const { createLogger } = require('../../../logging/logger');

const logger = createLogger('audit-middleware');

// Configuración del servicio de auditoría
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://localhost:3005';

/**
 * Middleware para registrar eventos de auditoría
 * @param {string} action - Acción realizada
 * @param {string} resourceType - Tipo de recurso
 * @param {function} getDetails - Función para obtener detalles adicionales
 */
const auditMiddleware = (action, resourceType, getDetails = () => ({})) => {
  return async (req, res, next) => {
    try {
      // Capturar la respuesta original
      const originalSend = res.send;
      
      // Variables para almacenar información de la solicitud
      let responseBody = null;
      
      // Interceptando la función send para capturar el cuerpo de la respuesta
      res.send = function(data) {
        responseBody = data;
        return originalSend.call(this, data);
      };
      
      // Registrar el evento de auditoría después de que se complete la solicitud
      res.on('finish', async () => {
        try {
          // Obtener información de la solicitud
          const auditEvent = {
            timestamp: new Date(),
            service: 'product-service',
            action: action,
            userId: req.headers['x-user-id'] || 'unknown',
            resourceId: req.params.id || null,
            resourceType: resourceType,
            details: {
              ...getDetails(req, res),
              method: req.method,
              url: req.url,
              statusCode: res.statusCode,
              responseBody: responseBody
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
          };
          
          // Enviar evento de auditoría al servicio de auditoría
          await axios.post(`${AUDIT_SERVICE_URL}/audit`, auditEvent);
          logger.info('Evento de auditoría registrado', { 
            action: action, 
            resourceId: auditEvent.resourceId 
          });
        } catch (error) {
          logger.error('Error al registrar evento de auditoría:', error.message);
        }
      });
      
      // Continuar con la ejecución
      next();
    } catch (error) {
      logger.error('Error en middleware de auditoría:', error);
      next();
    }
  };
};

module.exports = auditMiddleware;