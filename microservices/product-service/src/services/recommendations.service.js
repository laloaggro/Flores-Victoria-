/**
 * Product Recommendations Service - Flores Victoria
 * Motor de recomendaciones basado en historial y preferencias
 */

class RecommendationService {
    constructor() {
        // Configuración del motor
        this.config = {
            maxRecommendations: 12,
            minScoreThreshold: 0.1,
            weights: {
                purchaseHistory: 0.35,
                viewHistory: 0.15,
                categoryAffinity: 0.20,
                popularity: 0.10,
                seasonal: 0.10,
                collaborative: 0.10
            }
        };

        // Productos demo (en producción vendrían de la DB)
        this.products = new Map();
        
        // Historial de usuarios
        this.userHistory = new Map();
        
        // Estadísticas de productos
        this.productStats = new Map();

        // Cache de recomendaciones
        this.recommendationCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutos

        // Datos estacionales
        this.seasonalEvents = {
            '02-14': { name: 'San Valentín', categories: ['romanticos', 'rosas', 'corazones'], boost: 2.0 },
            '05-10': { name: 'Día de la Madre', categories: ['especiales', 'ramos-premium', 'orquideas'], boost: 2.0 },
            '06-20': { name: 'Día del Padre', categories: ['corporativos', 'plantas'], boost: 1.5 },
            '12-25': { name: 'Navidad', categories: ['navidad', 'centros-mesa', 'coronas'], boost: 1.8 },
            '01-01': { name: 'Año Nuevo', categories: ['celebracion', 'arreglos-especiales'], boost: 1.5 }
        };
    }

    // ========================================================================
    // RECOMENDACIONES PRINCIPALES
    // ========================================================================

