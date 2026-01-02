/**
 * Servicio de Búsqueda Avanzada - Flores Victoria
 * Búsqueda con filtros, fuzzy matching y autocompletado
 */

const { v4: uuidv4 } = require('uuid');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const SEARCH_CONFIG = {
    maxResults: 100,
    defaultLimit: 20,
    minQueryLength: 2,
    fuzzyThreshold: 0.6, // 60% de similitud mínima
    autocompleteLimit: 8,
    highlightTag: 'mark',
    cacheTimeout: 300000, // 5 minutos
    popularSearchesLimit: 10
};

// Categorías de productos
const PRODUCT_CATEGORIES = [
    { id: 'ramos', name: 'Ramos', icon: '💐' },
    { id: 'arreglos', name: 'Arreglos Florales', icon: '🌸' },
    { id: 'bouquets', name: 'Bouquets', icon: '💮' },
    { id: 'rosas', name: 'Rosas', icon: '🌹' },
    { id: 'orquideas', name: 'Orquídeas', icon: '🪻' },
    { id: 'coronas', name: 'Coronas', icon: '🌻' },
    { id: 'plantas', name: 'Plantas', icon: '🪴' },
    { id: 'accesorios', name: 'Accesorios', icon: '🎀' }
];

// Ocasiones
const OCCASIONS = [
    { id: 'cumpleanos', name: 'Cumpleaños', keywords: ['cumple', 'birthday', 'aniversario'] },
    { id: 'amor', name: 'Amor y Romance', keywords: ['amor', 'romantico', 'pareja', 'novios'] },
    { id: 'condolencias', name: 'Condolencias', keywords: ['funeral', 'pesame', 'duelo'] },
    { id: 'madre', name: 'Día de la Madre', keywords: ['mama', 'madre', 'mamá'] },
    { id: 'graduacion', name: 'Graduación', keywords: ['graduacion', 'titulo', 'egreso'] },
    { id: 'nacimiento', name: 'Nacimiento', keywords: ['bebe', 'baby', 'nacimiento'] },
    { id: 'recuperacion', name: 'Pronta Recuperación', keywords: ['salud', 'hospital', 'recuperacion'] },
    { id: 'corporativo', name: 'Corporativo', keywords: ['empresa', 'oficina', 'negocio'] }
];

// Rangos de precio en CLP
const PRICE_RANGES = [
    { id: 'bajo', name: 'Hasta $20.000', min: 0, max: 20000 },
    { id: 'medio', name: '$20.000 - $40.000', min: 20000, max: 40000 },
    { id: 'alto', name: '$40.000 - $70.000', min: 40000, max: 70000 },
    { id: 'premium', name: 'Más de $70.000', min: 70000, max: Infinity }
];

// ============================================================================
// SERVICIO DE BÚSQUEDA
// ============================================================================

class SearchService {
    constructor() {
        this.searchHistory = new Map(); // userId -> searches[]
        this.popularSearches = [];
        this.searchCache = new Map();
        this.products = this.generateSampleProducts();
        
        // Actualizar búsquedas populares cada hora
        setInterval(() => this.updatePopularSearches(), 3600000);
    }

    // ========================================================================
    // BÚSQUEDA PRINCIPAL
    // ========================================================================

    /**
     * Búsqueda avanzada de productos
     */
    async search(params) {
        const {
            query = '',
            category = null,
            occasion = null,
            priceRange = null,
            minPrice = null,
            maxPrice = null,
            inStock = null,
            sortBy = 'relevance',
            sortOrder = 'desc',
            page = 1,
            limit = SEARCH_CONFIG.defaultLimit,
            userId = null
        } = params;

        const startTime = Date.now();
        
        // Verificar caché
        const cacheKey = JSON.stringify(params);
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
            return { ...cached, fromCache: true };
        }

        let results = [...this.products];

