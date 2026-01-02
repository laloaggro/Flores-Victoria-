/**
 * Componente de Búsqueda Avanzada - Flores Victoria
 * Widget de búsqueda con autocompletado y filtros
 */

class FloresVictoriaSearch {
    constructor(options = {}) {
        this.options = {
            apiBaseUrl: options.apiBaseUrl || '/api/search',
            containerSelector: options.containerSelector || '#search-container',
            minQueryLength: options.minQueryLength || 2,
            debounceTime: options.debounceTime || 300,
            maxSuggestions: options.maxSuggestions || 8,
            showFilters: options.showFilters !== false,
            showHistory: options.showHistory !== false,
            onSearch: options.onSearch || null,
            onProductClick: options.onProductClick || null
        };

        this.state = {
            query: '',
            results: [],
            suggestions: [],
            filters: {},
            appliedFilters: {},
            isLoading: false,
            isOpen: false,
            pagination: null
        };

        this.debounceTimer = null;
        this.init();
    }

    // ========================================================================
    // INICIALIZACIÓN
    // ========================================================================

    async init() {
        await this.loadFilters();
        this.render();
        this.bindEvents();
    }

    async loadFilters() {
        try {
            const response = await fetch(`${this.options.apiBaseUrl}/filters`);
            const result = await response.json();
            if (result.success) {
                this.state.filters = result.data;
            }
        } catch (error) {
            console.error('Error cargando filtros:', error);
        }
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    render() {
        const container = document.querySelector(this.options.containerSelector);
        if (!container) {
            console.error('Contenedor de búsqueda no encontrado:', this.options.containerSelector);
            return;
        }

        container.innerHTML = `
            <div class="fv-search-wrapper">
                <!-- Barra de búsqueda -->
                <div class="fv-search-bar">
                    <div class="fv-search-input-wrapper">
                        <i class="fv-search-icon">🔍</i>
                        <input 
                            type="text" 
                            class="fv-search-input" 
                            placeholder="Buscar flores, ramos, arreglos..."
                            autocomplete="off"
                        >
                        <button class="fv-search-clear" style="display: none;">✕</button>
                    </div>
                    <button class="fv-search-button">Buscar</button>
                </div>

                <!-- Dropdown de sugerencias -->
                <div class="fv-search-dropdown" style="display: none;">
                    <div class="fv-search-suggestions"></div>
                </div>

                <!-- Filtros -->
                ${this.options.showFilters ? this.renderFiltersBar() : ''}

                <!-- Resultados -->
                <div class="fv-search-results" style="display: none;">
                    <div class="fv-results-header">
                        <span class="fv-results-count"></span>
                        <div class="fv-results-sort">
                            <label>Ordenar por:</label>
                            <select class="fv-sort-select">
                                <option value="relevance">Relevancia</option>
                                <option value="price-asc">Precio: menor a mayor</option>
                                <option value="price-desc">Precio: mayor a menor</option>
                                <option value="rating">Mejor calificados</option>
                                <option value="newest">Más recientes</option>
                                <option value="bestseller">Más vendidos</option>
                            </select>
                        </div>
                    </div>
                    <div class="fv-results-grid"></div>
                    <div class="fv-results-pagination"></div>
                </div>
            </div>
        `;

        this.injectStyles();
    }

    renderFiltersBar() {
        return `
            <div class="fv-filters-bar">
                <div class="fv-filter-tags">
                    <span class="fv-filter-label">Filtros:</span>
                    <div class="fv-applied-filters"></div>
                </div>
                <div class="fv-quick-filters">
                    <div class="fv-filter-group">
                        <select class="fv-filter-select" data-filter="category">
                            <option value="">Categoría</option>
                        </select>
                    </div>
                    <div class="fv-filter-group">
                        <select class="fv-filter-select" data-filter="occasion">
                            <option value="">Ocasión</option>
                        </select>
                    </div>
                    <div class="fv-filter-group">
                        <select class="fv-filter-select" data-filter="priceRange">
                            <option value="">Precio</option>
                        </select>
                    </div>
                    <button class="fv-filter-clear" style="display: none;">Limpiar filtros</button>
                </div>
            </div>
        `;
    }

    populateFilters() {
        const { categories, occasions, priceRanges } = this.state.filters;

        // Categorías
        const categorySelect = document.querySelector('.fv-filter-select[data-filter="category"]');
        if (categorySelect && categories) {
            categories.forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
            });
        }