    /**
     * Obtener recomendaciones personalizadas para un usuario
     */
    async getPersonalizedRecommendations(userId, options = {}) {
        const {
            limit = 8,
            excludeProductIds = [],
            context = 'homepage', // homepage, product-page, cart, checkout
            currentProductId = null
        } = options;

        // Verificar cache
        const cacheKey = `${userId}-${context}-${currentProductId}`;
        const cached = this.checkCache(cacheKey);
        if (cached) return cached;

        // Obtener historial del usuario
        const history = await this.getUserHistory(userId);
        
        // Obtener productos candidatos
        const candidates = await this.getCandidateProducts(excludeProductIds);
        
        // Calcular scores
        const scoredProducts = await this.scoreProducts(candidates, history, {
            context,
            currentProductId
        });

        // Filtrar y ordenar
        const recommendations = scoredProducts
            .filter(p => p.score >= this.config.minScoreThreshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(p => ({
                productId: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                category: p.category,
                score: p.score,
                reason: this.getRecommendationReason(p)
            }));

        // Guardar en cache
        this.setCache(cacheKey, recommendations);

        return recommendations;
    }

    /**
     * Obtener productos similares
     */
    async getSimilarProducts(productId, limit = 6) {
        const product = await this.getProduct(productId);
        if (!product) return [];

        const candidates = await this.getCandidateProducts([productId]);
        
        const similar = candidates.map(candidate => ({
            ...candidate,
            similarity: this.calculateSimilarity(product, candidate)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(p => ({
            productId: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            similarity: p.similarity,
            reason: 'Similar al producto que estás viendo'
        }));

        return similar;
    }

    /**
     * Productos frecuentemente comprados juntos
     */
    async getFrequentlyBoughtTogether(productId, limit = 4) {
        // En producción: analizar órdenes reales
        const product = await this.getProduct(productId);
        if (!product) return [];

        const complementaryCategories = this.getComplementaryCategories(product.category);
        const candidates = await this.getCandidateProducts([productId]);
        
        const complementary = candidates
            .filter(c => complementaryCategories.includes(c.category))
            .sort((a, b) => b.purchaseCount - a.purchaseCount)
            .slice(0, limit)
            .map(p => ({
                productId: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                reason: 'Frecuentemente comprado junto'
            }));

        return complementary;
    }

    /**
     * Productos trending
     */
    async getTrendingProducts(limit = 8) {
        const candidates = await this.getCandidateProducts([]);
        
        // Calcular trending score basado en compras recientes
        const trending = candidates.map(product => {
            const stats = this.productStats.get(product.id) || this.getDefaultStats();
            const trendScore = (stats.recentPurchases * 2) + (stats.recentViews * 0.5);
            return { ...product, trendScore };
        })
        .sort((a, b) => b.trendScore - a.trendScore)
        .slice(0, limit)
        .map(p => ({
            productId: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            reason: '🔥 Trending ahora'
        }));

        return trending;
    }

    /**
     * Productos mejor valorados
     */
    async getTopRatedProducts(limit = 8, minReviews = 5) {
        const candidates = await this.getCandidateProducts([]);
        
        const topRated = candidates
            .filter(p => (p.reviewCount || 0) >= minReviews)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, limit)
            .map(p => ({
                productId: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                rating: p.rating,
                reviewCount: p.reviewCount,
                reason: `⭐ ${p.rating?.toFixed(1)} (${p.reviewCount} reseñas)`
            }));

        return topRated;
    }

    /**
     * Ofertas personalizadas
     */
    async getPersonalizedOffers(userId, limit = 4) {
        const history = await this.getUserHistory(userId);
        const favoriteCategories = this.extractFavoriteCategories(history);

        const candidates = await this.getCandidateProducts([]);
        
        const offers = candidates
            .filter(p => p.discount && p.discount > 0)
            .map(p => ({
                ...p,
                relevance: favoriteCategories.includes(p.category) ? 1.5 : 1
            }))
            .sort((a, b) => (b.discount * b.relevance) - (a.discount * a.relevance))
            .slice(0, limit)
            .map(p => ({
                productId: p.id,
                name: p.name,
                originalPrice: p.originalPrice,
                price: p.price,
                discount: p.discount,
                image: p.image,
                reason: `🏷️ ${p.discount}% de descuento`
            }));

        return offers;
    }

    /**
     * Recomendaciones para ocasiones
     */
    async getOccasionRecommendations(occasion, limit = 8) {
        const occasionMap = {
            'cumpleanos': ['ramos-alegres', 'globos', 'felicitaciones'],
            'aniversario': ['romanticos', 'rosas-rojas', 'premium'],
            'condolencias': ['condolencias', 'coronas', 'arreglos-funerarios'],
            'recuperacion': ['plantas', 'arreglos-pequenos', 'felicitaciones'],
            'agradecimiento': ['ramos-mixtos', 'orquideas', 'plantas'],
            'amor': ['romanticos', 'rosas', 'corazones'],
            'navidad': ['navidad', 'centros-mesa', 'nochebuena'],
            'dia-madre': ['especiales', 'premium', 'orquideas']
        };

        const categories = occasionMap[occasion] || ['ramos-mixtos'];
        const candidates = await this.getCandidateProducts([]);
        
        const recommendations = candidates
            .filter(p => categories.some(cat => p.category?.includes(cat) || p.tags?.includes(cat)))
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, limit)
            .map(p => ({
                productId: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                reason: `Ideal para ${occasion.replace('-', ' ')}`
            }));

        return recommendations;
    }

    // ========================================================================
    // SCORING Y CÁLCULOS
    // ========================================================================

    /**
     * Calcular score de productos
     */
    async scoreProducts(products, history, options) {
        const { context, currentProductId } = options;
        const seasonalBoost = this.getSeasonalBoost();

        return products.map(product => {
            let score = 0;

            // 1. Score por historial de compras
            const purchaseScore = this.calculatePurchaseHistoryScore(product, history.purchases);
            score += purchaseScore * this.config.weights.purchaseHistory;

            // 2. Score por historial de vistas
            const viewScore = this.calculateViewHistoryScore(product, history.views);
            score += viewScore * this.config.weights.viewHistory;

            // 3. Score por afinidad de categoría
            const categoryScore = this.calculateCategoryAffinityScore(product, history);
            score += categoryScore * this.config.weights.categoryAffinity;

            // 4. Score por popularidad
            const popularityScore = this.calculatePopularityScore(product);
            score += popularityScore * this.config.weights.popularity;

            // 5. Boost estacional
            if (seasonalBoost && seasonalBoost.categories.includes(product.category)) {
                score *= seasonalBoost.boost;
            }

            // 6. Ajuste por contexto
            score = this.adjustScoreByContext(score, product, context, currentProductId);

            return { ...product, score };
        });
    }

    calculatePurchaseHistoryScore(product, purchases = []) {
        // Mayor score si compró productos de la misma categoría
        const categoryPurchases = purchases.filter(p => p.category === product.category);
        const sameBrandPurchases = purchases.filter(p => p.brand === product.brand);
        
        let score = 0;
        score += categoryPurchases.length * 0.3;
        score += sameBrandPurchases.length * 0.2;
        
        // Bonus si nunca compró este producto específico
        if (!purchases.find(p => p.productId === product.id)) {
            score *= 1.2;
        }

        return Math.min(score, 1);
    }

    calculateViewHistoryScore(product, views = []) {
        const recentViews = views.filter(v => {
            const viewDate = new Date(v.date);
            const daysDiff = (Date.now() - viewDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        });

        const categoryViews = recentViews.filter(v => v.category === product.category);
        return Math.min(categoryViews.length * 0.1, 1);
    }

    calculateCategoryAffinityScore(product, history) {
        const allCategories = [
            ...history.purchases.map(p => p.category),
            ...history.views.map(v => v.category)
        ];

        const categoryCount = allCategories.filter(c => c === product.category).length;
        return Math.min(categoryCount * 0.15, 1);
    }

    calculatePopularityScore(product) {
        const stats = this.productStats.get(product.id) || this.getDefaultStats();
        const normalizedPurchases = Math.min(stats.purchaseCount / 100, 1);
        const normalizedRating = (product.rating || 4) / 5;
        return (normalizedPurchases * 0.6) + (normalizedRating * 0.4);
    }

    calculateSimilarity(productA, productB) {
        let similarity = 0;

        // Misma categoría
        if (productA.category === productB.category) similarity += 0.4;
        
        // Rango de precio similar (±30%)
        const priceDiff = Math.abs(productA.price - productB.price) / productA.price;
        if (priceDiff <= 0.3) similarity += 0.3 * (1 - priceDiff);

        // Tags en común
        const commonTags = (productA.tags || []).filter(t => (productB.tags || []).includes(t));
        similarity += Math.min(commonTags.length * 0.1, 0.3);

        return similarity;
    }

    adjustScoreByContext(score, product, context, currentProductId) {
        switch (context) {
            case 'cart':
                // En el carrito, priorizar complementarios y ofertas
                if (product.discount) score *= 1.3;
                break;
            case 'checkout':
                // En checkout, priorizar productos pequeños/baratos (upsell)
                if (product.price < 30000) score *= 1.2;
                break;
            case 'product-page':
                // En página de producto, priorizar similares
                break;
            default:
                // Homepage: balance general
                break;
        }
        return score;
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    getSeasonalBoost() {
        const today = new Date();
        const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // Buscar eventos cercanos (±7 días)
        for (const [date, event] of Object.entries(this.seasonalEvents)) {
            const eventDate = new Date(`${today.getFullYear()}-${date}`);
            const diffDays = Math.abs((eventDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) {
                return event;
            }
        }
        return null;
    }

    getComplementaryCategories(category) {
        const complements = {
            'ramos': ['chocolates', 'globos', 'peluches', 'vinos'],
            'rosas': ['chocolates', 'tarjetas', 'peluches'],
            'orquideas': ['macetas-decorativas', 'fertilizantes'],
            'plantas': ['macetas', 'fertilizantes', 'herramientas-jardin'],
            'condolencias': ['tarjetas-condolencias', 'velas'],
            'centros-mesa': ['velas', 'manteles', 'servilletas']
        };
        return complements[category] || ['chocolates', 'tarjetas'];
    }

    getRecommendationReason(product) {
        if (product.reasonType === 'purchase_history') {
            return 'Basado en tus compras anteriores';
        } else if (product.reasonType === 'view_history') {
            return 'Basado en lo que has visto';
        } else if (product.reasonType === 'category_affinity') {
            return 'Te podría gustar';
        } else if (product.reasonType === 'popularity') {
            return 'Popular entre nuestros clientes';
        } else if (product.reasonType === 'seasonal') {
            return '🎁 Especial de temporada';
        }
        return 'Recomendado para ti';
    }

    extractFavoriteCategories(history) {
        const categories = {};
        
        [...history.purchases, ...history.views].forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });

        return Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat]) => cat);
    }

