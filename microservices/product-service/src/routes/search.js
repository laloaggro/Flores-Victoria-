/**
 * Rutas de Búsqueda Avanzada - Flores Victoria
 * API endpoints para búsqueda, autocompletado y filtros
 */

const express = require('express');
const router = express.Router();
const { 
    SearchService, 
    PRODUCT_CATEGORIES, 
    OCCASIONS, 
    PRICE_RANGES 
} = require('../services/search.service');

// Instancia del servicio
const searchService = new SearchService();

// ============================================================================
// BÚSQUEDA PRINCIPAL
// ============================================================================

/**
 * GET /api/search
 * Búsqueda avanzada de productos
 * 
 * Query params:
 * - q: texto de búsqueda
 * - category: ID de categoría
 * - occasion: ID de ocasión
 * - priceRange: ID de rango (bajo, medio, alto, premium)
 * - minPrice: precio mínimo
 * - maxPrice: precio máximo
 * - inStock: true/false
 * - sort: relevance, price, name, rating, newest, bestseller
 * - order: asc, desc
 * - page: número de página
 * - limit: resultados por página
 */
router.get('/', async (req, res) => {
    try {
        const {
            q: query,
            category,
            occasion,
            priceRange,
            minPrice,
            maxPrice,
            inStock,
            sort: sortBy = 'relevance',
            order: sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        // Obtener userId del token si está disponible
        const userId = req.user?.id || req.headers['x-user-id'] || null;

        const result = await searchService.search({
            query,
            category,
            occasion,
            priceRange,
            minPrice: minPrice ? Number.parseFloat(minPrice) : null,
            maxPrice: maxPrice ? Number.parseFloat(maxPrice) : null,
            inStock: inStock === 'true' ? true : inStock === 'false' ? false : null,
            sortBy,
            sortOrder,
            page: Number.parseInt(page, 10),
            limit: Math.min(Number.parseInt(limit, 10), 100),
            userId
        });

        res.json(result);

    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.status(500).json({
            success: false,
            error: 'Error al realizar la búsqueda',
            message: error.message
        });
    }
});

/**
 * POST /api/search
 * Búsqueda avanzada (alternativa POST para queries complejas)
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.user?.id || req.headers['x-user-id'] || null;
        
        const result = await searchService.search({
            ...req.body,
            userId
        });

        res.json(result);

    } catch (error) {
        console.error('Error en búsqueda POST:', error);
        res.status(500).json({
            success: false,
            error: 'Error al realizar la búsqueda',
            message: error.message
        });
    }
});

// ============================================================================
// AUTOCOMPLETADO
// ============================================================================

/**
 * GET /api/search/autocomplete
 * Obtener sugerencias de autocompletado
 */
router.get('/autocomplete', async (req, res) => {
    try {
        const { q: query, limit = 8 } = req.query;

        if (!query || query.length < 2) {
            return res.json({
                success: true,
                data: { suggestions: [] }
            });
        }

        const result = await searchService.getAutocomplete(query, Number.parseInt(limit, 10));

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error en autocompletado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener sugerencias',
            message: error.message
        });
    }
});

// ============================================================================
// FILTROS Y FACETAS
// ============================================================================

/**
 * GET /api/search/filters
 * Obtener todos los filtros disponibles
 */
router.get('/filters', (req, res) => {
    res.json({
        success: true,
        data: {
            categories: PRODUCT_CATEGORIES,
            occasions: OCCASIONS,
            priceRanges: PRICE_RANGES,
            sortOptions: [
                { id: 'relevance', name: 'Relevancia', default: true },
                { id: 'price', name: 'Precio' },
                { id: 'name', name: 'Nombre' },
                { id: 'rating', name: 'Calificación' },
                { id: 'newest', name: 'Más recientes' },
                { id: 'bestseller', name: 'Más vendidos' }
            ]
        }
    });
});

/**
 * GET /api/search/categories
 * Obtener categorías
 */
router.get('/categories', (req, res) => {
    res.json({
        success: true,
        data: PRODUCT_CATEGORIES
    });
});

/**
 * GET /api/search/occasions
 * Obtener ocasiones
 */
router.get('/occasions', (req, res) => {
    res.json({
        success: true,
        data: OCCASIONS
    });
});

/**
 * GET /api/search/price-ranges
 * Obtener rangos de precio
 */
router.get('/price-ranges', (req, res) => {
    res.json({
        success: true,
        data: PRICE_RANGES
    });
});

// ============================================================================
// HISTORIAL Y POPULARES
// ============================================================================

/**
 * GET /api/search/history
 * Obtener historial de búsquedas del usuario
 */
router.get('/history', (req, res) => {
    try {
        const userId = req.user?.id || req.headers['x-user-id'];

        if (!userId) {
            return res.json({
                success: true,
                data: []
            });
        }

        const history = searchService.getSearchHistory(userId);

        res.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener historial',
            message: error.message
        });
    }
});

/**
 * DELETE /api/search/history
 * Limpiar historial de búsquedas del usuario
 */
router.delete('/history', (req, res) => {
    try {
        const userId = req.user?.id || req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }

        searchService.clearSearchHistory(userId);

        res.json({
            success: true,
            message: 'Historial eliminado'
        });

    } catch (error) {
        console.error('Error eliminando historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar historial',
            message: error.message
        });
    }
});

/**
 * GET /api/search/popular
 * Obtener búsquedas populares
 */
router.get('/popular', (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const popular = searchService.getPopularSearches(Number.parseInt(limit, 10));

        res.json({
            success: true,
            data: popular
        });

    } catch (error) {
        console.error('Error obteniendo populares:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener búsquedas populares',
            message: error.message
        });
    }
});