        // 1. Búsqueda por texto (fuzzy)
        if (query && query.length >= SEARCH_CONFIG.minQueryLength) {
            results = this.fuzzySearch(results, query);
            
            // Guardar en historial
            if (userId) {
                this.addToHistory(userId, query);
            }
            
            // Incrementar contador de búsqueda popular
            this.incrementPopularSearch(query);
        }

        // 2. Filtrar por categoría
        if (category) {
            results = results.filter(p => p.category === category);
        }

        // 3. Filtrar por ocasión
        if (occasion) {
            const occasionData = OCCASIONS.find(o => o.id === occasion);
            if (occasionData) {
                results = results.filter(p => 
                    p.occasions?.includes(occasion) ||
                    occasionData.keywords.some(kw => 
                        p.name.toLowerCase().includes(kw) ||
                        p.description?.toLowerCase().includes(kw)
                    )
                );
            }
        }

        // 4. Filtrar por rango de precio
        if (priceRange) {
            const range = PRICE_RANGES.find(r => r.id === priceRange);
            if (range) {
                results = results.filter(p => p.price >= range.min && p.price <= range.max);
            }
        } else if (minPrice !== null || maxPrice !== null) {
            results = results.filter(p => {
                const meetsMin = minPrice === null || p.price >= minPrice;
                const meetsMax = maxPrice === null || p.price <= maxPrice;
                return meetsMin && meetsMax;
            });
        }

        // 5. Filtrar por stock
        if (inStock !== null) {
            results = results.filter(p => inStock ? p.stock > 0 : p.stock === 0);
        }

        // 6. Ordenar
        results = this.sortResults(results, sortBy, sortOrder);

        // 7. Paginación
        const total = results.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedResults = results.slice(offset, offset + limit);

        // 8. Agregar highlights si hay query
        const highlightedResults = query 
            ? paginatedResults.map(p => this.addHighlights(p, query))
            : paginatedResults;

        // Construir respuesta
        const response = {
            success: true,
            data: {
                products: highlightedResults,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                query: {
                    original: query,
                    normalized: this.normalizeQuery(query),
                    suggestions: query ? await this.getSuggestions(query, results) : []
                },
                filters: {
                    applied: {
                        category,
                        occasion,
                        priceRange,
                        minPrice,
                        maxPrice,
                        inStock
                    },
                    available: this.getAvailableFilters(results)
                },
                meta: {
                    searchTime: Date.now() - startTime,
                    fromCache: false
                }
            }
        };

        // Guardar en caché
        this.cacheResult(cacheKey, response);

