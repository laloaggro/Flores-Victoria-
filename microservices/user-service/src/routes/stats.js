/**
 * User Service - Statistics Routes
 * Provides admin dashboard statistics for users
 */

const express = require('express');
const router = express.Router();
const { client } = require('../config/database');
const logger = require('../logger.simple');

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     tags: [Users]
 *     summary: Get user statistics for admin dashboard
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Total de usuarios
    const totalResult = await client.query('SELECT COUNT(*) as total FROM users');
    const total = parseInt(totalResult.rows[0].total) || 0;

    // Usuarios activos (con actividad en últimos 30 días)
    const activeResult = await client.query(`
      SELECT COUNT(*) as active 
      FROM users 
      WHERE updated_at >= NOW() - INTERVAL '30 days'
    `);
    const active = parseInt(activeResult.rows[0].active) || 0;

    // Nuevos usuarios hoy
    const todayResult = await client.query(`
      SELECT COUNT(*) as new_today 
      FROM users 
      WHERE created_at >= CURRENT_DATE
    `);
    const newToday = parseInt(todayResult.rows[0].new_today) || 0;

    // Nuevos usuarios esta semana
    const weekResult = await client.query(`
      SELECT COUNT(*) as new_week 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const newWeek = parseInt(weekResult.rows[0].new_week) || 0;

    // Usuarios por rol
    const roleResult = await client.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    const byRole = roleResult.rows.reduce((acc, row) => {
      acc[row.role] = parseInt(row.count);
      return acc;
    }, {});

    // Tendencia (comparar semanas)
    const lastWeekResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '14 days' 
      AND created_at < NOW() - INTERVAL '7 days'
    `);
    const lastWeek = parseInt(lastWeekResult.rows[0].count) || 0;

    let trend = 0;
    if (lastWeek > 0) {
      trend = Math.round(((newWeek - lastWeek) / lastWeek) * 100);
    }

    const stats = {
      total,
      active,
      newToday,
      newWeek,
      byRole,
      trend: `${trend >= 0 ? '+' : ''}${trend}%`,
      generated: new Date().toISOString()
    };

    logger.info({ stats: { total, active, newToday } }, 'User stats generated');
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error({ err: error }, 'Error generating user stats');
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de usuarios',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users/recent:
 *   get:
 *     tags: [Users]
 *     summary: Get recently registered users for admin dashboard
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent users list
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await client.query(`
      SELECT id, name, email, role, created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: result.rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }))
    });

  } catch (error) {
    logger.error({ err: error }, 'Error fetching recent users');
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios recientes',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users/stats/growth:
 *   get:
 *     tags: [Users]
 *     summary: Get user growth data for charts
 *     parameters:
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: User growth by period
 */
router.get('/stats/growth', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    let interval;
    let groupFormat;

    switch (period) {
      case 'week':
        interval = "7 days";
        groupFormat = 'YYYY-MM-DD';
        break;
      case 'year':
        interval = "365 days";
        groupFormat = 'YYYY-MM';
        break;
      case 'month':
      default:
        interval = "30 days";
        groupFormat = 'YYYY-MM-DD';
    }

    const result = await client.query(`
      SELECT 
        TO_CHAR(created_at, $1) as date,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY TO_CHAR(created_at, $1)
      ORDER BY date
    `, [groupFormat]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      })),
      period,
      generated: new Date().toISOString()
    });

  } catch (error) {
    logger.error({ err: error }, 'Error fetching user growth data');
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de crecimiento',
      error: error.message
    });
  }
});

module.exports = router;
