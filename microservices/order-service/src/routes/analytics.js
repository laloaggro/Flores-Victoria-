/**
 * @fileoverview Rutas de Analytics - Flores Victoria
 * API para reportes y métricas de negocio
 * 
 * Acceso: Solo admin y manager
 */

const express = require('express');
const router = express.Router();
const { AnalyticsService, TIME_PERIODS } = require('@flores-victoria/shared/services/analyticsService');

let analyticsService = null;

/**
 * Inicializa el servicio de analytics con la conexión a DB
 * @param {Object} db - Pool de conexión PostgreSQL
 */
function initializeAnalytics(db) {
  analyticsService = new AnalyticsService({ db });
}

// Middleware para verificar que el servicio está inicializado
const requireAnalytics = (req, res, next) => {
  if (!analyticsService) {
    return res.status(503).json({
      success: false,
      error: 'Servicio de analytics no inicializado',
    });
  }
  next();
};

// Middleware para verificar rol admin/manager
const requireManagerRole = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (!['admin', 'manager'].includes(role)) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador o gerente.',
    });
  }
  next();
};

// ═══════════════════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Dashboard completo de analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, yesterday, last_7_days, last_30_days, this_month, last_month, this_year]
 *           default: last_30_days
 *     responses:
 *       200:
 *         description: Dashboard de analytics
 */
router.get('/dashboard', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const dashboard = await analyticsService.getDashboard(period);
    
    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('[Analytics] Error getting dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo dashboard',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /analytics/sales/summary:
 *   get:
 *     summary: Resumen de ventas
 *     tags: [Analytics]
 */
router.get('/sales/summary', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const summary = await analyticsService.getSalesSummary(period);
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('[Analytics] Error getting sales summary:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo resumen de ventas',
    });
  }
});

/**
 * @swagger
 * /analytics/sales/by-day:
 *   get:
 *     summary: Ventas por día
 *     tags: [Analytics]
 */
router.get('/sales/by-day', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const salesByDay = await analyticsService.getSalesByDay(period);
    
    res.json({
      success: true,
      data: salesByDay,
    });
  } catch (error) {
    console.error('[Analytics] Error getting sales by day:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo ventas por día',
    });
  }
});

/**
 * @swagger
 * /analytics/sales/by-hour:
 *   get:
 *     summary: Ventas por hora (horarios pico)
 *     tags: [Analytics]
 */
router.get('/sales/by-hour', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_7_DAYS;
    const salesByHour = await analyticsService.getSalesByHour(period);
    
    res.json({
      success: true,
      data: salesByHour,
    });
  } catch (error) {
    console.error('[Analytics] Error getting sales by hour:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo ventas por hora',
    });
  }
});

/**
 * @swagger
 * /analytics/sales/comparison:
 *   get:
 *     summary: Comparación con período anterior
 *     tags: [Analytics]
 */
router.get('/sales/comparison', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const comparison = await analyticsService.getComparison(period);
    
    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error('[Analytics] Error getting comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo comparación',
    });
  }
});

/**
 * @swagger
 * /analytics/products/top:
 *   get:
 *     summary: Productos más vendidos
 *     tags: [Analytics]
 */
router.get('/products/top', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const limit = parseInt(req.query.limit) || 10;
    const topProducts = await analyticsService.getTopProducts(period, limit);
    
    res.json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error('[Analytics] Error getting top products:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos top',
    });
  }
});

/**
 * @swagger
 * /analytics/products/categories:
 *   get:
 *     summary: Ventas por categoría
 *     tags: [Analytics]
 */
router.get('/products/categories', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const topCategories = await analyticsService.getTopCategories(period);
    
    res.json({
      success: true,
      data: topCategories,
    });
  } catch (error) {
    console.error('[Analytics] Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categorías',
    });
  }
});

/**
 * @swagger
 * /analytics/delivery/zones:
 *   get:
 *     summary: Ventas por zona de entrega
 *     tags: [Analytics]
 */
router.get('/delivery/zones', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const salesByZone = await analyticsService.getSalesByDeliveryZone(period);
    
    res.json({
      success: true,
      data: salesByZone,
    });
  } catch (error) {
    console.error('[Analytics] Error getting delivery zones:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo zonas de entrega',
    });
  }
});

/**
 * @swagger
 * /analytics/customers/top:
 *   get:
 *     summary: Mejores clientes
 *     tags: [Analytics]
 */
router.get('/customers/top', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const limit = parseInt(req.query.limit) || 10;
    const topCustomers = await analyticsService.getTopCustomers(period, limit);
    
    res.json({
      success: true,
      data: topCustomers,
    });
  } catch (error) {
    console.error('[Analytics] Error getting top customers:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo clientes top',
    });
  }
});

/**
 * @swagger
 * /analytics/customers/segments:
 *   get:
 *     summary: Segmentos de clientes (nuevos vs recurrentes)
 *     tags: [Analytics]
 */
router.get('/customers/segments', requireAnalytics, requireManagerRole, async (req, res) => {
  try {
    const period = req.query.period || TIME_PERIODS.LAST_30_DAYS;
    const segments = await analyticsService.getCustomerSegments(period);
    
    res.json({
      success: true,
      data: segments,
    });
  } catch (error) {
    console.error('[Analytics] Error getting customer segments:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo segmentos',
    });
  }
});

/**
 * @swagger
 * /analytics/periods:
 *   get:
 *     summary: Lista de períodos disponibles
 *     tags: [Analytics]
 */
router.get('/periods', (req, res) => {
  res.json({
    success: true,
    data: Object.entries(TIME_PERIODS).map(([key, value]) => ({
      id: value,
      name: key.replace(/_/g, ' ').toLowerCase(),
    })),
  });
});

module.exports = router;
module.exports.initializeAnalytics = initializeAnalytics;
