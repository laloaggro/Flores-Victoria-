/**
 * Product Recommendations Routes - Flores Victoria
 * API REST para recomendaciones de productos
 */

const express = require('express');
const router = express.Router();
const { recommendationService } = require('../services/recommendations.service');

// ============================================================================
// RECOMENDACIONES PARA USUARIOS
// ============================================================================

/**
 * GET /api/recommendations/personalized
 * Obtiene recomendaciones personalizadas para el usuario
 */
router.get('/personalized', async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId || 'anonymous';
        const { limit, exclude, context, currentProduct } = req.query;

        const recommendations = await recommendationService.getPersonalizedRecommendations(userId, {
            limit: Number.parseInt(limit, 10) || 8,
            excludeProductIds: exclude ? exclude.split(',') : [],
            context: context || 'homepage',
            currentProductId: currentProduct
        });

        res.json({
            success: true,
            data: recommendations,
            meta: {
                userId,
                context,
                count: recommendations.length
            }
        });
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        res.status(500).json({
            error: true,
            message: 'Error obteniendo recomendaciones'
        });
    }
});

/**
 * GET /api/recommendations/similar/:productId
 * Obtiene productos similares
 */
router.get('/similar/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit } = req.query;

        const similar = await recommendationService.getSimilarProducts(
            productId,
            Number.parseInt(limit, 10) || 6
        );

        res.json({
            success: true,
            data: similar
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo productos similares'
        });
    }
});

/**
 * GET /api/recommendations/bought-together/:productId
 * Productos frecuentemente comprados juntos
 */
router.get('/bought-together/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit } = req.query;

        const products = await recommendationService.getFrequentlyBoughtTogether(
            productId,
            Number.parseInt(limit, 10) || 4
        );

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo productos relacionados'
        });
    }
});

/**
 * GET /api/recommendations/trending
 * Productos trending
 */
router.get('/trending', async (req, res) => {
    try {
        const { limit } = req.query;

        const trending = await recommendationService.getTrendingProducts(
            Number.parseInt(limit, 10) || 8
        );

        res.json({
            success: true,
            data: trending
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo productos trending'
        });
    }
});

/**
 * GET /api/recommendations/top-rated
 * Productos mejor valorados
 */
router.get('/top-rated', async (req, res) => {
    try {
        const { limit, minReviews } = req.query;

        const topRated = await recommendationService.getTopRatedProducts(
            Number.parseInt(limit, 10) || 8,
            Number.parseInt(minReviews, 10) || 5
        );

        res.json({
            success: true,
            data: topRated
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo productos mejor valorados'
        });
    }
});

/**
 * GET /api/recommendations/offers
 * Ofertas personalizadas
 */
router.get('/offers', async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId || 'anonymous';
        const { limit } = req.query;

        const offers = await recommendationService.getPersonalizedOffers(
            userId,
            Number.parseInt(limit, 10) || 4
        );

        res.json({
            success: true,
            data: offers
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo ofertas'
        });
    }
});

/**
 * GET /api/recommendations/occasion/:occasion
 * Recomendaciones por ocasión
 */
router.get('/occasion/:occasion', async (req, res) => {
    try {
        const { occasion } = req.params;
        const { limit } = req.query;

        const recommendations = await recommendationService.getOccasionRecommendations(
            occasion,
            Number.parseInt(limit, 10) || 8
        );

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo recomendaciones para ocasión'
        });
    }
});

// ============================================================================
// TRACKING
// ============================================================================

/**
 * POST /api/recommendations/track/view
 * Registra vista de producto
 */
router.post('/track/view', async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId || req.body.sessionId || 'anonymous';
        const { productId, category, source } = req.body;

        if (!productId) {
            return res.status(400).json({
                error: true,
                message: 'productId requerido'
            });
        }

        await recommendationService.trackProductView(userId, productId, {
            category,
            source
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({
            error: true,
            message: 'Error registrando vista'
        });
    }
});

/**
 * POST /api/recommendations/track/purchase
 * Registra compra
 */
router.post('/track/purchase', async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { products } = req.body;

        if (!userId || !products || !Array.isArray(products)) {
            return res.status(400).json({
                error: true,
                message: 'userId y products requeridos'
            });
        }

        await recommendationService.trackPurchase(userId, products);

        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking purchase:', error);
        res.status(500).json({
            error: true,
            message: 'Error registrando compra'
        });
    }
});

/**
 * POST /api/recommendations/track/favorite
 * Registra favorito
 */
router.post('/track/favorite', async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { productId, action } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                error: true,
                message: 'userId y productId requeridos'
            });
        }

        await recommendationService.trackFavorite(userId, productId, action || 'add');

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error registrando favorito'
        });
    }
});

// ============================================================================
// ADMIN / STATS
// ============================================================================

/**
 * GET /api/recommendations/admin/stats
 * Estadísticas del sistema de recomendaciones
 */
router.get('/admin/stats', async (req, res) => {
    try {
        const stats = await recommendationService.getRecommendationStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Error obteniendo estadísticas'
        });
    }
});

module.exports = router;
