/**
 * Engagement Metrics Service - Flores Victoria
 * Servicio para métricas consolidadas de cupones, fidelización, reseñas y notificaciones
 */

const { v4: uuidv4 } = require('uuid');

// ============================================================================
// MÉTRICAS DE ENGAGEMENT
// ============================================================================

class EngagementMetricsService {
    constructor() {
        // Almacenamiento en memoria (en producción usar Redis/PostgreSQL)
        this.metricsCache = new Map();
        this.lastCalculated = null;
        this.cacheExpiryMs = 60000; // 1 minuto
        
        // Datos de ejemplo para desarrollo
        this.sampleData = this.generateSampleData();
    }

    // ========================================================================
    // MÉTRICAS GENERALES
    // ========================================================================

    /**
     * Obtener resumen completo de engagement
     */
    async getEngagementSummary() {
        const cached = this.getCachedMetrics('summary');
        if (cached) return cached;

        const summary = {
            timestamp: new Date().toISOString(),
            coupons: await this.getCouponMetrics(),
            loyalty: await this.getLoyaltyMetrics(),
            reviews: await this.getReviewMetrics(),
            notifications: await this.getNotificationMetrics(),
            trends: await this.getEngagementTrends()
        };

        this.setCachedMetrics('summary', summary);
        return summary;
    }

    // ========================================================================
    // MÉTRICAS DE CUPONES
    // ========================================================================

    /**
     * Métricas de cupones y promociones
     */
    async getCouponMetrics() {
        return {
            overview: {
                activeCoupons: this.sampleData.coupons.active.length,
                totalRedemptions: this.sampleData.coupons.redemptions.total,
                redemptionRate: this.sampleData.coupons.redemptions.rate,
                totalDiscountGiven: this.sampleData.coupons.discountGiven,
                avgDiscountPerOrder: Math.round(this.sampleData.coupons.discountGiven / this.sampleData.coupons.redemptions.total)
            },
            byType: {
                percentage: { count: 12, redemptions: 487, rate: 34.2 },
                fixedAmount: { count: 6, redemptions: 324, rate: 28.5 },
                freeShipping: { count: 3, redemptions: 256, rate: 42.1 },
                firstPurchase: { count: 1, redemptions: 198, rate: 78.4 },
                birthday: { count: 2, redemptions: 145, rate: 65.3 }
            },
            topCoupons: this.sampleData.coupons.topCoupons,
            recentActivity: this.sampleData.coupons.recentActivity,
            conversionImpact: {
                ordersWithCoupon: 1847,
                ordersWithoutCoupon: 3245,
                avgOrderValueWithCoupon: 42500,
                avgOrderValueWithoutCoupon: 35200,
                revenueFromCoupons: 78457500
            }
        };
    }

    /**
     * Métricas de un cupón específico
     */
    async getCouponStats(couponId) {
        // En producción, consultar base de datos
        return {
            couponId,
            code: 'PRIMAVERA2025',
            type: 'percentage',
            value: 15,
            createdAt: '2025-01-15T00:00:00Z',
            expiresAt: '2025-06-30T23:59:59Z',
            totalRedemptions: 487,
            uniqueUsers: 423,
            totalDiscountGiven: 4850000,
            avgOrderValue: 42300,
            redemptionsByDay: [
                { date: '2025-01-20', count: 12 },
                { date: '2025-01-21', count: 18 },
                { date: '2025-01-22', count: 24 },
                { date: '2025-01-23', count: 15 },
                { date: '2025-01-24', count: 21 }
            ],
            topProducts: [
                { productId: 'p1', name: 'Ramo Primaveral', count: 89 },
                { productId: 'p2', name: 'Arreglo Romántico', count: 67 },
                { productId: 'p3', name: 'Bouquet Elegante', count: 54 }
            ]
        };
    }

    // ========================================================================
    // MÉTRICAS DE FIDELIZACIÓN
    // ========================================================================