    // ========================================================================
    // TRACKING
    // ========================================================================

    /**
     * Registrar vista de producto
     */
    async trackProductView(userId, productId, metadata = {}) {
        const history = this.userHistory.get(userId) || { purchases: [], views: [], favorites: [] };
        
        history.views.push({
            productId,
            category: metadata.category,
            date: new Date().toISOString(),
            source: metadata.source // search, browse, recommendation
        });

        // Mantener últimas 100 vistas
        if (history.views.length > 100) {
            history.views = history.views.slice(-100);
        }

        this.userHistory.set(userId, history);

        // Actualizar stats del producto
        const stats = this.productStats.get(productId) || this.getDefaultStats();
        stats.viewCount++;
        stats.recentViews++;
        this.productStats.set(productId, stats);

        // Invalidar cache
        this.invalidateUserCache(userId);
    }

    /**
     * Registrar compra
     */
    async trackPurchase(userId, products) {
        const history = this.userHistory.get(userId) || { purchases: [], views: [], favorites: [] };
        
        products.forEach(product => {
            history.purchases.push({
                productId: product.id,
                category: product.category,
                price: product.price,
                date: new Date().toISOString()
            });

            // Actualizar stats
            const stats = this.productStats.get(product.id) || this.getDefaultStats();
            stats.purchaseCount++;
            stats.recentPurchases++;
            this.productStats.set(product.id, stats);
        });

        this.userHistory.set(userId, history);
        this.invalidateUserCache(userId);
    }

