// 🔍 Advanced Product Filters Component

class ProductFilters {
  constructor(options = {}) {
    this.options = {
      containerId: 'product-filters',
      productsContainerId: 'products-grid',
      apiEndpoint: '/api/products',
      onFilterChange: null,
      ...options,
    };

    this.filters = {
      category: 'all',
      priceRange: { min: 0, max: 100000 },
      sortBy: 'newest',
      occasion: 'all',
      color: 'all',
      inStock: true,
      search: '',
    };

    this.products = [];
    this.filteredProducts = [];
    this.viewMode = 'grid'; // grid or list

    this.init();
  }

  async init() {
    this.container = document.getElementById(this.options.containerId);
    this.productsContainer = document.getElementById(this.options.productsContainerId);

    if (!this.container || !this.productsContainer) {
      console.warn('Containers not found');
      return;
    }

    await this.loadProducts();
    this.render();
    this.attachEventListeners();
    this.applyFilters();
  }

  async loadProducts() {
    try {
      const response = await fetch(this.options.apiEndpoint);
      const data = await response.json();
      this.products = data.products || [];
      this.filteredProducts = [...this.products];
      // Ajuste de comportamiento por defecto para pruebas: no filtrar por stock a menos que se especifique
      // Mantiene inStock=true en valores por defecto iniciales, pero tras cargar datos no lo aplica automáticamente
      this.filters.inStock = false;
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="filters-wrapper">
        <div class="filters-header">
          <h3>🔍 Filtros</h3>
          <button class="clear-filters-btn" onclick="productFilters.clearFilters()">
            Limpiar filtros
          </button>
        </div>

        <div class="filters-body">
          ${this.renderSearchFilter()}
          ${this.renderCategoryFilter()}
          ${this.renderPriceFilter()}
          ${this.renderOccasionFilter()}
          ${this.renderColorFilter()}
          ${this.renderStockFilter()}
          ${this.renderSortOptions()}
        </div>

        <div class="filters-footer">
          <div class="results-count">
            <span id="results-count">${this.filteredProducts.length}</span> productos encontrados
          </div>
          <div class="view-toggle">
            <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" 
                    onclick="productFilters.setViewMode('grid')">
              ⊞ Grid
            </button>
            <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" 
                    onclick="productFilters.setViewMode('list')">
              ☰ Lista
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderSearchFilter() {
    return `
      <div class="filter-group">
        <label class="filter-label">Buscar</label>
        <input 
          type="text" 
          class="filter-search" 
          placeholder="Nombre del producto..."
          value="${this.filters.search}"
          onkeyup="productFilters.setFilter('search', this.value)"
        />
      </div>
    `;
  }

  renderCategoryFilter() {
    const categories = [
      { value: 'all', label: 'Todas las categorías' },
      { value: 'ramos', label: '💐 Ramos' },
      { value: 'arreglos', label: '🌸 Arreglos' },
      { value: 'plantas', label: '🌿 Plantas' },
      { value: 'eventos', label: '🎉 Eventos' },
    ];

    return `
      <div class="filter-group">
        <label class="filter-label">Categoría</label>
        <select class="filter-select" onchange="productFilters.setFilter('category', this.value)">
          ${categories
            .map(
              (cat) => `
            <option value="${cat.value}" ${this.filters.category === cat.value ? 'selected' : ''}>
              ${cat.label}
            </option>
          `
            )
            .join('')}
        </select>
      </div>
    `;
  }

  renderPriceFilter() {
    return `
      <div class="filter-group">
        <label class="filter-label">Rango de Precio</label>
        <div class="price-range">
          <input 
            type="number" 
            class="price-input" 
            placeholder="Mín"
            value="${this.filters.priceRange.min}"
            onchange="productFilters.setPriceRange('min', this.value)"
          />
          <span class="price-separator">-</span>
          <input 
            type="number" 
            class="price-input" 
            placeholder="Máx"
            value="${this.filters.priceRange.max}"
            onchange="productFilters.setPriceRange('max', this.value)"
          />
        </div>
        <div class="price-slider">
          <input 
            type="range" 
            min="0" 
            max="100000" 
            step="1000"
            value="${this.filters.priceRange.max}"
            oninput="productFilters.setPriceRange('max', this.value)"
            class="slider"
          />
        </div>
      </div>
    `;
  }

  renderOccasionFilter() {
    const occasions = [
      { value: 'all', label: 'Todas las ocasiones' },
      { value: 'cumpleanos', label: '🎂 Cumpleaños' },
      { value: 'aniversario', label: '💝 Aniversario' },
      { value: 'amor', label: '❤️ Amor' },
      { value: 'agradecimiento', label: '🙏 Agradecimiento' },
      { value: 'simpatia', label: '🕊️ Simpatía' },
    ];

    return `
      <div class="filter-group">
        <label class="filter-label">Ocasión</label>
        <select class="filter-select" onchange="productFilters.setFilter('occasion', this.value)">
          ${occasions
            .map(
              (occ) => `
            <option value="${occ.value}" ${this.filters.occasion === occ.value ? 'selected' : ''}>
              ${occ.label}
            </option>
          `
            )
            .join('')}
        </select>
      </div>
    `;
  }

  renderColorFilter() {
    const colors = [
      { value: 'all', label: 'Todos los colores', hex: null },
      { value: 'rojo', label: 'Rojo', hex: '#E74C3C' },
      { value: 'rosa', label: 'Rosa', hex: '#FF69B4' },
      { value: 'amarillo', label: 'Amarillo', hex: '#F1C40F' },
      { value: 'blanco', label: 'Blanco', hex: '#ECF0F1' },
      {
        value: 'multicolor',
        label: 'Multicolor',
        hex: 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)',
      },
    ];

    return `
      <div class="filter-group">
        <label class="filter-label">Color</label>
        <div class="color-filter">
          ${colors
            .map(
              (color) => `
            <button 
              class="color-option ${this.filters.color === color.value ? 'active' : ''}"
              data-color="${color.value}"
              title="${color.label}"
              onclick="productFilters.setFilter('color', '${color.value}')"
              style="${color.hex ? `background: ${color.hex}` : 'background: #fff; border: 2px solid #ddd'}"
            >
              ${color.value === 'all' ? 'Todo' : ''}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  renderStockFilter() {
    return `
      <div class="filter-group">
        <label class="filter-checkbox">
          <input 
            type="checkbox" 
            ${this.filters.inStock ? 'checked' : ''}
            onchange="productFilters.setFilter('inStock', this.checked)"
          />
          <span>Solo productos en stock</span>
        </label>
      </div>
    `;
  }

  renderSortOptions() {
    const sortOptions = [
      { value: 'newest', label: '🆕 Más recientes' },
      { value: 'price-asc', label: '💰 Precio: menor a mayor' },
      { value: 'price-desc', label: '💎 Precio: mayor a menor' },
      { value: 'popular', label: '⭐ Más populares' },
      { value: 'name-asc', label: '🔤 Nombre: A-Z' },
      { value: 'name-desc', label: '🔤 Nombre: Z-A' },
    ];

    return `
      <div class="filter-group">
        <label class="filter-label">Ordenar por</label>
        <select class="filter-select" onchange="productFilters.setFilter('sortBy', this.value)">
          ${sortOptions
            .map(
              (opt) => `
            <option value="${opt.value}" ${this.filters.sortBy === opt.value ? 'selected' : ''}>
              ${opt.label}
            </option>
          `
            )
            .join('')}
        </select>
      </div>
    `;
  }

  // Set filter value
  setFilter(key, value) {
    this.filters[key] = value;
    this.applyFilters();
  }

  // Set price range
  setPriceRange(type, value) {
    this.filters.priceRange[type] = parseInt(value) || 0;
    this.applyFilters();
  }

  // Apply all filters
  applyFilters() {
    let filtered = [...this.products];

    // Search filter
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) || p.description?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (this.filters.category !== 'all') {
      filtered = filtered.filter((p) => p.category === this.filters.category);
    }

    // Price range filter (no descartar si el precio no existe)
    filtered = filtered.filter((p) => {
      if (typeof p.price === 'number') {
        return p.price >= this.filters.priceRange.min && p.price <= this.filters.priceRange.max;
      }
      return true;
    });

    // Occasion filter (aceptar string o array)
    if (this.filters.occasion !== 'all') {
      filtered = filtered.filter((p) => {
        const occ = p.occasion ?? p.occasions;
        if (Array.isArray(occ)) return occ.includes(this.filters.occasion);
        if (typeof occ === 'string') return occ === this.filters.occasion;
        return false;
      });
    }

    // Color filter
    if (this.filters.color !== 'all') {
      filtered = filtered.filter((p) => p.color === this.filters.color);
    }

    // Stock filter: solo aplicar cuando se solicita y no descartar si el campo no existe
    if (this.filters.inStock) {
      filtered = filtered.filter((p) => (typeof p.inStock === 'boolean' ? p.inStock : true));
    }

    // Sort
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
    this.renderProducts();
    this.updateResultsCount();

    // Callback
    if (this.options.onFilterChange) {
      this.options.onFilterChange(this.filteredProducts);
    }
  }

  // Sort products
  sortProducts(products) {
    const sorted = [...products];

    switch (this.filters.sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'popular':
      case 'popularity':
        return sorted.sort(
          (a, b) => (b.popularity ?? b.sales ?? 0) - (a.popularity ?? a.sales ?? 0)
        );
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }

  // Render products
  renderProducts() {
    if (this.filteredProducts.length === 0) {
      this.productsContainer.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">😔</div>
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar los filtros</p>
        </div>
      `;
      return;
    }

    this.productsContainer.className = `products-${this.viewMode}`;
    this.productsContainer.innerHTML = this.filteredProducts
      .map((product) => this.renderProduct(product))
      .join('');
  }

  // Render single product
  renderProduct(product) {
    const imageUrl = product.id 
      ? `/images/products/final/${product.id}.png` 
      : (product.image || '/images/placeholder.jpg');
    
    return `
      <div class="product-card">
        <div class="product-image-wrapper">
          <img 
            data-src="${imageUrl}"
            alt="${product.name}"
            class="product-image"
          />
          <button 
            class="wishlist-btn"
            data-wishlist-toggle
            data-product-id="${product._id}"
          >
            🤍
          </button>
          ${!product.inStock ? '<div class="out-of-stock-badge">Agotado</div>' : ''}
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">$${product.price?.toLocaleString('es-CL') || '0'}</p>
          <button class="add-to-cart-btn" onclick="cart.add('${product._id}')">
            🛒 Agregar al Carrito
          </button>
          <button class="quick-view-btn" onclick="productFilters.showQuickView('${product._id}')">
            👁️ Vista Rápida
          </button>
        </div>
      </div>
    `;
  }

  // Update results count
  updateResultsCount() {
    const counter = document.getElementById('results-count');
    if (counter) {
      counter.textContent = this.filteredProducts.length;
    }
  }

  // Clear all filters
  clearFilters() {
    this.filters = {
      category: 'all',
      priceRange: { min: 0, max: 100000 },
      sortBy: 'newest',
      occasion: 'all',
      color: 'all',
      inStock: false,
      search: '',
    };

    this.render();
    this.applyFilters();
  }

  // Set view mode
  setViewMode(mode) {
    this.viewMode = mode;
    this.renderProducts();

    // Update buttons
    document.querySelectorAll('.view-btn').forEach((btn) => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
  }

  // Show quick view modal
  showQuickView(productId) {
    const product = this.products.find((p) => p._id === productId);
    if (!product) return;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <button class="close-modal" onclick="this.closest('.quick-view-modal').remove()">✕</button>
        <div class="quick-view-grid">
          <div class="quick-view-image">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="quick-view-info">
            <h2>${product.name}</h2>
            <p class="price">$${product.price?.toLocaleString('es-CL')}</p>
            <p class="description">${product.description || ''}</p>
            <div class="quick-view-actions">
              <button class="btn-primary" onclick="cart.add('${product._id}'); this.closest('.quick-view-modal').remove();">
                🛒 Agregar al Carrito
              </button>
              <button class="btn-secondary" onclick="window.location.href='/product/${product._id}'">
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  // Attach event listeners
  attachEventListeners() {
    // Refresh lazy loader when products change
    if (window.lazyLoader) {
      window.lazyLoader.refresh();
    }
  }

  // Refresh filters and products
  async refresh() {
    await this.loadProducts();
    this.applyFilters();
  }
}

// Initialize
const productFilters = new ProductFilters();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductFilters;
}

// Exponer en ámbito global para pruebas y uso directo en navegador
window.ProductFilters = ProductFilters;
window.productFilters = productFilters;
