/**
 * Controlador para el dashboard de administración
 */
const { logger } = require('@flores-victoria/shared/utils/logger');
const serviceMonitor = require('../services/serviceMonitor');

/**
 * Obtiene el dashboard completo con el estado de todos los servicios
 */
exports.getDashboard = async (req, res) => {
  try {
    const healthStatus = await serviceMonitor.checkAllServices();

    const dashboard = {
      platform: {
        name: 'Flores Victoria',
        environment: process.env.NODE_ENV || 'development',
        version: '3.0.0',
      },
      summary: healthStatus.summary,
      services: healthStatus.services,
      timestamp: new Date().toISOString(),
    };

    res.json(dashboard);
  } catch (error) {
    logger.error('Error getting dashboard', { error: error.message });
    res.status(500).json({
      error: true,
      message: 'Error al obtener el dashboard',
    });
  }
};

/**
 * Obtiene solo el resumen de salud del sistema
 */
exports.getHealthSummary = async (req, res) => {
  try {
    const { summary } = await serviceMonitor.checkAllServices();
    res.json(summary);
  } catch (error) {
    logger.error('Error getting health summary', { error: error.message });
    res.status(500).json({
      error: true,
      message: 'Error al obtener el resumen de salud',
    });
  }
};

/**
 * Obtiene el estado detallado de un servicio específico
 */
exports.getServiceStatus = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const metrics = await serviceMonitor.getServiceMetrics(serviceName);
    res.json(metrics);
  } catch (error) {
    logger.error('Error getting service status', {
      service: req.params.serviceName,
      error: error.message,
    });
    res.status(404).json({
      error: true,
      message: error.message,
    });
  }
};

/**
 * Lista todos los servicios configurados
 */
exports.listServices = (req, res) => {
  try {
    const services = serviceMonitor.getServicesList();
    res.json({
      total: services.length,
      services,
    });
  } catch (error) {
    logger.error('Error listing services', { error: error.message });
    res.status(500).json({
      error: true,
      message: 'Error al listar servicios',
    });
  }
};

/**
 * Ejecuta health check en todos los servicios
 */
exports.runHealthCheck = async (req, res) => {
  try {
    const results = await serviceMonitor.checkAllServices();
    res.json(results);
  } catch (error) {
    logger.error('Error running health check', { error: error.message });
    res.status(500).json({
      error: true,
      message: 'Error al ejecutar health check',
    });
  }
};

/**
 * Obtiene los logs de un servicio específico
 */
exports.getServiceLogs = async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { lines = 100, filter = '' } = req.query;

    logger.info('Getting logs for service', { serviceName, lines, filter });

    const logs = await serviceMonitor.getServiceLogs(serviceName, {
      lines: parseInt(lines, 10),
      filter,
    });

    res.json({
      serviceName,
      lines: logs.length,
      logs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error getting service logs', {
      service: req.params.serviceName,
      error: error.message,
    });
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
