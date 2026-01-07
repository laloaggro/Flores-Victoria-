/**
 * Review Service - Statistics Routes
 * Provides admin dashboard statistics for reviews
 */

const express = require('express');
const router = express.Router();
const logger = require('../logger.simple');

// Base de datos (se inyecta desde app.js)
let db = null;
let reviewsCollection = null;

const setDatabase = (database) => {
  db = database;
  reviewsCollection = db.collection('reviews');
};

/**
 * @swagger
 * /api/reviews/stats:
 *   get:
 *     tags: [Reviews]
 *     summary: Get review statistics for admin dashboard
 *     responses:
 *       200:
 *         description: Review statistics
 */
router.get('/stats', async (req, res) => {
  try {
    if (!reviewsCollection) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos no disponible'
      });
    }

    // Total de reseñas
    const total = await reviewsCollection.countDocuments();

    // Reseñas pendientes de moderación (si hay campo pending/status)
    const pending = await reviewsCollection.countDocuments({ 
      $or: [
        { status: 'pending' },
        { moderated: false }
      ]
    });

    // Promedio general de rating
    const ratingAggregate = await reviewsCollection.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]).toArray();

    const averageRating = ratingAggregate[0]?.averageRating 
      ? Math.round(ratingAggregate[0].averageRating * 10) / 10 
      : 0;

    // Distribución por rating
    const ratingDistribution = await reviewsCollection.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]).toArray();

    // Reseñas de hoy
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const todayCount = await reviewsCollection.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Reseñas esta semana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    
    const weekCount = await reviewsCollection.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Tendencia
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const lastWeekCount = await reviewsCollection.countDocuments({
      createdAt: { $gte: twoWeeksAgo, $lt: startOfWeek }
    });

    let trend = 0;
    if (lastWeekCount > 0) {
      trend = Math.round(((weekCount - lastWeekCount) / lastWeekCount) * 100);
    }

    const stats = {
      total,
      pending,
      averageRating,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      todayCount,
      weekCount,
      trend: `${trend >= 0 ? '+' : ''}${trend}%`,
      generated: new Date().toISOString()
    };

    logger.info({ stats: { total, averageRating, pending } }, 'Review stats generated');
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error({ err: error }, 'Error generating review stats');
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de reseñas',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/reviews/recent:
 *   get:
 *     tags: [Reviews]
 *     summary: Get recent reviews for admin dashboard
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent reviews list
 */
router.get('/recent', async (req, res) => {
  try {
    if (!reviewsCollection) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos no disponible'
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    const reviews = await reviewsCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .project({
        productId: 1,
        userId: 1,
        rating: 1,
        comment: 1,
        createdAt: 1,
        verified: 1
      })
      .toArray();

    res.json({
      success: true,
      data: reviews.map(review => ({
        id: review._id,
        productId: review.productId,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment?.substring(0, 100) + (review.comment?.length > 100 ? '...' : ''),
        createdAt: review.createdAt,
        verified: review.verified || false
      }))
    });

  } catch (error) {
    logger.error({ err: error }, 'Error fetching recent reviews');
    res.status(500).json({
      success: false,
      message: 'Error al obtener reseñas recientes',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/reviews/top-products:
 *   get:
 *     tags: [Reviews]
 *     summary: Get top rated products based on reviews
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top rated products
 */
router.get('/top-products', async (req, res) => {
  try {
    if (!reviewsCollection) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos no disponible'
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    const topProducts = await reviewsCollection.aggregate([
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      {
        $match: {
          reviewCount: { $gte: 1 } // Al menos 1 reseña
        }
      },
      {
        $sort: { averageRating: -1, reviewCount: -1 }
      },
      {
        $limit: limit
      }
    ]).toArray();

    res.json({
      success: true,
      data: topProducts.map(product => ({
        productId: product._id,
        averageRating: Math.round(product.averageRating * 10) / 10,
        reviewCount: product.reviewCount
      }))
    });

  } catch (error) {
    logger.error({ err: error }, 'Error fetching top products');
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos mejor valorados',
      error: error.message
    });
  }
});

module.exports = { router, setDatabase };
