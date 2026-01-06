/**
 * Product Recommendations Routes - Flores Victoria
 * Sistema de recomendaciones de productos
 */

const express = require('express');
const router = express.Router();

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const mockProducts = [
    {
        id: 'prod-001',
        name: 'Ramo de Rosas Rojas Premium',
        description: '12 rosas rojas ecuatorianas de tallo largo',
        price: 45000,
        category: 'ramos',
        rating: 4.8,
        reviewCount: 124,
        image: '/img/products/roses-red.jpg',
        tags: ['romántico', 'aniversario', 'amor'],
        salesCount: 450,
        inStock: true
    },
    {
        id: 'prod-002',
        name: 'Arreglo Primaveral',
        description: 'Mix de flores de temporada: tulipanes, margaritas y liliums',
        price: 38000,
        category: 'arreglos',
        rating: 4.6,
        reviewCount: 89,
        image: '/img/products/spring-mix.jpg',
        tags: ['colorido', 'cumpleaños', 'alegría'],
        salesCount: 320,
        inStock: true
    },
    {
        id: 'prod-003',
        name: 'Orquídea Phalaenopsis',
        description: 'Orquídea blanca en maceta decorativa',
        price: 52000,
        category: 'plantas',
        rating: 4.9,
        reviewCount: 67,
        image: '/img/products/orchid-white.jpg',
        tags: ['elegante', 'duradero', 'oficina'],
        salesCount: 180,
        inStock: true
    },
    {
        id: 'prod-004',
        name: 'Bouquet de Girasoles',
        description: '8 girasoles frescos con follaje verde',
        price: 32000,
        category: 'ramos',
        rating: 4.7,
        reviewCount: 156,
        image: '/img/products/sunflowers.jpg',
        tags: ['alegre', 'verano', 'felicidad'],
        salesCount: 380,
        inStock: true
    },
    {
        id: 'prod-005',
        name: 'Centro de Mesa Elegante',
        description: 'Arreglo bajo con rosas, hortensias y eucalipto',
        price: 48000,
        category: 'centros',
        rating: 4.5,
        reviewCount: 45,
        image: '/img/products/centerpiece.jpg',
        tags: ['eventos', 'matrimonio', 'elegante'],
        salesCount: 95,
        inStock: true
    },
    {
        id: 'prod-006',
        name: 'Ramo de Tulipanes Mixtos',
        description: '15 tulipanes en colores variados',
        price: 42000,
        category: 'ramos',
        rating: 4.8,
        reviewCount: 78,
        image: '/img/products/tulips-mix.jpg',
        tags: ['primavera', 'fresco', 'colorido'],
        salesCount: 220,
        inStock: true
    },
    {
        id: 'prod-007',
        name: 'Caja de Rosas Preservadas',
        description: '9 rosas eternas en caja de lujo',
        price: 75000,
        category: 'preservadas',
        rating: 4.9,
        reviewCount: 112,
        image: '/img/products/preserved-roses.jpg',
        tags: ['premium', 'duradero', 'regalo'],
        salesCount: 165,
        inStock: true
    },
    {
        id: 'prod-008',
        name: 'Arreglo de Condolencias',
        description: 'Arreglo de pie con liliums blancos y rosas',
        price: 85000,
        category: 'condolencias',
        rating: 4.7,
        reviewCount: 34,
        image: '/img/products/sympathy.jpg',
        tags: ['funeral', 'homenaje', 'blanco'],
        salesCount: 45,
        inStock: true
    }
];

// ============================================================================
// UTILIDADES
// ============================================================================

const formatProduct = (product) => ({
    ...product,
    formattedPrice: `$${product.price.toLocaleString('es-CL')} CLP`
});

// ============================================================================
// RUTAS
// ============================================================================

/**
 * GET /api/recommendations/trending
 * Obtiene productos en tendencia (más vendidos recientemente)
 */
router.get('/trending', (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 6;
    
    const trending = [...mockProducts]
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, limit)
        .map(formatProduct);

    res.json({
        success: true,
        data: trending,
        meta: {
            category: 'trending',
            count: trending.length,
            description: 'Productos más vendidos'
        }
    });
});

/**
 * GET /api/recommendations/top-rated
 * Obtiene productos mejor calificados
 */
router.get('/top-rated', (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 6;
    const minReviews = Number.parseInt(req.query.minReviews, 10) || 20;
    
    const topRated = [...mockProducts]
        .filter(p => p.reviewCount >= minReviews)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit)
        .map(formatProduct);

    res.json({
        success: true,
        data: topRated,
        meta: {
            category: 'top-rated',
            count: topRated.length,
            description: 'Productos mejor calificados'
        }
    });
});

