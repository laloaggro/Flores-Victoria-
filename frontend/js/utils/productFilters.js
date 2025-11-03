/**
 * Gestión de filtros avanzados para productos de florería
 * Maneja filtrado por ocasión, precio, color y entrega
 */

export class ProductFilters {
  constructor() {
    this.filters = {
      occasion: '',
      category: '',
      priceRange: null,
      color: '',
      expressDelivery: false,
      search: '',
    };

    this.activeFilters = [];
    this.onFilterChange = null;
  }

  /**
   * Inicializa los event listeners de los filtros
   */
  init() {
    this.setupOccasionFilter();
    this.setupCategoryFilter();
    this.setupPriceFilter();
    this.setupColorFilter();
    this.setupDeliveryFilter();
    this.setupClearFilters();
  }

  /**
   * Filtro de ocasión
   */
  setupOccasionFilter() {
    const occasionSelect = document.getElementById('occasion-filter');
    if (!occasionSelect) return;

    occasionSelect.addEventListener('change', (e) => {
      this.filters.occasion = e.target.value;
      this.updateActiveFilters('occasion', e.target.value, e.target.selectedOptions[0]?.text);
      this.triggerFilterChange();
    });
  }

  /**
   * Filtro de categoría
   */
  setupCategoryFilter() {
    const categorySelect = document.getElementById('category-filter');
    if (!categorySelect) return;

    categorySelect.addEventListener('change', (e) => {
      this.filters.category = e.target.value;
      this.updateActiveFilters('category', e.target.value, e.target.selectedOptions[0]?.text);
      this.triggerFilterChange();
    });
  }