    /**
     * Métricas del programa de lealtad
     */
    async getLoyaltyMetrics() {
        return {
            overview: {
                totalMembers: this.sampleData.loyalty.totalMembers,
                pointsInCirculation: this.sampleData.loyalty.pointsCirculation,
                pointsRedeemed: this.sampleData.loyalty.pointsRedeemed,
                redemptionRate: Math.round((this.sampleData.loyalty.pointsRedeemed / this.sampleData.loyalty.pointsCirculation) * 100),
                estimatedLiabilityClp: this.sampleData.loyalty.pointsCirculation * 10 // $10 CLP por punto
            },
            tierDistribution: {
                bronze: { count: 423, percentage: 49.9, avgPoints: 2500 },
                silver: { count: 284, percentage: 33.5, avgPoints: 8500 },
                gold: { count: 98, percentage: 11.6, avgPoints: 18500 },
                platinum: { count: 42, percentage: 5.0, avgPoints: 38000 }
            },
            pointsActivity: {
                earnedThisMonth: 320000,
                redeemedThisMonth: 140000,
                expiredThisMonth: 15000,
                netChange: 165000
            },
            topMembers: this.sampleData.loyalty.topMembers,
            tierUpgrades: {
                thisMonth: 23,
                bronzeToSilver: 15,
                silverToGold: 6,
                goldToPlatinum: 2
            },
            rewardRedemptions: {
                discounts: { count: 245, pointsUsed: 98000 },
                freeShipping: { count: 89, pointsUsed: 44500 },
                products: { count: 12, pointsUsed: 24000 }
            }
        };
    }

    /**
     * Métricas de un usuario específico
     */
    async getUserLoyaltyStats(userId) {
        return {
            userId,
            tier: 'gold',
            currentPoints: 18500,
            lifetimePoints: 45230,
            lifetimeRedeemed: 26730,
            memberSince: '2023-06-15',
            nextTierPoints: 6500,
            nextTierName: 'platinum',
            recentActivity: [
                { type: 'earn', points: 150, reason: 'Compra', date: '2025-01-24' },
                { type: 'redeem', points: -500, reason: 'Descuento $5,000', date: '2025-01-20' },
                { type: 'earn', points: 100, reason: 'Reseña', date: '2025-01-18' }
            ],
            benefits: {
                pointsMultiplier: 1.5,
                discount: 10,
                freeShipping: false,
                exclusiveAccess: true
            }
        };
    }

    // ========================================================================
    // MÉTRICAS DE RESEÑAS
    // ========================================================================

    /**
     * Métricas de reseñas
     */
    async getReviewMetrics() {
        return {
            overview: {
                totalReviews: this.sampleData.reviews.total,
                avgRating: this.sampleData.reviews.avgRating,
                reviewsWithPhotos: this.sampleData.reviews.withPhotos,
                pendingModeration: this.sampleData.reviews.pending,
                responseRate: 78 // % de reseñas con respuesta del negocio
            },
            ratingDistribution: {
                5: { count: 2050, percentage: 72 },
                4: { count: 512, percentage: 18 },
                3: { count: 171, percentage: 6 },
                2: { count: 85, percentage: 3 },
                1: { count: 29, percentage: 1 }
            },
            moderationStats: {
                pending: 12,
                approvedThisWeek: 89,
                rejectedThisWeek: 3,
                flaggedForReview: 5,
                avgModerationTime: '2.5h'
            },
            topReviewedProducts: [
                { productId: 'p1', name: 'Ramo Primaveral', reviews: 245, avgRating: 4.8 },
                { productId: 'p2', name: 'Arreglo Romántico', reviews: 198, avgRating: 4.7 },
                { productId: 'p3', name: 'Bouquet Elegante', reviews: 167, avgRating: 4.9 },
                { productId: 'p4', name: 'Corona Fúnebre', reviews: 134, avgRating: 4.6 },
                { productId: 'p5', name: 'Centro de Mesa', reviews: 112, avgRating: 4.8 }
            ],
            recentReviews: this.sampleData.reviews.recent,
            helpfulStats: {
                totalHelpfulVotes: 4567,
                avgHelpfulPerReview: 1.6
            }
        };
    }