/**
 * GET /api/recommendations/personalized
 * Recomendaciones personalizadas basadas en historial
 */
router.get('/personalized', (req, res) => {
    const userId = req.query.userId || 'guest';
    const limit = Number.parseInt(req.query.limit, 10) || 6;
    
    // Simulación de personalización
    // En producción, esto usaría historial de compras y navegación
    const personalized = [...mockProducts]
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
        .map(formatProduct);

    res.json({
        success: true,
        data: personalized,
        meta: {
            category: 'personalized',
            userId,
            count: personalized.length,
            description: 'Seleccionados especialmente para ti'
        }
    });
});

/**
 * GET /api/recommendations/similar/:productId
 * Productos similares a uno dado
 */
router.get('/similar/:productId', (req, res) => {
    const { productId } = req.params;
    const limit = Number.parseInt(req.query.limit, 10) || 4;
    
    const baseProduct = mockProducts.find(p => p.id === productId);
    
    if (!baseProduct) {
        // Si no encuentra el producto, devolver aleatorios
        const random = [...mockProducts]
            .sort(() => Math.random() - 0.5)
            .slice(0, limit)
            .map(formatProduct);
            
        return res.json({
            success: true,
            data: random,
            meta: {
                category: 'similar',
                baseProductId: productId,
                count: random.length,
                description: 'También te puede interesar'
            }
        });
    }
    
    // Encontrar productos con tags o categoría similar
    const similar = mockProducts
        .filter(p => p.id !== productId)
        .map(p => ({
            ...p,
            score: (p.category === baseProduct.category ? 3 : 0) +
                   p.tags.filter(t => baseProduct.tags.includes(t)).length
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(formatProduct);

    res.json({
        success: true,
        data: similar,
        meta: {
            category: 'similar',
            baseProduct: baseProduct.name,
            count: similar.length,
            description: 'Productos similares'
        }
    });
});

/**
 * GET /api/recommendations/bought-together/:productId
 * Frecuentemente comprados juntos
 */
router.get('/bought-together/:productId', (req, res) => {
    const { productId } = req.params;
    const limit = Number.parseInt(req.query.limit, 10) || 3;
    
    // Simulación de "bought together"
    // En producción, esto usaría datos reales de compras
    const complementary = mockProducts
        .filter(p => p.id !== productId)
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
        .map(formatProduct);

    res.json({
        success: true,
        data: complementary,
        meta: {
            category: 'bought-together',
            productId,
            count: complementary.length,
            description: 'Los clientes también compraron'
        }
    });
});

/**
 * GET /api/recommendations/occasion/:occasion
 * Recomendaciones por ocasión
 */
router.get('/occasion/:occasion', (req, res) => {
    const { occasion } = req.params;
    const limit = Number.parseInt(req.query.limit, 10) || 6;
    
    const occasionTags = {
        'aniversario': ['romántico', 'amor', 'elegante'],
        'cumpleaños': ['alegre', 'colorido', 'felicidad'],
        'condolencias': ['funeral', 'homenaje', 'blanco'],
        'matrimonio': ['elegante', 'eventos', 'romántico'],
        'san-valentin': ['romántico', 'amor', 'premium'],
        'dia-madre': ['amor', 'colorido', 'premium']
    };
    
    const relevantTags = occasionTags[occasion] || [];
    
    const recommended = mockProducts
        .map(p => ({
            ...p,
            score: p.tags.filter(t => relevantTags.includes(t)).length
        }))
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(formatProduct);

    res.json({
        success: true,
        data: recommended,
        meta: {
            category: 'occasion',
            occasion,
            count: recommended.length,
            description: `Perfectos para ${occasion.replace('-', ' ')}`
        }
    });
});

/**
 * GET /api/recommendations/new-arrivals
 * Nuevos productos
 */
router.get('/new-arrivals', (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 6;
    
    // Simulación de nuevos productos
    const newProducts = [...mockProducts]
        .slice(0, limit)
        .map(formatProduct);

    res.json({
        success: true,
        data: newProducts,
        meta: {
            category: 'new-arrivals',
            count: newProducts.length,
            description: 'Recién llegados'
        }
    });
});

/**
 * GET /api/recommendations/categories
 * Lista de categorías disponibles
 */
router.get('/categories', (req, res) => {
    const categories = [...new Set(mockProducts.map(p => p.category))];
    
    const categoryData = categories.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        productCount: mockProducts.filter(p => p.category === cat).length
    }));

    res.json({
        success: true,
        data: categoryData
    });
});

module.exports = router;
