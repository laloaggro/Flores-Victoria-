/**
 * Rutas del dashboard de administración
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @route   GET /api/dashboard
 * @desc    Obtiene el dashboard completo con todos los servicios
 * @access  Public (agregar auth en producción)
 */
router.get('/', dashboardController.getDashboard);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Obtiene solo el resumen de salud
 * @access  Public
 */
router.get('/summary', dashboardController.getHealthSummary);

/**
 * @route   GET /api/dashboard/services
 * @desc    Lista todos los servicios configurados
 * @access  Public
 */
router.get('/services', dashboardController.listServices);

/**
 * @route   GET /api/dashboard/services/:serviceName
 * @desc    Obtiene métricas detalladas de un servicio
 * @access  Public
 */
router.get('/services/:serviceName', dashboardController.getServiceStatus);

/**
 * @route   POST /api/dashboard/healthcheck
 * @desc    Ejecuta health check en todos los servicios
 * @access  Public
 */
router.post('/healthcheck', dashboardController.runHealthCheck);

module.exports = router;
