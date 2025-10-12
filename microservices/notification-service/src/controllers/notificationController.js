// Controlador de Notificaciones
const EmailService = require('../services/emailService');
const logger = require('../utils/logger');

const emailService = new EmailService();

class NotificationController {
  // Enviar notificación por email
  async sendEmailNotification(req, res) {
    try {
      const { to, subject, html, text } = req.body;

      // Validar datos requeridos
      if (!to || !subject) {
        return res.status(400).json({
          status: 'fail',
          message: 'Los campos "to" y "subject" son requeridos'
        });
      }

      // Enviar email
      const result = await emailService.sendEmail(to, subject, html, text);

      if (result.success) {
        res.status(200).json({
          status: 'success',
          message: 'Notificación enviada exitosamente',
          data: {
            messageId: result.messageId
          }
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Error al enviar la notificación',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error in sendEmailNotification', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar estado del servicio
  async healthCheck(req, res) {
    try {
      const emailConnection = await emailService.verifyConnection();
      
      res.status(200).json({
        status: 'success',
        data: {
          service: 'notification-service',
          email: emailConnection ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error in healthCheck', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Error verificando el estado del servicio'
      });
    }
  }
}

module.exports = new NotificationController();