    /**
     * Métricas de reseñas de un producto
     */
    async getProductReviewStats(productId) {
        return {
            productId,
            productName: 'Ramo Primaveral',
            totalReviews: 245,
            avgRating: 4.8,
            ratingDistribution: { 5: 180, 4: 45, 3: 15, 2: 4, 1: 1 },
            reviewsWithPhotos: 67,
            verifiedPurchases: 232,
            recentTrend: {
                last30Days: 28,
                avgRatingLast30Days: 4.9,
                change: '+0.1'
            },
            sentimentAnalysis: {
                positive: 89,
                neutral: 8,
                negative: 3
            },
            commonKeywords: [
                { word: 'hermoso', count: 89 },
                { word: 'fresco', count: 67 },
                { word: 'puntual', count: 54 },
                { word: 'calidad', count: 45 }
            ]
        };
    }

    // ========================================================================
    // MÉTRICAS DE NOTIFICACIONES
    // ========================================================================

    /**
     * Métricas de notificaciones programadas
     */
    async getNotificationMetrics() {
        return {
            overview: {
                scheduledTotal: this.sampleData.notifications.scheduled,
                sentThisMonth: this.sampleData.notifications.sentThisMonth,
                openRate: 68,
                clickRate: 34,
                conversionRate: 12
            },
            byType: {
                birthday: { scheduled: 45, sent: 120, conversions: 72, rate: 60 },
                abandonedCart: { scheduled: 23, sent: 89, conversions: 34, rate: 38 },
                holiday: { scheduled: 3, sent: 45, conversions: 28, rate: 62 },
                repeatOrder: { scheduled: 67, sent: 67, conversions: 42, rate: 63 }
            },
            upcomingHolidays: [
                { 
                    name: 'Día de la Madre', 
                    date: '2025-05-11', 
                    daysUntil: this.calculateDaysUntil('2025-05-11'),
                    targetAudience: 847,
                    campaignStatus: 'scheduled'
                },
                { 
                    name: 'Día del Padre', 
                    date: '2025-06-15', 
                    daysUntil: this.calculateDaysUntil('2025-06-15'),
                    targetAudience: 623,
                    campaignStatus: 'planned'
                },
                { 
                    name: 'San Valentín', 
                    date: '2026-02-14', 
                    daysUntil: this.calculateDaysUntil('2026-02-14'),
                    targetAudience: 1250,
                    campaignStatus: 'planned'
                }
            ],
            birthdaysThisWeek: 23,
            abandonedCarts: {
                active: 23,
                recovered: 34,
                recoveryRate: 38,
                revenueRecovered: 1450000
            },
            channelPerformance: {
                email: { sent: 450, opened: 306, clicked: 153, rate: 34 },
                sms: { sent: 120, delivered: 118, clicked: 47, rate: 39 },
                whatsapp: { sent: 89, read: 78, clicked: 45, rate: 51 },
                push: { sent: 234, received: 210, clicked: 63, rate: 27 }
            }
        };
    }

    // ========================================================================
    // TENDENCIAS Y ANÁLISIS
    // ========================================================================

    /**
     * Tendencias de engagement (últimos 6 meses)
     */
    async getEngagementTrends() {
        return {
            monthly: [
                { month: 'Enero', coupons: 120, points: 150000, reviews: 45, notifications: 89 },
                { month: 'Febrero', coupons: 190, points: 180000, reviews: 60, notifications: 102 },
                { month: 'Marzo', coupons: 160, points: 210000, reviews: 75, notifications: 98 },
                { month: 'Abril', coupons: 280, points: 250000, reviews: 90, notifications: 145 },
                { month: 'Mayo', coupons: 320, points: 290000, reviews: 110, notifications: 178 },
                { month: 'Junio', coupons: 487, points: 320000, reviews: 130, notifications: 210 }
            ],
            growth: {
                couponsGrowth: 52, // % respecto mes anterior
                loyaltyGrowth: 10,
                reviewsGrowth: 18,
                notificationsGrowth: 18
            },
            yearOverYear: {
                coupons: '+145%',
                loyalty: '+89%',
                reviews: '+67%',
                notifications: '+234%'
            }
        };
    }

