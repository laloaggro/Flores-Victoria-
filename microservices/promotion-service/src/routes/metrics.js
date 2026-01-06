/**
 * Engagement Metrics Routes - Flores Victoria
 * API endpoints para métricas de engagement (cupones, fidelización, reseñas, notificaciones)
 */

const express = require('express');
const router = express.Router();
const { EngagementMetricsService } = require('../services/engagement-metrics.service');

const metricsService = new EngagementMetricsService();

// ============================================================================
// MÉTRICAS GENERALES
// ============================================================================

/**
 * GET /api/metrics/engagement/summary
 * Resumen completo de todas las métricas de engagement
 */
router.get('/summary', async (req, res) => {
    try {
        const summary = await metricsService.getEngagementSummary();
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error obteniendo resumen de engagement:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métricas',
            message: error.message
        });
    }
});

/**
 * GET /api/metrics/engagement/activity
 * Feed de actividad reciente
 */
router.get('/activity', async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit, 10) || 20;
        const activity = await metricsService.getActivityFeed(limit);
        res.json({
            success: true,
            data: activity
        });
    } catch (error) {
        console.error('Error obteniendo actividad:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo actividad'
        });
    }
});

/**
 * GET /api/metrics/engagement/trends
 * Tendencias de engagement (últimos 6 meses)
 */
router.get('/trends', async (req, res) => {
    try {
        const trends = await metricsService.getEngagementTrends();
        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Error obteniendo tendencias:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo tendencias'
        });
    }
});

// ============================================================================
// MÉTRICAS DE CUPONES
// ============================================================================

/**
 * GET /api/metrics/engagement/coupons
 * Métricas completas de cupones
 */
router.get('/coupons', async (req, res) => {
    try {
        const metrics = await metricsService.getCouponMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error('Error obteniendo métricas de cupones:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métricas de cupones'
        });
    }
});

/**
 * GET /api/metrics/engagement/coupons/:couponId
 * Métricas de un cupón específico
 */
router.get('/coupons/:couponId', async (req, res) => {
    try {
        const { couponId } = req.params;
        const stats = await metricsService.getCouponStats(couponId);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error obteniendo stats de cupón:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo stats de cupón'
        });
    }
});

// ============================================================================
// MÉTRICAS DE FIDELIZACIÓN
// ============================================================================

/**
 * GET /api/metrics/engagement/loyalty
 * Métricas completas del programa de lealtad
 */
router.get('/loyalty', async (req, res) => {
    try {
        const metrics = await metricsService.getLoyaltyMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error('Error obteniendo métricas de lealtad:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métricas de lealtad'
        });
    }
});

/**
 * GET /api/metrics/engagement/loyalty/user/:userId
 * Métricas de lealtad de un usuario específico
 */
router.get('/loyalty/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await metricsService.getUserLoyaltyStats(userId);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error obteniendo stats de usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo stats de usuario'
        });
    }
});

// ============================================================================
// MÉTRICAS DE RESEÑAS
// ============================================================================

/**
 * GET /api/metrics/engagement/reviews
 * Métricas completas de reseñas
 */
router.get('/reviews', async (req, res) => {
    try {
        const metrics = await metricsService.getReviewMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error('Error obteniendo métricas de reseñas:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métricas de reseñas'
        });
    }
});

/**
 * GET /api/metrics/engagement/reviews/product/:productId
 * Métricas de reseñas de un producto específico
 */
router.get('/reviews/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const stats = await metricsService.getProductReviewStats(productId);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error obteniendo stats de producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo stats de producto'
        });
    }
});

// ============================================================================
// MÉTRICAS DE NOTIFICACIONES
// ============================================================================

/**
 * GET /api/metrics/engagement/notifications
 * Métricas completas de notificaciones
 */
router.get('/notifications', async (req, res) => {
    try {
        const metrics = await metricsService.getNotificationMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        console.error('Error obteniendo métricas de notificaciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métricas de notificaciones'
        });
    }
});

// ============================================================================
// EXPORT PARA DASHBOARD
// ============================================================================

/**
 * GET /api/metrics/engagement/dashboard
 * Datos optimizados para el dashboard visual
 */
router.get('/dashboard', async (req, res) => {
    try {
        const [coupons, loyalty, reviews, notifications, trends] = await Promise.all([
            metricsService.getCouponMetrics(),
            metricsService.getLoyaltyMetrics(),
            metricsService.getReviewMetrics(),
            metricsService.getNotificationMetrics(),
            metricsService.getEngagementTrends()
        ]);

        // Formatear para el dashboard
        const dashboardData = {
            stats: {
                activeCoupons: coupons.overview.activeCoupons,
                totalPoints: loyalty.overview.pointsInCirculation,
                avgRating: reviews.overview.avgRating,
                scheduledNotifs: notifications.overview.scheduledTotal,
                loyaltyMembers: loyalty.overview.totalMembers,
                abandonedCarts: notifications.byType.abandonedCart.scheduled
            },
            tiers: loyalty.tierDistribution,
            trends: trends.monthly,
            topCoupons: coupons.topCoupons,
            topMembers: loyalty.topMembers,
            ratingDistribution: reviews.ratingDistribution,
            pendingReviews: reviews.moderationStats.pending,
            upcomingHolidays: notifications.upcomingHolidays,
            birthdaysThisWeek: notifications.birthdaysThisWeek
        };

        res.json({
            success: true,
            data: dashboardData,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error obteniendo datos del dashboard:', error);
        res.status(500).json({
            success: false,
            error: 'Error obteniendo datos del dashboard'
        });
    }
});

module.exports = router;