        return response;
    }

    // ========================================================================
    // FUZZY SEARCH
    // ========================================================================

    /**
     * Búsqueda fuzzy con scoring
     */
    fuzzySearch(products, query) {
        const normalizedQuery = this.normalizeQuery(query);
        const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 1);

        const scored = products.map(product => {
            const score = this.calculateRelevanceScore(product, queryWords, normalizedQuery);
            return { ...product, relevanceScore: score };
        });

        return scored
            .filter(p => p.relevanceScore >= SEARCH_CONFIG.fuzzyThreshold)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    /**
     * Calcular score de relevancia
     */
    calculateRelevanceScore(product, queryWords, fullQuery) {
        let score = 0;
        const maxScore = 100;

        const nameNorm = this.normalizeQuery(product.name);
        const descNorm = this.normalizeQuery(product.description || '');
        const tagsNorm = (product.tags || []).map(t => this.normalizeQuery(t)).join(' ');
        const categoryNorm = this.normalizeQuery(product.categoryName || '');

        // Match exacto en nombre: +40 puntos
        if (nameNorm.includes(fullQuery)) {
            score += 40;
        }

        // Match exacto al inicio del nombre: +20 puntos extra
        if (nameNorm.startsWith(fullQuery)) {
            score += 20;
        }

        // Match de palabras individuales
        queryWords.forEach(word => {
            // En nombre: +15 por palabra
            if (nameNorm.includes(word)) {
                score += 15;
            }
            
            // En descripción: +8 por palabra
            if (descNorm.includes(word)) {
                score += 8;
            }
            
            // En tags: +10 por palabra
            if (tagsNorm.includes(word)) {
                score += 10;
            }
            
            // En categoría: +12 por palabra
            if (categoryNorm.includes(word)) {
                score += 12;
            }

            // Fuzzy match con distancia de Levenshtein
            const fuzzyScore = this.fuzzyWordMatch(word, nameNorm);
            if (fuzzyScore > 0.7) {
                score += fuzzyScore * 10;
            }
        });

        // Bonus por producto popular (tiene ventas)
        if (product.salesCount > 0) {
            score += Math.min(product.salesCount / 10, 10);
        }

        // Bonus por producto con buena calificación
        if (product.rating >= 4.5) {
            score += 5;
        }

        // Normalizar a 0-1
        return Math.min(score / maxScore, 1);
    }

    /**
     * Match fuzzy de una palabra usando distancia de Levenshtein
     */
    fuzzyWordMatch(word, text) {
        const words = text.split(/\s+/);
        let bestScore = 0;

        words.forEach(textWord => {
            if (textWord.length < 2) return;
            
            const distance = this.levenshteinDistance(word, textWord);
            const maxLen = Math.max(word.length, textWord.length);
            const similarity = 1 - (distance / maxLen);
            
            if (similarity > bestScore) {
                bestScore = similarity;
            }
        });

        return bestScore;
    }

    /**
     * Distancia de Levenshtein
     */
    levenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    // ========================================================================
    // AUTOCOMPLETADO
    // ========================================================================

    /**
     * Obtener sugerencias de autocompletado
     */
    async getAutocomplete(query, limit = SEARCH_CONFIG.autocompleteLimit) {
        if (!query || query.length < SEARCH_CONFIG.minQueryLength) {
            return { suggestions: [] };
        }

        const normalizedQuery = this.normalizeQuery(query);
        const suggestions = [];

        // 1. Sugerencias de productos
        const productSuggestions = this.products
            .filter(p => this.normalizeQuery(p.name).includes(normalizedQuery))
            .slice(0, 5)
            .map(p => ({
                type: 'product',
                text: p.name,
                category: p.categoryName,
                price: p.price,
                image: p.thumbnail
            }));

        suggestions.push(...productSuggestions);

        // 2. Sugerencias de categorías
        const categorySuggestions = PRODUCT_CATEGORIES
            .filter(c => this.normalizeQuery(c.name).includes(normalizedQuery))
            .map(c => ({
                type: 'category',
                text: c.name,
                icon: c.icon,
                id: c.id
            }));

        suggestions.push(...categorySuggestions);

        // 3. Sugerencias de ocasiones
        const occasionSuggestions = OCCASIONS
            .filter(o => 
                this.normalizeQuery(o.name).includes(normalizedQuery) ||
                o.keywords.some(kw => kw.includes(normalizedQuery))
            )
            .map(o => ({
                type: 'occasion',
                text: o.name,
                id: o.id
            }));

        suggestions.push(...occasionSuggestions);

        // 4. Búsquedas populares que coincidan
        const popularSuggestions = this.popularSearches
            .filter(s => this.normalizeQuery(s.query).includes(normalizedQuery))
            .slice(0, 3)
            .map(s => ({
                type: 'popular',
                text: s.query,
                count: s.count
            }));

        suggestions.push(...popularSuggestions);

        return {
            query,
            suggestions: suggestions.slice(0, limit)
        };
    }

    // ========================================================================
    // HISTORIAL Y POPULARES
    // ========================================================================

    /**
     * Agregar búsqueda al historial del usuario
     */
    addToHistory(userId, query) {
        if (!this.searchHistory.has(userId)) {
            this.searchHistory.set(userId, []);
        }

        const history = this.searchHistory.get(userId);
        
        // Evitar duplicados consecutivos
        if (history.length > 0 && history[0].query === query) {
            return;
        }

        history.unshift({
            query,
            timestamp: new Date()
        });

        // Mantener últimas 20 búsquedas
        if (history.length > 20) {
            history.pop();
        }
    }

    /**
     * Obtener historial de búsquedas del usuario
     */
    getSearchHistory(userId, limit = 10) {
        const history = this.searchHistory.get(userId) || [];
        return history.slice(0, limit);
    }

    /**
     * Limpiar historial del usuario
     */
    clearSearchHistory(userId) {
        this.searchHistory.delete(userId);
    }

    /**
     * Incrementar contador de búsqueda popular
     */
    incrementPopularSearch(query) {
        const normalizedQuery = this.normalizeQuery(query);
        const existing = this.popularSearches.find(
            s => this.normalizeQuery(s.query) === normalizedQuery
        );

        if (existing) {
            existing.count++;
            existing.lastSearched = new Date();
        } else {
            this.popularSearches.push({
                query,
                count: 1,
                lastSearched: new Date()
            });
        }
    }

    /**
     * Obtener búsquedas populares
     */
    getPopularSearches(limit = SEARCH_CONFIG.popularSearchesLimit) {
        return [...this.popularSearches]
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * Actualizar lista de búsquedas populares
     */
    updatePopularSearches() {
        // Filtrar búsquedas con más de una semana de antigüedad
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        this.popularSearches = this.popularSearches
            .filter(s => s.lastSearched > oneWeekAgo)
            .sort((a, b) => b.count - a.count)
            .slice(0, 100);
    }

    // ========================================================================
    // FILTROS Y FACETAS
    // ========================================================================

    /**
     * Obtener filtros disponibles basados en resultados
     */
    getAvailableFilters(products) {
        // Categorías con conteo
        const categories = {};
        products.forEach(p => {
            if (p.category) {
                categories[p.category] = (categories[p.category] || 0) + 1;
            }
        });

        // Rangos de precio con conteo
        const priceRanges = {};
        PRICE_RANGES.forEach(range => {
            const count = products.filter(
                p => p.price >= range.min && p.price <= range.max
            ).length;
            if (count > 0) {
                priceRanges[range.id] = count;
            }
        });

        // Ocasiones con conteo
        const occasions = {};
        products.forEach(p => {
            (p.occasions || []).forEach(occ => {
                occasions[occ] = (occasions[occ] || 0) + 1;
            });
        });

        // Stock
        const stockCounts = {
            inStock: products.filter(p => p.stock > 0).length,
            outOfStock: products.filter(p => p.stock === 0).length
        };

        return {
            categories: PRODUCT_CATEGORIES
                .filter(c => categories[c.id])
                .map(c => ({ ...c, count: categories[c.id] })),
            priceRanges: PRICE_RANGES
                .filter(r => priceRanges[r.id])
                .map(r => ({ ...r, count: priceRanges[r.id] })),
            occasions: OCCASIONS
                .filter(o => occasions[o.id])
                .map(o => ({ ...o, count: occasions[o.id] })),
            stock: stockCounts,
            priceStats: {
                min: Math.min(...products.map(p => p.price)),
                max: Math.max(...products.map(p => p.price)),
                avg: Math.round(products.reduce((s, p) => s + p.price, 0) / products.length)
            }
        };
    }

    // ========================================================================
    // SUGERENCIAS Y CORRECCIONES
    // ========================================================================

    /**
     * Obtener sugerencias de búsqueda
     */
    async getSuggestions(query, currentResults) {
        const suggestions = [];

        // Si hay pocos resultados, sugerir alternativas
        if (currentResults.length < 3) {
            // Sugerir categorías relacionadas
            const relatedCategories = PRODUCT_CATEGORIES.filter(c => {
                const catNorm = this.normalizeQuery(c.name);
                const queryNorm = this.normalizeQuery(query);
                return catNorm.includes(queryNorm.substring(0, 3)) ||
                       queryNorm.includes(catNorm.substring(0, 3));
            });

            if (relatedCategories.length > 0) {
                suggestions.push({
                    type: 'category',
                    message: 'Quizás te interese:',
                    items: relatedCategories.slice(0, 3).map(c => c.name)
                });
            }

            // Sugerir corrección ortográfica
            const correction = this.suggestCorrection(query);
            if (correction && correction !== query) {
                suggestions.push({
                    type: 'correction',
                    message: `¿Quisiste decir "${correction}"?`,
                    corrected: correction
                });
            }
        }

        // Sugerir búsquedas relacionadas
        const relatedSearches = this.getRelatedSearches(query);
        if (relatedSearches.length > 0) {
            suggestions.push({
                type: 'related',
                message: 'Búsquedas relacionadas:',
                items: relatedSearches
            });
        }

        return suggestions;
    }

    /**
     * Sugerir corrección ortográfica
     */
    suggestCorrection(query) {
        const commonMisspellings = {
            'rosas': ['rozas', 'rrosas', 'rosaz'],
            'ramo': ['rramo', 'rammo'],
            'flores': ['flres', 'floress', 'florres'],
            'orquideas': ['orkideas', 'orqideas', 'horquideas'],
            'tulipanes': ['tulipanez', 'tulipaness'],
            'bouquet': ['buquet', 'buque', 'bouqet'],
            'arreglo': ['arregllo', 'areglo', 'arregglo'],
            'girasoles': ['jirasoles', 'girasolez'],
            'cumpleaños': ['cumpleanos', 'cumpleanios']
        };

        const normalizedQuery = this.normalizeQuery(query);
        
        for (const [correct, misspellings] of Object.entries(commonMisspellings)) {
            if (misspellings.includes(normalizedQuery)) {
                return correct;
            }
        }

        // Buscar palabra más similar en el catálogo
        const allWords = new Set();
        this.products.forEach(p => {
            this.normalizeQuery(p.name).split(/\s+/).forEach(w => {
                if (w.length > 2) allWords.add(w);
            });
        });

        let bestMatch = null;
        let bestScore = 0;

        allWords.forEach(word => {
            const score = this.fuzzyWordMatch(normalizedQuery, word);
            if (score > bestScore && score > 0.7 && score < 1) {
                bestScore = score;
                bestMatch = word;
            }
        });

        return bestMatch;
    }

    /**
     * Obtener búsquedas relacionadas
     */
    getRelatedSearches(query) {
        const queryNorm = this.normalizeQuery(query);
        
        // Buscar en populares
        return this.popularSearches
            .filter(s => {
                const searchNorm = this.normalizeQuery(s.query);
                return searchNorm !== queryNorm && 
                       (searchNorm.includes(queryNorm.substring(0, 3)) ||
                        queryNorm.includes(searchNorm.substring(0, 3)));
            })
            .slice(0, 5)
            .map(s => s.query);
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    /**
     * Normalizar query (minúsculas, sin acentos, etc)
     */
    normalizeQuery(query) {
        if (!query) return '';
        return query
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '')
            .trim();
    }

    /**
     * Agregar highlights al resultado
     */
    addHighlights(product, query) {
        const queryWords = this.normalizeQuery(query).split(/\s+/).filter(w => w.length > 1);
        const tag = SEARCH_CONFIG.highlightTag;

        let highlightedName = product.name;
        let highlightedDescription = product.description || '';

        queryWords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedName = highlightedName.replace(regex, `<${tag}>$1</${tag}>`);
            highlightedDescription = highlightedDescription.replace(regex, `<${tag}>$1</${tag}>`);
        });

        return {
            ...product,
            highlightedName,
            highlightedDescription
        };
    }

    /**
     * Ordenar resultados
     */
    sortResults(products, sortBy, sortOrder) {
        const sortFunctions = {
            relevance: (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0),
            price: (a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price,
            name: (a, b) => sortOrder === 'asc' 
                ? a.name.localeCompare(b.name, 'es') 
                : b.name.localeCompare(a.name, 'es'),
            rating: (a, b) => (b.rating || 0) - (a.rating || 0),
            newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            bestseller: (a, b) => (b.salesCount || 0) - (a.salesCount || 0)
        };

        const sortFn = sortFunctions[sortBy] || sortFunctions.relevance;
        return [...products].sort(sortFn);
    }

    /**
     * Cache de resultados
     */
    getCachedResult(key) {
        const cached = this.searchCache.get(key);
        if (cached && Date.now() - cached.timestamp < SEARCH_CONFIG.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    cacheResult(key, data) {
        this.searchCache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Limpiar caché antigua
        if (this.searchCache.size > 100) {
            const oldestKey = this.searchCache.keys().next().value;
            this.searchCache.delete(oldestKey);
        }
    }

    // ========================================================================
    // DATOS DE EJEMPLO
    // ========================================================================

    generateSampleProducts() {
        return [
            {
                id: 'p1',
                name: 'Ramo Primaveral',
                description: 'Hermoso ramo con flores de temporada en tonos pasteles. Perfecto para sorprender.',
                category: 'ramos',
                categoryName: 'Ramos',
                price: 25000,
                stock: 15,
                rating: 4.8,
                reviewCount: 124,
                salesCount: 456,
                occasions: ['cumpleanos', 'amor'],
                tags: ['primavera', 'colorido', 'alegre', 'regalo'],
                thumbnail: '/images/ramo-primaveral.jpg',
                createdAt: '2024-01-15'
            },
            {
                id: 'p2',
                name: 'Rosas Rojas Premium (12 unidades)',
                description: 'Docena de rosas rojas ecuatorianas de tallo largo. El clásico regalo de amor.',
                category: 'rosas',
                categoryName: 'Rosas',
                price: 35000,
                stock: 25,
                rating: 4.9,
                reviewCount: 287,
                salesCount: 892,
                occasions: ['amor', 'cumpleanos'],
                tags: ['romantico', 'clasico', 'elegante', 'san valentin'],
                thumbnail: '/images/rosas-rojas.jpg',
                createdAt: '2024-01-10'
            },
            {
                id: 'p3',
                name: 'Arreglo Romántico Corazón',
                description: 'Arreglo en forma de corazón con rosas rojas y blancas. Ideal para aniversarios.',
                category: 'arreglos',
                categoryName: 'Arreglos Florales',
                price: 55000,
                stock: 8,
                rating: 4.7,
                reviewCount: 89,
                salesCount: 234,
                occasions: ['amor'],
                tags: ['corazon', 'romantico', 'aniversario', 'especial'],
                thumbnail: '/images/arreglo-corazon.jpg',
                createdAt: '2024-02-01'
            },
            {
                id: 'p4',
                name: 'Bouquet Elegante Blanco',
                description: 'Elegante bouquet de novia con rosas blancas, lisianthus y follaje verde.',
                category: 'bouquets',
                categoryName: 'Bouquets',
                price: 65000,
                stock: 5,
                rating: 5.0,
                reviewCount: 45,
                salesCount: 78,
                occasions: ['amor'],
                tags: ['boda', 'novia', 'blanco', 'elegante'],
                thumbnail: '/images/bouquet-blanco.jpg',
                createdAt: '2024-01-20'
            },
            {
                id: 'p5',
                name: 'Orquídea Phalaenopsis',
                description: 'Hermosa orquídea blanca en maceta decorativa. Planta de larga duración.',
                category: 'orquideas',
                categoryName: 'Orquídeas',
                price: 45000,
                stock: 12,
                rating: 4.6,
                reviewCount: 67,
                salesCount: 145,
                occasions: ['corporativo', 'madre'],
                tags: ['planta', 'duradera', 'elegante', 'oficina'],
                thumbnail: '/images/orquidea.jpg',
                createdAt: '2024-02-10'
            },
            {
                id: 'p6',
                name: 'Corona Fúnebre Clásica',
                description: 'Corona tradicional con rosas blancas y follaje. Expresión de condolencias.',
                category: 'coronas',
                categoryName: 'Coronas',
                price: 75000,
                stock: 3,
                rating: 4.8,
                reviewCount: 34,
                salesCount: 89,
                occasions: ['condolencias'],
                tags: ['funeral', 'condolencias', 'clasico', 'solemne'],
                thumbnail: '/images/corona-funebre.jpg',
                createdAt: '2024-01-05'
            },
            {
                id: 'p7',
                name: 'Ramo Girasoles Felicidad',
                description: 'Alegre ramo de girasoles con margaritas. Ideal para alegrar cualquier día.',
                category: 'ramos',
                categoryName: 'Ramos',
                price: 28000,
                stock: 18,
                rating: 4.7,
                reviewCount: 156,
                salesCount: 378,
                occasions: ['cumpleanos', 'recuperacion'],
                tags: ['girasoles', 'alegre', 'amarillo', 'energia'],
                thumbnail: '/images/girasoles.jpg',
                createdAt: '2024-02-15'
            },
            {
                id: 'p8',
                name: 'Arreglo Día de la Madre',
                description: 'Especial arreglo con rosas, lirios y astromelias en tonos rosados.',
                category: 'arreglos',
                categoryName: 'Arreglos Florales',
                price: 42000,
                stock: 20,
                rating: 4.9,
                reviewCount: 203,
                salesCount: 567,
                occasions: ['madre', 'cumpleanos'],
                tags: ['mama', 'rosado', 'especial', 'lirios'],
                thumbnail: '/images/dia-madre.jpg',
                createdAt: '2024-03-01'
            },
            {
                id: 'p9',
                name: 'Tulipanes Holandeses Mix',
                description: 'Ramo de 15 tulipanes holandeses en colores variados. Frescura garantizada.',
                category: 'ramos',
                categoryName: 'Ramos',
                price: 38000,
                stock: 10,
                rating: 4.8,
                reviewCount: 98,
                salesCount: 234,
                occasions: ['cumpleanos', 'amor'],
                tags: ['tulipanes', 'holandeses', 'colorido', 'primavera'],
                thumbnail: '/images/tulipanes.jpg',
                createdAt: '2024-02-20'
            },
            {
                id: 'p10',
                name: 'Planta Suculenta Decorativa',
                description: 'Set de 3 suculentas en maceteros de cerámica. Bajo mantenimiento.',
                category: 'plantas',
                categoryName: 'Plantas',
                price: 18000,
                stock: 30,
                rating: 4.5,
                reviewCount: 178,
                salesCount: 456,
                occasions: ['corporativo', 'nacimiento'],
                tags: ['suculentas', 'facil', 'decoracion', 'moderno'],
                thumbnail: '/images/suculentas.jpg',
                createdAt: '2024-01-25'
            },
            {
                id: 'p11',
                name: 'Caja de Rosas Preservadas',
                description: 'Elegante caja con 9 rosas preservadas. Duran más de 1 año sin agua.',
                category: 'rosas',
                categoryName: 'Rosas',
                price: 89000,
                stock: 6,
                rating: 4.9,
                reviewCount: 67,
                salesCount: 123,
                occasions: ['amor', 'cumpleanos'],
                tags: ['preservadas', 'lujo', 'eternas', 'caja'],
                thumbnail: '/images/rosas-preservadas.jpg',
                createdAt: '2024-03-05'
            },
            {
                id: 'p12',
                name: 'Canasta Frutal con Flores',
                description: 'Canasta con frutas frescas de temporada y arreglo floral. Delicioso regalo.',
                category: 'arreglos',
                categoryName: 'Arreglos Florales',
                price: 52000,
                stock: 7,
                rating: 4.6,
                reviewCount: 89,
                salesCount: 167,
                occasions: ['recuperacion', 'nacimiento'],
                tags: ['frutas', 'canasta', 'saludable', 'hospital'],
                thumbnail: '/images/canasta-frutal.jpg',
                createdAt: '2024-02-28'
            }
        ];
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    SearchService,
    SEARCH_CONFIG,
    PRODUCT_CATEGORIES,
    OCCASIONS,
    PRICE_RANGES
};
