/**
 * Recommendations Widget - Flores Victoria
 * Sistema de recomendaciones de productos en el frontend
 */

class RecommendationsWidget {
    constructor() {
        this.apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';
        this.userId = this.getUserId();
        this.sessionId = this.getSessionId();
        
        this.init();
    }

    init() {
        console.log('📦 Iniciando widget de recomendaciones...');
        this.setupStyles();
        this.loadAllWidgets();
        this.setupTracking();
    }

    // ========================================================================
    // IDENTIFICACIÓN DE USUARIO
    // ========================================================================

    getUserId() {
        // Intentar obtener ID de usuario logueado
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || null;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('rec_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 12);
            sessionStorage.setItem('rec_session_id', sessionId);
        }
        return sessionId;
    }

    // ========================================================================
    // ESTILOS
    // ========================================================================

    setupStyles() {
        if (document.getElementById('recommendations-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'recommendations-styles';
        styles.textContent = `
            /* Recommendations Section */
            .rec-section {
                padding: 40px 20px;
                max-width: 1400px;
                margin: 0 auto;
            }

            .rec-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }

            .rec-header h2 {
                font-size: 1.5rem;
                color: #333;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .rec-header .view-all {
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .rec-header .view-all:hover {
                text-decoration: underline;
            }

            /* Products Grid */
            .rec-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 20px;
            }

            /* Horizontal Scroll for smaller sections */
            .rec-scroll {
                display: flex;
                gap: 20px;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 10px;
            }

            .rec-scroll::-webkit-scrollbar {
                height: 6px;
            }

            .rec-scroll::-webkit-scrollbar-track {
                background: #f0f0f0;
                border-radius: 3px;
            }

            .rec-scroll::-webkit-scrollbar-thumb {
                background: #ccc;
                border-radius: 3px;
            }

            .rec-scroll .rec-card {
                flex: 0 0 220px;
                scroll-snap-align: start;
            }

            /* Product Card */
            .rec-card {
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                transition: all 0.3s ease;
                position: relative;
            }

            .rec-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }

            .rec-card .image-container {
                position: relative;
                aspect-ratio: 1;
                overflow: hidden;
            }

            .rec-card img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s;
            }

            .rec-card:hover img {
                transform: scale(1.08);
            }

            .rec-card .badge {
                position: absolute;
                top: 10px;
                left: 10px;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                z-index: 2;
            }

            .rec-card .badge.discount {
                background: #ff6b6b;
                color: white;
            }

            .rec-card .badge.trending {
                background: #ffd93d;
                color: #333;
            }

            .rec-card .badge.new {
                background: #667eea;
                color: white;
            }

            .rec-card .quick-actions {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                opacity: 0;
                transform: translateX(10px);
                transition: all 0.3s;
            }

            .rec-card:hover .quick-actions {
                opacity: 1;
                transform: translateX(0);
            }

            .rec-card .quick-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: white;
                border: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .rec-card .quick-btn:hover {
                background: #ff6b9d;
                color: white;
            }

            .rec-card .content {
                padding: 15px;
            }

            .rec-card .name {
                font-weight: 600;
                color: #333;
                margin-bottom: 5px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .rec-card .reason {
                font-size: 0.8rem;
                color: #888;
                margin-bottom: 10px;
            }

            .rec-card .price-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .rec-card .price {
                font-size: 1.2rem;
                font-weight: bold;
                color: #333;
            }

            .rec-card .original-price {
                font-size: 0.9rem;
                color: #999;
                text-decoration: line-through;
            }

            .rec-card .rating {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 0.85rem;
                color: #666;
                margin-top: 8px;
            }

            .rec-card .rating .stars {
                color: #ffd93d;
            }

            .rec-card .add-to-cart {
                width: 100%;
                padding: 12px;
                margin-top: 12px;
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .rec-card .add-to-cart:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(196, 69, 105, 0.4);
            }

            /* Loading State */
            .rec-loading {
                display: flex;
                justify-content: center;
                padding: 40px;
            }

            .rec-loading .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f0f0f0;
                border-top-color: #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Empty State */
            .rec-empty {
                text-align: center;
                padding: 40px;
                color: #888;
            }

            .rec-empty .icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }

            /* Occasion Tags */
            .rec-occasions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 30px;
                justify-content: center;
            }

            .occasion-tag {
                padding: 10px 20px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.95rem;
            }

            .occasion-tag:hover {
                border-color: #667eea;
                background: #f0f4ff;
            }

            .occasion-tag.active {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-color: transparent;
            }

            /* Skeleton Loading */
            .rec-skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 16px;
            }

            .rec-skeleton.card {
                height: 320px;
            }

            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            /* Mini Widget (for product pages) */
            .rec-mini {
                background: #f8f9fa;
                border-radius: 16px;
                padding: 20px;
                margin: 20px 0;
            }

            .rec-mini h3 {
                font-size: 1.1rem;
                margin-bottom: 15px;
                color: #333;
            }

            .rec-mini .products {
                display: flex;
                gap: 15px;
                overflow-x: auto;
            }

            .rec-mini .mini-card {
                flex: 0 0 150px;
                background: white;
                border-radius: 12px;
                padding: 10px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
            }

            .rec-mini .mini-card:hover {
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }

            .rec-mini .mini-card img {
                width: 100%;
                aspect-ratio: 1;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 8px;
            }

            .rec-mini .mini-card .name {
                font-size: 0.85rem;
                color: #333;
                margin-bottom: 4px;
            }

            .rec-mini .mini-card .price {
                font-weight: bold;
                color: #c44569;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .rec-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }

                .rec-card .content {
                    padding: 12px;
                }

                .rec-card .name {
                    font-size: 0.9rem;
                }

                .rec-card .price {
                    font-size: 1rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // ========================================================================
    // CARGAR WIDGETS
    // ========================================================================

    async loadAllWidgets() {
        // Widget de recomendaciones personalizadas
        const personalizedContainer = document.getElementById('rec-personalized');
        if (personalizedContainer) {
            await this.loadPersonalized(personalizedContainer);
        }

        // Widget de trending
        const trendingContainer = document.getElementById('rec-trending');
        if (trendingContainer) {
            await this.loadTrending(trendingContainer);
        }

        // Widget de mejor valorados
        const topRatedContainer = document.getElementById('rec-top-rated');
        if (topRatedContainer) {
            await this.loadTopRated(topRatedContainer);
        }

        // Widget de ofertas
        const offersContainer = document.getElementById('rec-offers');
        if (offersContainer) {
            await this.loadOffers(offersContainer);
        }

        // Widget de ocasiones
        const occasionsContainer = document.getElementById('rec-occasions');
        if (occasionsContainer) {
            await this.loadOccasions(occasionsContainer);
        }

        // Widgets de producto (similar, bought together)
        const productId = this.getCurrentProductId();
        if (productId) {
            const similarContainer = document.getElementById('rec-similar');
            if (similarContainer) {
                await this.loadSimilar(similarContainer, productId);
            }

            const boughtTogetherContainer = document.getElementById('rec-bought-together');
            if (boughtTogetherContainer) {
                await this.loadBoughtTogether(boughtTogetherContainer, productId);
            }
        }
    }

    getCurrentProductId() {
        // Extraer del URL o data attribute
        const urlMatch = window.location.pathname.match(/\/producto\/(\w+)/);
        return urlMatch ? urlMatch[1] : document.body.dataset.productId;
    }

    // ========================================================================
    // CARGAR RECOMENDACIONES
    // ========================================================================

    async loadPersonalized(container) {
        container.innerHTML = this.getLoadingHTML();

        try {
            const response = await fetch(`${this.apiUrl}/recommendations/personalized?userId=${this.userId || this.sessionId}&limit=8`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                container.innerHTML = this.renderSection(
                    '✨ Recomendado para ti',
                    data.data,
                    '/catalogo?filter=personalized'
                );
            } else {
                container.innerHTML = '';
            }
        } catch (error) {
            console.error('Error loading personalized:', error);
            // Mostrar productos demo
            container.innerHTML = this.renderSection(
                '✨ Recomendado para ti',
                this.getDemoProducts(),
                '/catalogo'
            );
        }
    }

    async loadTrending(container) {
        container.innerHTML = this.getLoadingHTML();

        try {
            const response = await fetch(`${this.apiUrl}/recommendations/trending?limit=8`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                container.innerHTML = this.renderSection(
                    '🔥 Trending ahora',
                    data.data,
                    '/catalogo?sort=trending'
                );
            } else {
                container.innerHTML = this.renderSection(
                    '🔥 Trending ahora',
                    this.getDemoProducts(),
                    '/catalogo?sort=trending'
                );
            }
        } catch (error) {
            container.innerHTML = this.renderSection(
                '🔥 Trending ahora',
                this.getDemoProducts(),
                '/catalogo?sort=trending'
            );
        }
    }

    async loadTopRated(container) {
        try {
            const response = await fetch(`${this.apiUrl}/recommendations/top-rated?limit=6`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                container.innerHTML = this.renderSection(
                    '⭐ Los más valorados',
                    data.data,
                    '/catalogo?sort=rating'
                );
            }
        } catch (error) {
            container.innerHTML = this.renderSection(
                '⭐ Los más valorados',
                this.getDemoProducts().slice(0, 6),
                '/catalogo?sort=rating'
            );
        }
    }

    async loadOffers(container) {
        try {
            const response = await fetch(`${this.apiUrl}/recommendations/offers?userId=${this.userId || this.sessionId}&limit=4`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                container.innerHTML = this.renderSection(
                    '🏷️ Ofertas especiales',
                    data.data,
                    '/ofertas',
                    true // horizontal scroll
                );
            }
        } catch (error) {
            // Silent fail for offers
        }
    }

    async loadOccasions(container) {
        const occasions = [
            { id: 'cumpleanos', label: '🎂 Cumpleaños', emoji: '🎂' },
            { id: 'amor', label: '❤️ Amor', emoji: '❤️' },
            { id: 'agradecimiento', label: '🙏 Agradecimiento', emoji: '🙏' },
            { id: 'condolencias', label: '🕊️ Condolencias', emoji: '🕊️' },
            { id: 'recuperacion', label: '💪 Recuperación', emoji: '💪' }
        ];

        let html = `
            <div class="rec-section">
                <div class="rec-header">
                    <h2>🎁 Buscar por ocasión</h2>
                </div>
                <div class="rec-occasions">
                    ${occasions.map(o => `
                        <button class="occasion-tag" data-occasion="${o.id}">
                            ${o.label}
                        </button>
                    `).join('')}
                </div>
                <div id="occasion-products"></div>
            </div>
        `;

        container.innerHTML = html;

        // Setup click handlers
        container.querySelectorAll('.occasion-tag').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                container.querySelectorAll('.occasion-tag').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const productsContainer = document.getElementById('occasion-products');
                productsContainer.innerHTML = this.getLoadingHTML();

                try {
                    const response = await fetch(`${this.apiUrl}/recommendations/occasion/${e.target.dataset.occasion}?limit=8`);
                    const data = await response.json();

                    if (data.success && data.data.length > 0) {
                        productsContainer.innerHTML = `<div class="rec-grid">${data.data.map(p => this.renderProductCard(p)).join('')}</div>`;
                    } else {
                        productsContainer.innerHTML = `<div class="rec-grid">${this.getDemoProducts().map(p => this.renderProductCard(p)).join('')}</div>`;
                    }
                } catch (error) {
                    productsContainer.innerHTML = `<div class="rec-grid">${this.getDemoProducts().map(p => this.renderProductCard(p)).join('')}</div>`;
                }
            });
        });
    }

    async loadSimilar(container, productId) {
        try {
            const response = await fetch(`${this.apiUrl}/recommendations/similar/${productId}?limit=6`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                container.innerHTML = this.renderMiniWidget('También te puede gustar', data.data);
            }
        } catch (error) {
            container.innerHTML = this.renderMiniWidget('También te puede gustar', this.getDemoProducts().slice(0, 4));
        }
    }

    async loadBoughtTogether(container, productId) {
        try {
            const response = await fetch(`${this.apiUrl}/recommendations/bought-together/${productId}?limit=4`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                container.innerHTML = this.renderMiniWidget('Frecuentemente comprados juntos', data.data);
            }
        } catch (error) {
            // Silent fail
        }
    }

    // ========================================================================
    // RENDER HTML
    // ========================================================================

    renderSection(title, products, viewAllUrl, horizontal = false) {
        return `
            <div class="rec-section">
                <div class="rec-header">
                    <h2>${title}</h2>
                    <a href="${viewAllUrl}" class="view-all">
                        Ver todos <span>→</span>
                    </a>
                </div>
                <div class="${horizontal ? 'rec-scroll' : 'rec-grid'}">
                    ${products.map(p => this.renderProductCard(p)).join('')}
                </div>
            </div>
        `;
    }

    renderProductCard(product) {
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const discountPercent = hasDiscount 
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : 0;

        return `
            <div class="rec-card" data-product-id="${product.productId || product.id}">
                <div class="image-container">
                    ${hasDiscount ? `<span class="badge discount">-${discountPercent}%</span>` : ''}
                    ${product.reason?.includes('Trending') ? `<span class="badge trending">🔥 Trending</span>` : ''}
                    <img src="${product.image || '/images/placeholder-flower.jpg'}" 
                         alt="${product.name}" 
                         loading="lazy"
                         onerror="this.src='/images/placeholder-flower.jpg'">
                    <div class="quick-actions">
                        <button class="quick-btn" title="Agregar a favoritos" onclick="recWidget.addToFavorites('${product.productId || product.id}')">
                            ♡
                        </button>
                        <button class="quick-btn" title="Vista rápida" onclick="recWidget.quickView('${product.productId || product.id}')">
                            👁
                        </button>
                    </div>
                </div>
                <div class="content">
                    <div class="name">${product.name}</div>
                    ${product.reason ? `<div class="reason">${product.reason}</div>` : ''}
                    <div class="price-row">
                        <span class="price">$${(product.price || 0).toLocaleString('es-CL')}</span>
                        ${hasDiscount ? `<span class="original-price">$${product.originalPrice.toLocaleString('es-CL')}</span>` : ''}
                    </div>
                    ${product.rating ? `
                        <div class="rating">
                            <span class="stars">${'★'.repeat(Math.round(product.rating))}</span>
                            <span>${product.rating.toFixed(1)} (${product.reviewCount || 0})</span>
                        </div>
                    ` : ''}
                    <button class="add-to-cart" onclick="recWidget.addToCart('${product.productId || product.id}')">
                        🛒 Agregar al carrito
                    </button>
                </div>
            </div>
        `;
    }

    renderMiniWidget(title, products) {
        return `
            <div class="rec-mini">
                <h3>${title}</h3>
                <div class="products">
                    ${products.map(p => `
                        <div class="mini-card" onclick="window.location.href='/producto/${p.productId || p.id}'">
                            <img src="${p.image || '/images/placeholder-flower.jpg'}" alt="${p.name}">
                            <div class="name">${p.name}</div>
                            <div class="price">$${(p.price || 0).toLocaleString('es-CL')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getLoadingHTML() {
        return `
            <div class="rec-section">
                <div class="rec-grid">
                    ${Array(4).fill('<div class="rec-skeleton card"></div>').join('')}
                </div>
            </div>
        `;
    }

    getDemoProducts() {
        return [
            { productId: '1', name: 'Ramo de Rosas Rojas', price: 45000, image: '/images/products/roses.jpg', rating: 4.8, reviewCount: 124, reason: 'Recomendado para ti' },
            { productId: '2', name: 'Bouquet Primavera', price: 38000, image: '/images/products/spring.jpg', rating: 4.6, reviewCount: 89, reason: 'Popular' },
            { productId: '3', name: 'Orquídea Elegante', price: 55000, image: '/images/products/orchid.jpg', rating: 4.9, reviewCount: 56, reason: 'Mejor valorado' },
            { productId: '4', name: 'Girasoles Alegres', price: 32000, image: '/images/products/sunflowers.jpg', rating: 4.7, reviewCount: 102, reason: 'Trending' },
            { productId: '5', name: 'Tulipanes Holandeses', price: 42000, image: '/images/products/tulips.jpg', rating: 4.5, reviewCount: 67, reason: 'Recomendado' },
            { productId: '6', name: 'Mix Tropical', price: 48000, image: '/images/products/tropical.jpg', rating: 4.6, reviewCount: 45, reason: 'Nuevo' },
            { productId: '7', name: 'Ramo Romántico', price: 52000, originalPrice: 65000, image: '/images/products/romantic.jpg', rating: 4.8, reviewCount: 78, reason: '🏷️ -20%' },
            { productId: '8', name: 'Centro de Mesa', price: 35000, image: '/images/products/centerpiece.jpg', rating: 4.4, reviewCount: 33, reason: 'Ideal para eventos' }
        ];
    }

    // ========================================================================
    // TRACKING
    // ========================================================================

    setupTracking() {
        // Track de clicks en productos
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.rec-card');
            if (card) {
                const productId = card.dataset.productId;
                if (productId) {
                    this.trackView(productId);
                }
            }
        });
    }

    async trackView(productId) {
        try {
            await fetch(`${this.apiUrl}/recommendations/track/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    sessionId: this.sessionId,
                    productId,
                    source: 'recommendation'
                })
            });
        } catch (error) {
            // Silent fail
        }
    }

    // ========================================================================
    // ACCIONES
    // ========================================================================

    addToCart(productId) {
        console.log('Adding to cart:', productId);
        // Integrar con carrito
        window.dispatchEvent(new CustomEvent('addToCart', { detail: { productId } }));
        
        // Feedback visual
        this.showToast('Producto agregado al carrito');
    }

    addToFavorites(productId) {
        console.log('Adding to favorites:', productId);
        
        fetch(`${this.apiUrl}/recommendations/track/favorite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: this.userId || this.sessionId,
                productId,
                action: 'add'
            })
        });

        this.showToast('Agregado a favoritos ♡');
    }

    quickView(productId) {
        console.log('Quick view:', productId);
        // Mostrar modal de vista rápida
        window.dispatchEvent(new CustomEvent('quickView', { detail: { productId } }));
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
}

// Auto-inicializar
let recWidget;
document.addEventListener('DOMContentLoaded', () => {
    recWidget = new RecommendationsWidget();
});

window.RecommendationsWidget = RecommendationsWidget;
