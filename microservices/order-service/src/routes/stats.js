/**
 * Order Service - Statistics Routes
 * Provides admin dashboard statistics for orders
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const logger = require('../logger.simple');

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     tags: [Orders]
 *     summary: Get order statistics for admin dashboard
 *     responses:
 *       200:
 *         description: Order statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Fechas para cálculos
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    // Total de pedidos
    const total = await Order.countDocuments();
    
    // Pedidos pendientes
    const pending = await Order.countDocuments({ 
      status: { $in: ['pending', 'confirmed', 'processing'] }
    });
    
    // Pedidos de hoy
    const today = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Ingresos mensuales
    const revenueAggregate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $nin: ['cancelled', 'refunded'] }
        }
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          avgValue: { $avg: '$total' }
        }
      }
    ]);

    const monthlyRevenue = revenueAggregate[0]?.monthlyRevenue || 0;
    const averageValue = Math.round(revenueAggregate[0]?.avgValue || 0);

    // Pedidos por estado
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Pedidos de la última semana por día
    const weeklyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calcular tendencia (comparar con semana anterior)
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const lastWeekOrders = await Order.countDocuments({
      createdAt: { $gte: twoWeeksAgo, $lt: startOfWeek }
    });
    
    const thisWeekOrders = await Order.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    let trend = 0;
    if (lastWeekOrders > 0) {
      trend = Math.round(((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100);
    }

    const stats = {
      total,
      pending,
      today,
      monthlyRevenue,
      averageValue,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      weeklyOrders,
      trend: `${trend >= 0 ? '+' : ''}${trend}%`,
      generated: new Date().toISOString()
    };

    logger.info({ stats: { total, pending, today } }, 'Order stats generated');
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error({ err: error }, 'Error generating order stats');
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de pedidos',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/orders/stats/detailed:
 *   get:
 *     tags: [Orders]
 *     summary: Get detailed order statistics
 *     responses:
 *       200:
 *         description: Detailed order statistics
 */
router.get('/stats/detailed', async (req, res) => {
  try {
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // Ingresos diarios últimos 30 días
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days },
          status: { $nin: ['cancelled', 'refunded'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Métodos de pago más usados
    const paymentMethods = await Order.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Pedidos por hora del día
    const ordersByHour = await Order.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        dailyRevenue,
        paymentMethods,
        ordersByHour,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error({ err: error }, 'Error generating detailed order stats');
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas detalladas',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/orders/recent:
 *   get:
 *     tags: [Orders]
 *     summary: Get recent orders for admin dashboard
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent orders list
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderNumber userId items total status createdAt paymentMethod');

    res.json({
      success: true,
      data: orders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        itemCount: order.items?.length || 0,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        date: order.createdAt
      }))
    });

  } catch (error) {
    logger.error({ err: error }, 'Error fetching recent orders');
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos recientes',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/orders/revenue:
 *   get:
 *     tags: [Orders]
 *     summary: Get revenue data for charts
 *     parameters:
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Revenue data by period
 */
router.get('/revenue', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const now = new Date();
    let startDate;
    let groupFormat;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        groupFormat = '%Y-%m-%d';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupFormat = '%Y-%m';
        break;
      case 'month':
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        groupFormat = '%Y-%m-%d';
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled', 'refunded'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: revenueData.map(item => ({
        date: item._id,
        revenue: item.revenue,
        orders: item.orders
      })),
      period,
      generated: new Date().toISOString()
    });

  } catch (error) {
    logger.error({ err: error }, 'Error fetching revenue data');
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de ingresos',
      error: error.message
    });
  }
});

module.exports = router;
