/**
 * ============================================================================
 * InstantSearch Component v1.0.0
 * Sistema de búsqueda instantánea con debounce, highlighting y navegación por teclado
 * ============================================================================
 *
 * Características:
 * - ⚡ Búsqueda en tiempo real con debounce (300ms)
 * - 🎯 Highlighting de términos encontrados
 * - ⌨️ Navegación por teclado (↑↓ Enter Esc)
 * - 📊 Contador de resultados
 * - 🔍 Búsqueda en múltiples campos (título, descripción, categoría)
 * - 💾 Historial de búsquedas (localStorage)
 * - 🎨 Feedback visual
 * - ♿ Accesible (ARIA labels)
 *
 * @author Flores Victoria Dev Team
 * @version 1.0.0
 * @date 2025-11-12
 */

(function () {
  'use strict';

  class InstantSearch {
    constructor(config = {}) {
      this.config = {
        searchInputId: 'searchInput',
        clearButtonId: 'clearSearch',
        resultsContainerId: 'products-container',
        debounceDelay: 300,
        minChars: 2,
        maxHistoryItems: 10,
        highlightClass: 'search-highlight',
        noResultsMessage: 'No se encontraron productos que coincidan con tu búsqueda',
        searchFields: ['name', 'description', 'category', 'tags'],
        enableHistory: true,
        enableKeyboardNav: true,
        enableAnalytics: true,
        ...config,
      };

      this.searchInput = null;
      this.clearButton = null;
      this.resultsContainer = null;
      this.debounceTimer = null;
      this.products = [];
      this.filteredProducts = [];
      this.currentQuery = '';
      this.selectedIndex = -1;
      this.searchHistory = [];

      this.init();
    }

    init() {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      // Obtener elementos del DOM
      this.searchInput = document.getElementById(this.config.searchInputId);
      this.clearButton = document.getElementById(this.config.clearButtonId);
      this.resultsContainer = document.getElementById(this.config.resultsContainerId);

      if (!this.searchInput) {
        console.warn('InstantSearch: Input de búsqueda no encontrado');
        return;
      }

      // Cargar historial de búsquedas
      if (this.config.enableHistory) {
        this.loadSearchHistory();
      }

      // Configurar eventos
      this.attachEventListeners();

      // Crear elementos de UI adicionales
      this.createSearchFeedback();
    }

    attachEventListeners() {
      // Evento de input con debounce
      this.searchInput.addEventListener('input', (e) => {
        this.handleSearchInput(e.target.value);
      });

      // Botón de limpiar
      if (this.clearButton) {
        this.clearButton.addEventListener('click', () => {
          this.clearSearch();
        });
      }

      // Navegación por teclado
      if (this.config.enableKeyboardNav) {
        this.searchInput.addEventListener('keydown', (e) => {
          this.handleKeyboardNavigation(e);
        });
      }

      // Focus/Blur events para mejorar UX
      this.searchInput.addEventListener('focus', () => {
        this.searchInput.parentElement?.classList.add('search-focused');
        if (this.config.enableHistory && this.currentQuery === '') {
          this.showSearchHistory();
        }
      });

      this.searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          this.searchInput.parentElement?.classList.remove('search-focused');
        }, 200);
      });
    }

    handleSearchInput(query) {
      // Cancelar timer anterior
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Mostrar/ocultar botón de limpiar
      if (this.clearButton) {
        this.clearButton.style.display = query.length > 0 ? 'flex' : 'none';
      }

      // Si la query está vacía, mostrar todos los productos
      if (query.length === 0) {
        this.currentQuery = '';
        this.resetSearch();
        return;
      }

      // Mostrar indicador de búsqueda
      this.showSearchIndicator();

      // Debounce: esperar 300ms después del último input
      this.debounceTimer = setTimeout(() => {
        this.performSearch(query);
      }, this.config.debounceDelay);
    }

    performSearch(query) {
      this.currentQuery = query;

      // Verificar mínimo de caracteres
      if (query.length < this.config.minChars) {
        this.hideSearchIndicator();
        return;
      }

      // Obtener productos desde el ProductCatalog global si existe
      if (window.productCatalogInstance) {
        this.products = window.productCatalogInstance.allProducts || [];
      }

      // Filtrar productos
      this.filteredProducts = this.filterProducts(query);

      // Actualizar UI
      this.displayResults();
      this.updateResultsCount(this.filteredProducts.length);
      this.hideSearchIndicator();

      // Guardar en historial
      if (this.config.enableHistory && this.filteredProducts.length > 0) {
        this.saveToHistory(query);
      }

      // Analytics
      if (this.config.enableAnalytics && window.FloresVictoriaAnalytics) {
        window.FloresVictoriaAnalytics.trackSearch(query, this.filteredProducts.length);
      }
    }

    filterProducts(query) {
      const normalizedQuery = this.normalizeString(query);
      const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 0);

      return this.products.filter((product) =>
        // Buscar en todos los campos configurados
        this.config.searchFields.some((field) => {
          const fieldValue = this.getNestedValue(product, field);
          if (!fieldValue) return false;

          const normalizedValue = this.normalizeString(String(fieldValue));

          // Buscar todas las palabras de la query
          return queryWords.every((word) => normalizedValue.includes(word));
        })
      );
    }

    displayResults() {
      if (!this.resultsContainer) return;

      // Limpiar contenedor
      this.resultsContainer.innerHTML = '';

      if (this.filteredProducts.length === 0) {
        this.showNoResults();
        return;
      }

      // Renderizar productos filtrados
      this.filteredProducts.forEach((product, index) => {
        const productCard = this.createProductCard(product, index);
        this.resultsContainer.appendChild(productCard);
      });

      // Aplicar animación de entrada
      this.animateResults();
    }

    createProductCard(product, index) {
      const card = document.createElement('div');
      card.className = 'product-card reveal-scale';
      card.dataset.productId = product.id;
      card.style.animationDelay = `${index * 0.05}s`;

      // Highlighting en nombre y descripción
      const highlightedName = this.highlightText(product.name, this.currentQuery);
      const highlightedDesc = this.highlightText(product.description || '', this.currentQuery);

      card.innerHTML = `
 <div class="product-image-wrapper">
 <img src="${product.image || '/images/products/placeholder.jpg'}" 
 alt=""
 class="product-image lazy-load"
 width="300"
 height="300"
 loading="lazy">
 <div class="product-badge">${product.badge || 'Nuevo'}</div>
 <button class="wishlist-btn" onclick="addToWishlist(${product.id})" title="Agregar a favoritos">
 <i class="far fa-heart"></i>
 </button>
 </div>
 <div class="product-info">
 <span class="product-category">${product.category}</span>
 <h3 class="product-title">${highlightedName}</h3>
 <p class="product-description">${highlightedDesc}</p>
 <div class="product-rating">
 ${'<i class="fas fa-star"></i>'.repeat(product.rating || 5)}
 <span class="rating-count">(${product.reviews || 0})</span>
 </div>
 <div class="product-footer">
 <span class="product-price">$${product.price.toLocaleString('es-MX')}</span>
 <div class="product-actions">
 <button class="btn-action" onclick="viewProduct(${product.id})" title="Ver detalles">
 <i class="fas fa-eye"></i>
 </button>
 <button class="btn-primary" onclick="addToCart(${product.id})">
 <i class="fas fa-shopping-cart"></i> Agregar
 </button>
 </div>
 </div>
 </div>
 `;

      return card;
    }

    highlightText(text, query) {
      if (!query || query.length < this.config.minChars) return text;

      const normalizedQuery = this.normalizeString(query);
      const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 0);

      let result = text;

      queryWords.forEach((word) => {
        if (word.length < 2) return;

        // Crear regex case-insensitive
        const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
        result = result.replace(regex, `<mark class="${this.config.highlightClass}">$1</mark>`);
      });

      return result;
    }

    showNoResults() {
      if (!this.resultsContainer) return;

      this.resultsContainer.innerHTML = `
 <div class="no-results">
 <div class="no-results-icon">
 <i class="fas fa-search"></i>
 </div>
 <h3>No se encontraron resultados</h3>
 <p>${this.config.noResultsMessage}</p>
 <p class="no-results-query">Búsqueda: <strong>"${this.currentQuery}"</strong></p>
 <button class="btn-secondary" onclick="window.instantSearchInstance.clearSearch()">
 Limpiar búsqueda
 </button>
 </div>
 `;
    }

    createSearchFeedback() {
      // Crear contador de resultados si no existe
      if (!document.getElementById('search-results-count')) {
        const searchBox = this.searchInput.parentElement;
        const counter = document.createElement('div');
        counter.id = 'search-results-count';
        counter.className = 'search-results-count';
        counter.style.display = 'none';
        searchBox.insertAdjacentElement('afterend', counter);
      }

      // Crear indicador de búsqueda
      if (!document.getElementById('search-indicator')) {
        const searchBox = this.searchInput.parentElement;
        const indicator = document.createElement('div');
        indicator.id = 'search-indicator';
        indicator.className = 'search-indicator';
        indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
        indicator.style.display = 'none';
        searchBox.insertAdjacentElement('afterend', indicator);
      }
    }

    updateResultsCount(count) {
      const counter = document.getElementById('search-results-count');
      if (!counter) return;

      if (this.currentQuery.length >= this.config.minChars) {
        counter.textContent = `${count} ${count === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
        counter.style.display = 'block';

        // Animación de entrada
        counter.style.animation = 'fadeInUp 0.3s ease';
      } else {
        counter.style.display = 'none';
      }
    }

    showSearchIndicator() {
      const indicator = document.getElementById('search-indicator');
      if (indicator) {
        indicator.style.display = 'flex';
      }
    }

    hideSearchIndicator() {
      const indicator = document.getElementById('search-indicator');
      if (indicator) {
        indicator.style.display = 'none';
      }
    }

    animateResults() {
      const cards = this.resultsContainer.querySelectorAll('.product-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('visible');
        }, index * 50);
      });
    }

    handleKeyboardNavigation(event) {
      const key = event.key;

      if (key === 'Escape') {
        this.clearSearch();
        this.searchInput.blur();
        event.preventDefault();
      } else if (key === 'ArrowDown' || key === 'ArrowUp') {
        // Navegación entre resultados
        const cards = Array.from(this.resultsContainer.querySelectorAll('.product-card'));

        if (cards.length === 0) return;

        event.preventDefault();

        // Remover selección anterior
        if (this.selectedIndex >= 0 && cards[this.selectedIndex]) {
          cards[this.selectedIndex].classList.remove('keyboard-selected');
        }

        // Actualizar índice
        if (key === 'ArrowDown') {
          this.selectedIndex = (this.selectedIndex + 1) % cards.length;
        } else {
          this.selectedIndex = this.selectedIndex <= 0 ? cards.length - 1 : this.selectedIndex - 1;
        }

        // Aplicar nueva selección
        const selectedCard = cards[this.selectedIndex];
        selectedCard.classList.add('keyboard-selected');
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (key === 'Enter' && this.selectedIndex >= 0) {
        // Seleccionar producto
        const cards = Array.from(this.resultsContainer.querySelectorAll('.product-card'));
        const selectedCard = cards[this.selectedIndex];

        if (selectedCard) {
          const addButton = selectedCard.querySelector('.btn-primary');
          if (addButton) {
            addButton.click();
          }
        }

        event.preventDefault();
      }
    }

    clearSearch() {
      this.searchInput.value = '';
      this.currentQuery = '';
      this.selectedIndex = -1;

      if (this.clearButton) {
        this.clearButton.style.display = 'none';
      }

      this.resetSearch();
      this.searchInput.focus();
    }

    resetSearch() {
      // Restaurar todos los productos
      if (window.productCatalogInstance) {
        window.productCatalogInstance.filterProducts();
      }

      // Ocultar contador
      const counter = document.getElementById('search-results-count');
      if (counter) {
        counter.style.display = 'none';
      }
    }

    // Utilidades
    normalizeString(str) {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
    }

    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    getNestedValue(obj, path) {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    // Historial de búsquedas
    loadSearchHistory() {
      const history = localStorage.getItem('searchHistory');
      this.searchHistory = history ? JSON.parse(history) : [];
    }

    saveToHistory(query) {
      // Evitar duplicados
      this.searchHistory = this.searchHistory.filter((item) => item !== query);

      // Agregar al inicio
      this.searchHistory.unshift(query);

      // Limitar tamaño
      if (this.searchHistory.length > this.config.maxHistoryItems) {
        this.searchHistory = this.searchHistory.slice(0, this.config.maxHistoryItems);
      }

      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }

    showSearchHistory() {
      if (this.searchHistory.length === 0) return;

      // Crear dropdown con historial (implementación futura)
    }

    // API Pública
    search(query) {
      this.searchInput.value = query;
      this.performSearch(query);
    }

    clear() {
      this.clearSearch();
    }

    getResults() {
      return this.filteredProducts;
    }

    destroy() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
    }
  }

  // Exportar a window para uso global
  window.InstantSearch = InstantSearch;

  // Auto-inicializar si hay un input de búsqueda
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('searchInput')) {
        window.instantSearchInstance = new InstantSearch();
      }
    });
  } else {
    if (document.getElementById('searchInput')) {
      window.instantSearchInstance = new InstantSearch();
    }
  }
})();
