const axios = require('axios');

const { logger } = require('../middleware/logger');

/**
 * Proxy para enrutar solicitudes a microservicios
 */
class ServiceProxy {
  /**
   * Enrutar solicitud a un microservicio
   * @param {string} serviceUrl - URL del microservicio
   * @param {object} req - Objeto de solicitud Express
   * @param {object} res - Objeto de respuesta Express
   */
  static async routeToService(serviceUrl, req, res) {
    try {
      // Registrar la solicitud para fines de depuración
      logger.info(`Enviando solicitud a: ${serviceUrl}${req.url}`, {
        method: req.method,
        headers: {
          ...req.headers,
          host: undefined, // Eliminar el header host para evitar conflictos
        },
        body: req.body,
        query: req.query,
      });

      // Configurar opciones para la solicitud
      const options = {
        method: req.method,
        url: `${serviceUrl}${req.url}`,
        headers: {
          ...req.headers,
          host: undefined, // Eliminar el header host para evitar conflictos
        },
        data: req.body,
        params: req.query,
      };

      // Realizar la solicitud al microservicio
      const response = await axios(options);

      // Enviar la respuesta del microservicio al cliente
      res.status(response.status).json(response.data);
    } catch (error) {
      logger.error('Error en proxy a microservicio:', {
        serviceUrl,
        targetUrl: `${serviceUrl}${req.url}`,
        error: error.message,
        stack: error.stack,
      });

      // Manejar errores de conexión
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          status: 'error',
          message: 'Servicio temporalmente no disponible',
        });
      }

      // Manejar errores de respuesta
      if (error.response) {
        // Si el servicio responde con 404, devolvemos el mismo error
        if (error.response.status === 404) {
          return res.status(404).json({
            status: 'fail',
            message: 'Ruta no encontrada',
          });
        }
        return res.status(error.response.status).json(error.response.data);
      }

      // Error genérico
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  }
}

module.exports = ServiceProxy;