    /**
     * Registrar agregado a favoritos
     */
    async trackFavorite(userId, productId, action = 'add') {
        const history = this.userHistory.get(userId) || { purchases: [], views: [], favorites: [] };
        
        if (action === 'add') {
            if (!history.favorites.includes(productId)) {
                history.favorites.push(productId);
            }
        } else {
            history.favorites = history.favorites.filter(id => id !== productId);
        }

        this.userHistory.set(userId, history);
        this.invalidateUserCache(userId);
    }

    // ========================================================================
    // CACHE
    // ========================================================================

    checkCache(key) {
        const cached = this.recommendationCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.recommendationCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    invalidateUserCache(userId) {
        for (const key of this.recommendationCache.keys()) {
            if (key.startsWith(userId)) {
                this.recommendationCache.delete(key);
            }
        }
    }

    // ========================================================================
    // DATA ACCESS (Mock)
    // ========================================================================

    async getProduct(productId) {
        return this.products.get(productId);
    }

    async getUserHistory(userId) {
        return this.userHistory.get(userId) || { purchases: [], views: [], favorites: [] };
    }

    async getCandidateProducts(excludeIds = []) {
        // En producción: consultar a la base de datos
        return Array.from(this.products.values())
            .filter(p => !excludeIds.includes(p.id) && p.active);
    }

    getDefaultStats() {
        return {
            viewCount: 0,
            purchaseCount: 0,
            recentViews: 0,
            recentPurchases: 0
        };
    }

    // ========================================================================
    // API DE ESTADÍSTICAS
    // ========================================================================

    async getRecommendationStats() {
        const totalUsers = this.userHistory.size;
        const totalProducts = this.products.size;
        const cacheSize = this.recommendationCache.size;

        // Calcular métricas de efectividad
        let totalPurchasesFromRecommendations = 0;
        let totalViews = 0;

        return {
            totalUsers,
            totalProducts,
            cacheSize,
            cacheHitRate: 0, // Calcular en producción
            topCategories: this.getTopCategories(),
            seasonalEvent: this.getSeasonalBoost()?.name || null
        };
    }

    getTopCategories() {
        const categories = {};
        
        for (const history of this.userHistory.values()) {
            history.purchases.forEach(p => {
                categories[p.category] = (categories[p.category] || 0) + 1;
            });
        }

        return Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }
}

// Instancia singleton
const recommendationService = new RecommendationService();

module.exports = {
    RecommendationService,
    recommendationService
};