        // Ocasiones
        const occasionSelect = document.querySelector('.fv-filter-select[data-filter="occasion"]');
        if (occasionSelect && occasions) {
            occasions.forEach(occ => {
                occasionSelect.innerHTML += `<option value="${occ.id}">${occ.name}</option>`;
            });
        }

        // Precios
        const priceSelect = document.querySelector('.fv-filter-select[data-filter="priceRange"]');
        if (priceSelect && priceRanges) {
            priceRanges.forEach(range => {
                priceSelect.innerHTML += `<option value="${range.id}">${range.name}</option>`;
            });
        }
    }

    // ========================================================================
    // EVENTOS
    // ========================================================================

    bindEvents() {
        const wrapper = document.querySelector('.fv-search-wrapper');
        if (!wrapper) return;

        const input = wrapper.querySelector('.fv-search-input');
        const searchBtn = wrapper.querySelector('.fv-search-button');
        const clearBtn = wrapper.querySelector('.fv-search-clear');
        const dropdown = wrapper.querySelector('.fv-search-dropdown');
        const sortSelect = wrapper.querySelector('.fv-sort-select');
        const filterSelects = wrapper.querySelectorAll('.fv-filter-select');
        const clearFiltersBtn = wrapper.querySelector('.fv-filter-clear');

        // Input events
        input.addEventListener('input', (e) => this.handleInput(e));
        input.addEventListener('focus', () => this.showDropdown());
        input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Click fuera para cerrar dropdown
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // Botón buscar
        searchBtn.addEventListener('click', () => this.executeSearch());

        // Botón limpiar
        clearBtn.addEventListener('click', () => this.clearSearch());

        // Ordenamiento
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.handleSortChange(e));
        }

        // Filtros
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => this.handleFilterChange(e));
        });

        // Limpiar filtros
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Poblar filtros
        this.populateFilters();
    }

    handleInput(e) {
        const query = e.target.value;
        this.state.query = query;

        // Mostrar/ocultar botón limpiar
        const clearBtn = document.querySelector('.fv-search-clear');
        clearBtn.style.display = query ? 'block' : 'none';

        // Debounce para autocompletado
        clearTimeout(this.debounceTimer);
        if (query.length >= this.options.minQueryLength) {
            this.debounceTimer = setTimeout(() => {
                this.fetchSuggestions(query);
            }, this.options.debounceTime);
        } else {
            this.showDefaultSuggestions();
        }
    }

    handleKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.executeSearch();
        } else if (e.key === 'Escape') {
            this.hideDropdown();
        }
    }

    handleSortChange(e) {
        const value = e.target.value;
        let sortBy = 'relevance';
        let sortOrder = 'desc';

        if (value === 'price-asc') {
            sortBy = 'price';
            sortOrder = 'asc';
        } else if (value === 'price-desc') {
            sortBy = 'price';
            sortOrder = 'desc';
        } else {
            sortBy = value;
        }

        this.state.appliedFilters.sortBy = sortBy;
        this.state.appliedFilters.sortOrder = sortOrder;
        this.executeSearch();
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        const value = e.target.value;

        if (value) {
            this.state.appliedFilters[filter] = value;
        } else {
            delete this.state.appliedFilters[filter];
        }

        this.updateAppliedFiltersUI();
        this.executeSearch();
    }

    clearFilters() {
        this.state.appliedFilters = {};
        document.querySelectorAll('.fv-filter-select').forEach(select => {
            select.value = '';
        });
        this.updateAppliedFiltersUI();
        this.executeSearch();
    }

    clearSearch() {
        this.state.query = '';
        this.state.results = [];
        document.querySelector('.fv-search-input').value = '';
        document.querySelector('.fv-search-clear').style.display = 'none';
        document.querySelector('.fv-search-results').style.display = 'none';
        this.hideDropdown();
    }

    // ========================================================================
    // AUTOCOMPLETADO
    // ========================================================================

    async fetchSuggestions(query) {
        try {
            const response = await fetch(
                `${this.options.apiBaseUrl}/autocomplete?q=${encodeURIComponent(query)}&limit=${this.options.maxSuggestions}`
            );
            const result = await response.json();

            if (result.success) {
                this.state.suggestions = result.data.suggestions;
                this.renderSuggestions();
            }
        } catch (error) {
            console.error('Error obteniendo sugerencias:', error);
        }
    }

    async showDefaultSuggestions() {
        // Mostrar historial y populares
        try {
            const response = await fetch(`${this.options.apiBaseUrl}/suggestions`);
            const result = await response.json();

            if (result.success) {
                this.renderDefaultSuggestions(result.data);
            }
        } catch (error) {
            console.error('Error obteniendo sugerencias default:', error);
        }
    }

    renderSuggestions() {
        const container = document.querySelector('.fv-search-suggestions');
        if (!container) return;

        if (this.state.suggestions.length === 0) {
            container.innerHTML = '<div class="fv-no-suggestions">No se encontraron sugerencias</div>';
        } else {
            container.innerHTML = this.state.suggestions.map(suggestion => {
                switch (suggestion.type) {
                    case 'product':
                        return `
                            <div class="fv-suggestion fv-suggestion-product" data-type="product" data-value="${suggestion.text}">
                                ${suggestion.image ? `<img src="${suggestion.image}" alt="" class="fv-suggestion-image">` : ''}
                                <div class="fv-suggestion-content">
                                    <span class="fv-suggestion-text">${suggestion.text}</span>
                                    <span class="fv-suggestion-meta">${suggestion.category} • ${this.formatCurrency(suggestion.price)}</span>
                                </div>
                            </div>
                        `;
                    case 'category':
                        return `
                            <div class="fv-suggestion fv-suggestion-category" data-type="category" data-value="${suggestion.id}">
                                <span class="fv-suggestion-icon">${suggestion.icon}</span>
                                <span class="fv-suggestion-text">${suggestion.text}</span>
                                <span class="fv-suggestion-badge">Categoría</span>
                            </div>
                        `;
                    case 'occasion':
                        return `
                            <div class="fv-suggestion fv-suggestion-occasion" data-type="occasion" data-value="${suggestion.id}">
                                <span class="fv-suggestion-icon">🎁</span>
                                <span class="fv-suggestion-text">${suggestion.text}</span>
                                <span class="fv-suggestion-badge">Ocasión</span>
                            </div>
                        `;
                    case 'popular':
                        return `
                            <div class="fv-suggestion fv-suggestion-popular" data-type="search" data-value="${suggestion.text}">
                                <span class="fv-suggestion-icon">🔥</span>
                                <span class="fv-suggestion-text">${suggestion.text}</span>
                                <span class="fv-suggestion-meta">${suggestion.count} búsquedas</span>
                            </div>
                        `;
                    default:
                        return `
                            <div class="fv-suggestion" data-type="search" data-value="${suggestion.text}">
                                <span class="fv-suggestion-text">${suggestion.text}</span>
                            </div>
                        `;
                }
            }).join('');
        }

        this.showDropdown();
        this.bindSuggestionEvents();
    }

    renderDefaultSuggestions(suggestions) {
        const container = document.querySelector('.fv-search-suggestions');
        if (!container) return;

        let html = '';

        suggestions.forEach(section => {
            html += `<div class="fv-suggestion-section">`;
            html += `<div class="fv-suggestion-title">${section.title}</div>`;

            if (section.type === 'categories') {
                html += section.items.map(cat => `
                    <div class="fv-suggestion fv-suggestion-category" data-type="category" data-value="${cat.id}">
                        <span class="fv-suggestion-icon">${cat.icon}</span>
                        <span class="fv-suggestion-text">${cat.name}</span>
                    </div>
                `).join('');
            } else {
                html += section.items.map(item => `
                    <div class="fv-suggestion" data-type="search" data-value="${typeof item === 'string' ? item : item.name}">
                        <span class="fv-suggestion-icon">${section.type === 'history' ? '🕐' : '🔥'}</span>
                        <span class="fv-suggestion-text">${typeof item === 'string' ? item : item.name}</span>
                    </div>
                `).join('');
            }

            html += `</div>`;
        });

        container.innerHTML = html || '<div class="fv-no-suggestions">Escribe para buscar</div>';
        this.bindSuggestionEvents();
    }

    bindSuggestionEvents() {
        document.querySelectorAll('.fv-suggestion').forEach(el => {
            el.addEventListener('click', () => {
                const type = el.dataset.type;
                const value = el.dataset.value;

                if (type === 'category') {
                    this.state.appliedFilters.category = value;
                    document.querySelector('.fv-filter-select[data-filter="category"]').value = value;
                    this.updateAppliedFiltersUI();
                    this.executeSearch();
                } else if (type === 'occasion') {
                    this.state.appliedFilters.occasion = value;
                    document.querySelector('.fv-filter-select[data-filter="occasion"]').value = value;
                    this.updateAppliedFiltersUI();
                    this.executeSearch();
                } else {
                    document.querySelector('.fv-search-input').value = value;
                    this.state.query = value;
                    this.executeSearch();
                }

                this.hideDropdown();
            });
        });
    }

    showDropdown() {
        const dropdown = document.querySelector('.fv-search-dropdown');
        if (dropdown) {
            dropdown.style.display = 'block';
            this.state.isOpen = true;
        }
    }

    hideDropdown() {
        const dropdown = document.querySelector('.fv-search-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            this.state.isOpen = false;
        }
    }

    // ========================================================================
    // BÚSQUEDA
    // ========================================================================

    async executeSearch(page = 1) {
        this.hideDropdown();
        this.state.isLoading = true;
        this.showLoading();

        try {
            const params = new URLSearchParams();
            
            if (this.state.query) {
                params.set('q', this.state.query);
            }
            
            Object.entries(this.state.appliedFilters).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });

            params.set('page', page);
            params.set('limit', 12);

            const response = await fetch(`${this.options.apiBaseUrl}?${params}`);
            const result = await response.json();

            if (result.success) {
                this.state.results = result.data.products;
                this.state.pagination = result.data.pagination;
                this.renderResults(result.data);

                if (this.options.onSearch) {
                    this.options.onSearch(result.data);
                }
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showError('Error al realizar la búsqueda');
        } finally {
            this.state.isLoading = false;
        }
    }

    // ========================================================================
    // RESULTADOS
    // ========================================================================

    renderResults(data) {
        const resultsContainer = document.querySelector('.fv-search-results');
        const countEl = document.querySelector('.fv-results-count');
        const gridEl = document.querySelector('.fv-results-grid');
        const paginationEl = document.querySelector('.fv-results-pagination');

        if (!resultsContainer) return;

        resultsContainer.style.display = 'block';

        // Contador
        countEl.textContent = `${data.pagination.total} resultado${data.pagination.total !== 1 ? 's' : ''}`;

        // Grid de productos
        if (data.products.length === 0) {
            gridEl.innerHTML = `
                <div class="fv-no-results">
                    <span class="fv-no-results-icon">🔍</span>
                    <h3>No encontramos resultados</h3>
                    <p>Intenta con otros términos o ajusta los filtros</p>
                    ${data.query.suggestions.length > 0 ? `
                        <div class="fv-suggestions-inline">
                            ${data.query.suggestions.map(s => `
                                <span class="fv-suggestion-inline" onclick="floresVictoriaSearch.applySuggestion('${s.corrected || s.items?.[0] || ''}')">${s.message}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            gridEl.innerHTML = data.products.map(product => this.renderProductCard(product)).join('');
            this.bindProductEvents();
        }

        // Paginación
        this.renderPagination(data.pagination, paginationEl);
    }

    renderProductCard(product) {
        return `
            <div class="fv-product-card" data-product-id="${product.id}">
                <div class="fv-product-image">
                    <img src="${product.thumbnail || '/images/placeholder.jpg'}" alt="${product.name}" loading="lazy">
                    ${product.stock === 0 ? '<span class="fv-badge fv-badge-sold-out">Agotado</span>' : ''}
                    ${product.relevanceScore > 0.8 ? '<span class="fv-badge fv-badge-match">Mejor coincidencia</span>' : ''}
                </div>
                <div class="fv-product-info">
                    <h3 class="fv-product-name">${product.highlightedName || product.name}</h3>
                    <p class="fv-product-category">${product.categoryName}</p>
                    <div class="fv-product-rating">
                        ${this.renderStars(product.rating)}
                        <span class="fv-rating-count">(${product.reviewCount})</span>
                    </div>
                    <div class="fv-product-price">${this.formatCurrency(product.price)}</div>
                    <button class="fv-add-to-cart" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Sin stock' : '🛒 Agregar'}
                    </button>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }

    renderPagination(pagination, container) {
        if (pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<div class="fv-pagination">';

        // Anterior
        if (pagination.hasPrev) {
            html += `<button class="fv-page-btn" data-page="${pagination.page - 1}">← Anterior</button>`;
        }

        // Páginas
        const maxPages = 5;
        const startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
        const endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="fv-page-btn ${i === pagination.page ? 'fv-page-active' : ''}" data-page="${i}">${i}</button>`;
        }

        // Siguiente
        if (pagination.hasNext) {
            html += `<button class="fv-page-btn" data-page="${pagination.page + 1}">Siguiente →</button>`;
        }

        html += '</div>';
        container.innerHTML = html;

        // Eventos
        container.querySelectorAll('.fv-page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                this.executeSearch(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    bindProductEvents() {
        document.querySelectorAll('.fv-product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('fv-add-to-cart')) return;
                
                const productId = card.dataset.productId;
                const product = this.state.results.find(p => p.id === productId);
                
                if (this.options.onProductClick) {
                    this.options.onProductClick(product);
                } else {
                    window.location.href = `/producto/${productId}`;
                }
            });

            const addBtn = card.querySelector('.fv-add-to-cart');
            if (addBtn && !addBtn.disabled) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productId = card.dataset.productId;
                    this.addToCart(productId);
                });
            }
        });
    }

    // ========================================================================
    // UTILIDADES
    // ========================================================================

    updateAppliedFiltersUI() {
        const container = document.querySelector('.fv-applied-filters');
        const clearBtn = document.querySelector('.fv-filter-clear');
        
        if (!container) return;

        const filters = Object.entries(this.state.appliedFilters)
            .filter(([key]) => !['sortBy', 'sortOrder'].includes(key));

        if (filters.length === 0) {
            container.innerHTML = '';
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }

        container.innerHTML = filters.map(([key, value]) => {
            let label = value;
            
            // Obtener nombre legible
            if (key === 'category') {
                const cat = this.state.filters.categories?.find(c => c.id === value);
                label = cat ? `${cat.icon} ${cat.name}` : value;
            } else if (key === 'occasion') {
                const occ = this.state.filters.occasions?.find(o => o.id === value);
                label = occ ? occ.name : value;
            } else if (key === 'priceRange') {
                const range = this.state.filters.priceRanges?.find(r => r.id === value);
                label = range ? range.name : value;
            }

            return `
                <span class="fv-filter-tag">
                    ${label}
                    <button class="fv-filter-tag-remove" data-filter="${key}">✕</button>
                </span>
            `;
        }).join('');

        // Eventos para remover filtros individuales
        container.querySelectorAll('.fv-filter-tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const filter = btn.dataset.filter;
                delete this.state.appliedFilters[filter];
                document.querySelector(`.fv-filter-select[data-filter="${filter}"]`).value = '';
                this.updateAppliedFiltersUI();
                this.executeSearch();
            });
        });

        if (clearBtn) clearBtn.style.display = 'inline-block';
    }

    showLoading() {
        const grid = document.querySelector('.fv-results-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="fv-loading">
                    <div class="fv-spinner"></div>
                    <p>Buscando...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const grid = document.querySelector('.fv-results-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="fv-error">
                    <span>⚠️</span>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    addToCart(productId) {
        // Dispatch evento para que el carrito lo maneje
        window.dispatchEvent(new CustomEvent('addToCart', {
            detail: { productId, quantity: 1 }
        }));

        // Feedback visual
        const btn = document.querySelector(`[data-product-id="${productId}"] .fv-add-to-cart`);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✓ Agregado';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1500);
        }
    }

    applySuggestion(text) {
        if (text) {
            document.querySelector('.fv-search-input').value = text;
            this.state.query = text;
            this.executeSearch();
        }
    }

    // ========================================================================
    // ESTILOS
    // ========================================================================

    injectStyles() {
        if (document.getElementById('fv-search-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'fv-search-styles';
        styles.textContent = `
            .fv-search-wrapper {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
            }

            /* Barra de búsqueda */
            .fv-search-bar {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }

            .fv-search-input-wrapper {
                flex: 1;
                position: relative;
                display: flex;
                align-items: center;
            }

            .fv-search-icon {
                position: absolute;
                left: 15px;
                font-size: 1.2rem;
            }

            .fv-search-input {
                width: 100%;
                padding: 12px 40px;
                border: 2px solid #e0e0e0;
                border-radius: 25px;
                font-size: 1rem;
                transition: border-color 0.3s;
            }

            .fv-search-input:focus {
                outline: none;
                border-color: #d63384;
            }

            .fv-search-clear {
                position: absolute;
                right: 15px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                color: #999;
            }

            .fv-search-button {
                padding: 12px 25px;
                background: linear-gradient(135deg, #d63384, #6f42c1);
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                transition: transform 0.2s, box-shadow 0.2s;
            }

            .fv-search-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(214, 51, 132, 0.4);
            }

            /* Dropdown */
            .fv-search-dropdown {
                position: absolute;
                width: 100%;
                max-width: 600px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                z-index: 1000;
                max-height: 400px;
                overflow-y: auto;
            }

            .fv-suggestion {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 15px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .fv-suggestion:hover {
                background: #f8f9fa;
            }

            .fv-suggestion-icon {
                font-size: 1.2rem;
            }

            .fv-suggestion-image {
                width: 40px;
                height: 40px;
                object-fit: cover;
                border-radius: 8px;
            }

            .fv-suggestion-text {
                flex: 1;
                font-weight: 500;
            }

            .fv-suggestion-meta {
                font-size: 0.85rem;
                color: #666;
            }

            .fv-suggestion-badge {
                background: #e9ecef;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.75rem;
            }

            .fv-suggestion-section {
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
                margin-bottom: 10px;
            }

            .fv-suggestion-title {
                font-size: 0.8rem;
                color: #666;
                padding: 10px 15px 5px;
                font-weight: 600;
            }

            /* Filtros */
            .fv-filters-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
            }

            .fv-quick-filters {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .fv-filter-select {
                padding: 8px 15px;
                border: 1px solid #ddd;
                border-radius: 20px;
                background: white;
                cursor: pointer;
            }

            .fv-filter-tags {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }

            .fv-filter-tag {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: #d63384;
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.85rem;
            }

            .fv-filter-tag-remove {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 0.8rem;
            }

            .fv-filter-clear {
                background: none;
                border: 1px solid #dc3545;
                color: #dc3545;
                padding: 8px 15px;
                border-radius: 20px;
                cursor: pointer;
            }

            /* Resultados */
            .fv-search-results {
                margin-top: 20px;
            }

            .fv-results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .fv-results-count {
                font-weight: 600;
                color: #333;
            }

            .fv-results-sort {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .fv-sort-select {
                padding: 8px 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
            }

            .fv-results-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }

            /* Producto */
            .fv-product-card {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                transition: transform 0.3s, box-shadow 0.3s;
                cursor: pointer;
            }

            .fv-product-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            }

            .fv-product-image {
                position: relative;
                padding-top: 100%;
            }

            .fv-product-image img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .fv-badge {
                position: absolute;
                top: 10px;
                left: 10px;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
            }

            .fv-badge-sold-out {
                background: #dc3545;
                color: white;
            }

            .fv-badge-match {
                background: #28a745;
                color: white;
            }

            .fv-product-info {
                padding: 15px;
            }

            .fv-product-name {
                font-size: 1rem;
                margin: 0 0 5px;
                color: #333;
            }

            .fv-product-name mark {
                background: rgba(214, 51, 132, 0.2);
                color: #d63384;
            }

            .fv-product-category {
                font-size: 0.85rem;
                color: #666;
                margin: 0 0 8px;
            }

            .fv-product-rating {
                color: #ffc107;
                margin-bottom: 8px;
            }

            .fv-rating-count {
                color: #999;
                font-size: 0.85rem;
            }

            .fv-product-price {
                font-size: 1.2rem;
                font-weight: 700;
                color: #d63384;
                margin-bottom: 10px;
            }

            .fv-add-to-cart {
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #d63384, #6f42c1);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: opacity 0.3s;
            }

            .fv-add-to-cart:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            .fv-add-to-cart:hover:not(:disabled) {
                opacity: 0.9;
            }

            /* Sin resultados */
            .fv-no-results {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .fv-no-results-icon {
                font-size: 4rem;
                display: block;
                margin-bottom: 20px;
            }

            /* Paginación */
            .fv-pagination {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 30px;
            }

            .fv-page-btn {
                padding: 10px 15px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .fv-page-btn:hover {
                border-color: #d63384;
                color: #d63384;
            }

            .fv-page-active {
                background: #d63384;
                color: white;
                border-color: #d63384;
            }

            /* Loading */
            .fv-loading {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px;
            }

            .fv-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #d63384;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Responsive */
            @media (max-width: 768px) {
                .fv-search-bar {
                    flex-direction: column;
                }

                .fv-search-button {
                    width: 100%;
                }

                .fv-filters-bar {
                    flex-direction: column;
                }

                .fv-results-header {
                    flex-direction: column;
                    gap: 10px;
                }

                .fv-results-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.FloresVictoriaSearch = FloresVictoriaSearch;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloresVictoriaSearch;
}
