// ProductFilters.js - Componente web para filtros avanzados de productos

class ProductFilters extends HTMLElement {
  constructor() {
    super();
    this.products = [];
    this.filteredProducts = [];
    this.currentFilters = {
      category: '',
      priceRange: [0, 100000],
      sortBy: 'name',
    };
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
            <div class="product-filters">
                <div class="filters-header">
                    <h3>Filtros</h3>
                    <button id="clear-filters" class="clear-filters-btn">Limpiar filtros</button>
                </div>
                
                <div class="filter-group">
                    <h4>Categoría</h4>
                    <select id="category-filter" class="filter-select">
                        <option value="">Todas las categorías</option>
                        <option value="ramos">Ramos</option>
                        <option value="arreglos">Arreglos</option>
                        <option value="centros">Centros de mesa</option>
                        <option value="bodas">Bodas</option>
                        <option value="eventos">Eventos</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <h4>Rango de precio</h4>
                    <div class="price-range">
                        <span id="min-price-value">$0</span>
                        <input type="range" id="price-range" min="0" max="100000" value="100000" step="1000">
                        <span id="max-price-value">$100.000</span>
                    </div>
                </div>
                
                <div class="filter-group">
                    <h4>Ordenar por</h4>
                    <select id="sort-by" class="filter-select">
                        <option value="name">Nombre</option>
                        <option value="price-low">Precio: Menor a Mayor</option>
                        <option value="price-high">Precio: Mayor a Menor</option>
                        <option value="newest">Más recientes</option>
                    </select>
                </div>
            </div>
        `;
  }

  setupEventListeners() {
    const categoryFilter = this.querySelector('#category-filter');
    const priceRange = this.querySelector('#price-range');
    const sortBy = this.querySelector('#sort-by');
    const clearFiltersBtn = this.querySelector('#clear-filters');

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentFilters.category = e.target.value;
        this.dispatchEvent(
          new CustomEvent('filtersChanged', {
            detail: this.currentFilters,
          })
        );
      });
    }

    if (priceRange) {
      priceRange.addEventListener('input', (e) => {
        const maxValue = parseInt(e.target.value);
        this.currentFilters.priceRange[1] = maxValue;

        const maxPriceValue = this.querySelector('#max-price-value');
        if (maxPriceValue) {
          maxPriceValue.textContent = `$${maxValue.toLocaleString()}`;
        }

        this.dispatchEvent(
          new CustomEvent('filtersChanged', {
            detail: this.currentFilters,
          })
        );
      });
    }

    if (sortBy) {
      sortBy.addEventListener('change', (e) => {
        this.currentFilters.sortBy = e.target.value;
        this.dispatchEvent(
          new CustomEvent('filtersChanged', {
            detail: this.currentFilters,
          })
        );
      });
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }
  }

  clearFilters() {
    this.currentFilters = {
      category: '',
      priceRange: [0, 100000],
      sortBy: 'name',
    };

    // Resetear elementos del DOM
    const categoryFilter = this.querySelector('#category-filter');
    const priceRange = this.querySelector('#price-range');
    const sortBy = this.querySelector('#sort-by');
    const maxPriceValue = this.querySelector('#max-price-value');

    if (categoryFilter) categoryFilter.value = '';
    if (priceRange) priceRange.value = '100000';
    if (sortBy) sortBy.value = 'name';
    if (maxPriceValue) maxPriceValue.textContent = '$100.000';

    this.dispatchEvent(
      new CustomEvent('filtersChanged', {
        detail: this.currentFilters,
      })
    );
  }

  getFilters() {
    return this.currentFilters;
  }

  setProducts(products) {
    this.products = products;
  }
}

// Registrar el componente
customElements.define('product-filters', ProductFilters);

export default ProductFilters;