    /**
     * Feed de actividad reciente
     */
    async getActivityFeed(limit = 20) {
        return this.sampleData.activityFeed.slice(0, limit);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    calculateDaysUntil(dateStr) {
        const target = new Date(dateStr);
        const today = new Date();
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    getCachedMetrics(key) {
        const cached = this.metricsCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiryMs) {
            return cached.data;
        }
        return null;
    }

    setCachedMetrics(key, data) {
        this.metricsCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    generateSampleData() {
        return {
            coupons: {
                active: Array(24).fill(null).map((_, i) => ({ id: `c${i}` })),
                redemptions: { total: 1847, rate: 34 },
                discountGiven: 4200000,
                topCoupons: [
                    { code: 'PRIMAVERA2025', uses: 487, type: 'percentage', value: 15 },
                    { code: 'BIENVENIDO', uses: 324, type: 'fixed', value: 5000 },
                    { code: 'ENVIOGRATIS', uses: 256, type: 'shipping', value: 0 },
                    { code: 'DIADELAMADRE', uses: 198, type: 'percentage', value: 20 }
                ],
                recentActivity: [
                    { code: 'PRIMAVERA2025', user: 'María G.', time: '2 min' },
                    { code: 'BIENVENIDO', user: 'Nuevo Usuario', time: '5 min' },
                    { code: 'ENVIOGRATIS', user: 'Carlos R.', time: '8 min' }
                ]
            },
            loyalty: {
                totalMembers: 847,
                pointsCirculation: 1200000,
                pointsRedeemed: 456000,
                topMembers: [
                    { name: 'María González', tier: 'platinum', points: 45230 },
                    { name: 'Carlos Rodríguez', tier: 'platinum', points: 38450 },
                    { name: 'Ana Martínez', tier: 'gold', points: 28900 }
                ]
            },
            reviews: {
                total: 2847,
                avgRating: 4.7,
                withPhotos: 892,
                pending: 12,
                recent: [
                    { user: 'María García', product: 'Ramo Primaveral', rating: 5, hasPhoto: true },
                    { user: 'Juan Rodríguez', product: 'Arreglo Romántico', rating: 4, hasPhoto: false },
                    { user: 'Ana Silva', product: 'Corona Fúnebre', rating: 5, hasPhoto: true }
                ]
            },
            notifications: {
                scheduled: 156,
                sentThisMonth: 893
            },
            activityFeed: [
                { type: 'coupon', message: 'Cupón PRIMAVERA2025 usado por María G.', time: 'Hace 2 min' },
                { type: 'loyalty', message: 'Carlos R. subió a tier Platino', time: 'Hace 5 min' },
                { type: 'review', message: 'Nueva reseña 5⭐ en Ramo Primaveral', time: 'Hace 8 min' },
                { type: 'notification', message: 'Recordatorio de cumpleaños enviado', time: 'Hace 15 min' },
                { type: 'coupon', message: 'Cupón BIENVENIDO generado', time: 'Hace 20 min' },
                { type: 'loyalty', message: 'Ana M. canjeó 5,000 puntos', time: 'Hace 25 min' },
                { type: 'review', message: 'Reseña aprobada por moderación', time: 'Hace 30 min' },
                { type: 'notification', message: 'Carrito abandonado - email enviado', time: 'Hace 45 min' },
                { type: 'coupon', message: 'Nuevo cupón INVIERNO2025 creado', time: 'Hace 1h' },
                { type: 'loyalty', message: 'Bono de cumpleaños entregado a Pedro S.', time: 'Hace 1h' }
            ]
        };
    }
}

module.exports = {
    EngagementMetricsService
};