  /**
   * Filtro de precio
   */
  setupPriceFilter() {
    const priceButtons = document.querySelectorAll('.price-range button');

    priceButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        // Remover active de todos los botones
        priceButtons.forEach((btn) => btn.classList.remove('active'));

        // Agregar active al botón clickeado
        button.classList.add('active');

        const range = button.dataset.range;
        const [min, max] = range.split('-').map(Number);
        this.filters.priceRange = { min, max };

        this.updateActiveFilters('price', range, button.textContent);
        this.triggerFilterChange();
      });
    });
  }

  /**
   * Filtro de color
   */
  setupColorFilter() {
    const colorChips = document.querySelectorAll('.color-chip');

    colorChips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        // Toggle active state
        const wasActive = chip.classList.contains('active');

        // Remover active de todos los chips
        colorChips.forEach((c) => c.classList.remove('active'));

        if (!wasActive) {
          chip.classList.add('active');
          this.filters.color = chip.dataset.color;
          this.updateActiveFilters('color', chip.dataset.color, chip.title);
        } else {
          this.filters.color = '';
          this.removeActiveFilter('color');
        }

        this.triggerFilterChange();
      });
    });
  }

  /**
   * Filtro de entrega express
   */
  setupDeliveryFilter() {
    const expressCheckbox = document.getElementById('express-delivery');
    if (!expressCheckbox) return;

    expressCheckbox.addEventListener('change', (e) => {
      this.filters.expressDelivery = e.target.checked;

      if (e.target.checked) {
        this.updateActiveFilters('delivery', 'express', '⚡ Entrega express');
      } else {
        this.removeActiveFilter('delivery');
      }

      this.triggerFilterChange();
    });
  }

  /**
   * Limpiar todos los filtros
   */
  setupClearFilters() {
    // Se creará dinámicamente cuando haya filtros activos
  }

  /**
   * Actualiza la visualización de filtros activos
   */
  updateActiveFilters(type, value, label) {
    if (!value) {
      this.removeActiveFilter(type);
      return;
    }

    // Remover filtro existente del mismo tipo
    this.activeFilters = this.activeFilters.filter((f) => f.type !== type);

    // Agregar nuevo filtro
    this.activeFilters.push({ type, value, label });

    this.renderActiveFilters();
  }

  /**
   * Remueve un filtro activo
   */
  removeActiveFilter(type) {
    this.activeFilters = this.activeFilters.filter((f) => f.type !== type);
    this.renderActiveFilters();
  }

  /**
   * Renderiza los filtros activos
   */
  renderActiveFilters() {
    const container = document.getElementById('active-filters');
    if (!container) return;

    if (this.activeFilters.length === 0) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = 'flex';

    const tags = this.activeFilters
      .map(
        (filter) => `
      <span class="filter-tag">
        ${filter.label}
        <button onclick="window.productFilters.clearFilter('${filter.type}')" aria-label="Eliminar filtro">×</button>
      </span>
    `
      )
      .join('');

    const clearAllButton = `
      <button class="clear-filters" onclick="window.productFilters.clearAllFilters()">
        Limpiar todo
      </button>
    `;

    container.innerHTML = tags + clearAllButton;
  }

  /**
   * Limpia un filtro específico
   */
  clearFilter(type) {
    switch (type) {
      case 'occasion':
        const occasionSelect = document.getElementById('occasion-filter');
        if (occasionSelect) occasionSelect.value = '';
        this.filters.occasion = '';
        break;

      case 'category':
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) categorySelect.value = '';
        this.filters.category = '';
        break;

      case 'price':
        document
          .querySelectorAll('.price-range button')
          .forEach((btn) => btn.classList.remove('active'));
        this.filters.priceRange = null;
        break;

      case 'color':
        document.querySelectorAll('.color-chip').forEach((chip) => chip.classList.remove('active'));
        this.filters.color = '';
        break;

      case 'delivery':
        const expressCheckbox = document.getElementById('express-delivery');
        if (expressCheckbox) expressCheckbox.checked = false;
        this.filters.expressDelivery = false;
        break;
    }

    this.removeActiveFilter(type);
    this.triggerFilterChange();
  }

  /**
   * Limpia todos los filtros
   */
  clearAllFilters() {
    // Resetear selects
    const occasionSelect = document.getElementById('occasion-filter');
    const categorySelect = document.getElementById('category-filter');
    if (occasionSelect) occasionSelect.value = '';
    if (categorySelect) categorySelect.value = '';

    // Resetear botones de precio
    document
      .querySelectorAll('.price-range button')
      .forEach((btn) => btn.classList.remove('active'));

    // Resetear color chips
    document.querySelectorAll('.color-chip').forEach((chip) => chip.classList.remove('active'));

    // Resetear checkbox
    const expressCheckbox = document.getElementById('express-delivery');
    if (expressCheckbox) expressCheckbox.checked = false;

    // Resetear estado
    this.filters = {
      occasion: '',
      category: '',
      priceRange: null,
      color: '',
      expressDelivery: false,
      search: '',
    };

    this.activeFilters = [];
    this.renderActiveFilters();
    this.triggerFilterChange();
  }

  /**
   * Aplica los filtros a un array de productos
   */
  applyFilters(products) {
    let filtered = [...products];

    // Filtro por ocasión
    if (this.filters.occasion) {
      filtered = filtered.filter((product) =>
        product.occasions?.some((occ) =>
          occ.toLowerCase().includes(this.filters.occasion.toLowerCase())
        )
      );
    }

    // Filtro por categoría
    if (this.filters.category) {
      filtered = filtered.filter((product) =>
        product.category?.toLowerCase().includes(this.filters.category.toLowerCase())
      );
    }

    // Filtro por precio
    if (this.filters.priceRange) {
      const { min, max } = this.filters.priceRange;
      filtered = filtered.filter((product) => product.price >= min && product.price <= max);
    }

    // Filtro por color
    if (this.filters.color) {
      filtered = filtered.filter((product) =>
        product.colors?.some((color) =>
          color.toLowerCase().includes(this.filters.color.toLowerCase())
        )
      );
    }

    // Filtro por entrega express
    if (this.filters.expressDelivery) {
      filtered = filtered.filter(
        (product) =>
          product.delivery_time?.includes('2-4') || product.delivery_time?.includes('express')
      );
    }

    // Filtro por búsqueda
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.flowers?.some((flower) => flower.toLowerCase().includes(search))
      );
    }

    return filtered;
  }

  /**
   * Establece el callback para cambios de filtro
   */
  onChange(callback) {
    this.onFilterChange = callback;
  }

  /**
   * Dispara el evento de cambio de filtro
   */
  triggerFilterChange() {
    if (this.onFilterChange) {
      this.onFilterChange(this.filters);
    }
  }

  /**
   * Actualiza el filtro de búsqueda
   */
  setSearchTerm(term) {
    this.filters.search = term;
    this.triggerFilterChange();
  }

  /**
   * Obtiene los filtros actuales
   */
  getFilters() {
    return { ...this.filters };
  }

  /**
   * Obtiene estadísticas de productos filtrados
   */
  getStats(products) {
    const filtered = this.applyFilters(products);

    return {
      total: products.length,
      filtered: filtered.length,
      priceRange: {
        min: Math.min(...filtered.map((p) => p.price)),
        max: Math.max(...filtered.map((p) => p.price)),
      },
      categories: [...new Set(filtered.map((p) => p.category))].length,
      colors: [...new Set(filtered.flatMap((p) => p.colors || []))].length,
    };
  }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.ProductFilters = ProductFilters;
  window.productFilters = new ProductFilters();
}