// ============================================================================
// BÚSQUEDAS ESPECIALIZADAS
// ============================================================================

/**
 * GET /api/search/by-category/:categoryId
 * Buscar por categoría
 */
router.get('/by-category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { sort = 'bestseller', order = 'desc', page = 1, limit = 20 } = req.query;

        const result = await searchService.search({
            category: categoryId,
            sortBy: sort,
            sortOrder: order,
            page: Number.parseInt(page, 10),
            limit: Number.parseInt(limit, 10)
        });

        res.json(result);

    } catch (error) {
        console.error('Error en búsqueda por categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error al buscar por categoría',
            message: error.message
        });
    }
});

/**
 * GET /api/search/by-occasion/:occasionId
 * Buscar por ocasión
 */
router.get('/by-occasion/:occasionId', async (req, res) => {
    try {
        const { occasionId } = req.params;
        const { sort = 'bestseller', order = 'desc', page = 1, limit = 20 } = req.query;

        const result = await searchService.search({
            occasion: occasionId,
            sortBy: sort,
            sortOrder: order,
            page: Number.parseInt(page, 10),
            limit: Number.parseInt(limit, 10)
        });

        res.json(result);

    } catch (error) {
        console.error('Error en búsqueda por ocasión:', error);
        res.status(500).json({
            success: false,
            error: 'Error al buscar por ocasión',
            message: error.message
        });
    }
});

/**
 * GET /api/search/by-price-range/:rangeId
 * Buscar por rango de precio
 */
router.get('/by-price-range/:rangeId', async (req, res) => {
    try {
        const { rangeId } = req.params;
        const { sort = 'price', order = 'asc', page = 1, limit = 20 } = req.query;

        const result = await searchService.search({
            priceRange: rangeId,
            sortBy: sort,
            sortOrder: order,
            page: Number.parseInt(page, 10),
            limit: Number.parseInt(limit, 10)
        });

        res.json(result);

    } catch (error) {
        console.error('Error en búsqueda por precio:', error);
        res.status(500).json({
            success: false,
            error: 'Error al buscar por precio',
            message: error.message
        });
    }
});

// ============================================================================
// BÚSQUEDAS DESTACADAS
// ============================================================================

/**
 * GET /api/search/featured
 * Obtener productos destacados
 */
router.get('/featured', async (req, res) => {
    try {
        const result = await searchService.search({
            sortBy: 'bestseller',
            sortOrder: 'desc',
            limit: 8,
            inStock: true
        });

        res.json({
            success: true,
            data: {
                title: 'Productos Destacados',
                products: result.data.products
            }
        });

    } catch (error) {
        console.error('Error obteniendo destacados:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos destacados',
            message: error.message
        });
    }
});

/**
 * GET /api/search/new-arrivals
 * Obtener nuevos productos
 */
router.get('/new-arrivals', async (req, res) => {
    try {
        const result = await searchService.search({
            sortBy: 'newest',
            sortOrder: 'desc',
            limit: 8,
            inStock: true
        });

        res.json({
            success: true,
            data: {
                title: 'Nuevos Productos',
                products: result.data.products
            }
        });

    } catch (error) {
        console.error('Error obteniendo nuevos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener nuevos productos',
            message: error.message
        });
    }
});

/**
 * GET /api/search/top-rated
 * Obtener productos mejor calificados
 */
router.get('/top-rated', async (req, res) => {
    try {
        const result = await searchService.search({
            sortBy: 'rating',
            sortOrder: 'desc',
            limit: 8,
            inStock: true
        });

        res.json({
            success: true,
            data: {
                title: 'Mejor Calificados',
                products: result.data.products
            }
        });

    } catch (error) {
        console.error('Error obteniendo mejor calificados:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos mejor calificados',
            message: error.message
        });
    }
});

// ============================================================================
// SUGERENCIAS
// ============================================================================

/**
 * GET /api/search/suggestions
 * Obtener sugerencias basadas en contexto
 */
router.get('/suggestions', async (req, res) => {
    try {
        const userId = req.user?.id || req.headers['x-user-id'];
        const suggestions = [];

        // Basado en historial
        if (userId) {
            const history = searchService.getSearchHistory(userId, 5);
            if (history.length > 0) {
                suggestions.push({
                    type: 'history',
                    title: 'Búsquedas recientes',
                    items: history.map(h => h.query)
                });
            }
        }

        // Búsquedas populares
        const popular = searchService.getPopularSearches(5);
        if (popular.length > 0) {
            suggestions.push({
                type: 'popular',
                title: 'Búsquedas populares',
                items: popular.map(p => p.query)
            });
        }

        // Categorías destacadas
        suggestions.push({
            type: 'categories',
            title: 'Categorías',
            items: PRODUCT_CATEGORIES.slice(0, 5)
        });

        // Ocasiones actuales (por ejemplo, próximo día de la madre)
        const currentMonth = new Date().getMonth() + 1;
        let featuredOccasions = [];
        if (currentMonth === 5) {
            featuredOccasions = OCCASIONS.filter(o => o.id === 'madre');
        } else if (currentMonth === 2) {
            featuredOccasions = OCCASIONS.filter(o => o.id === 'amor');
        }
        
        if (featuredOccasions.length > 0) {
            suggestions.push({
                type: 'occasions',
                title: 'Ocasiones especiales',
                items: featuredOccasions
            });
        }

        res.json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        console.error('Error obteniendo sugerencias:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener sugerencias',
            message: error.message
        });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'search',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
