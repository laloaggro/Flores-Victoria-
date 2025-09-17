// ProductSearch.js - Componente web para buscador de productos

class ProductSearch extends HTMLElement {
  constructor() {
    super();
    this.products = [];
    this.filteredProducts = [];
  }

  connectedCallback() {
    this.render();
    this.fetchProducts();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
            <div class="product-search">
                <div class="search-container">
                    <input 
                        type="text" 
                        id="product-search-input" 
                        placeholder="Buscar productos..." 
                        class="search-input"
                    >
                    <button id="search-button" class="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <div id="search-results" class="search-results"></div>
            </div>
        `;
  }

  async fetchProducts() {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      this.products = data.products || [];
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  }

  setupEventListeners() {
    const searchInput = this.querySelector('#product-search-input');
    const searchButton = this.querySelector('#search-button');
        
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.performSearch(e.target.value);
      });
    }
        
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        const searchTerm = searchInput ? searchInput.value : '';
        this.performSearch(searchTerm);
      });
    }
  }

  performSearch(term) {
    if (!term.trim()) {
      this.hideResults();
      return;
    }

    const searchTerm = term.toLowerCase();
    this.filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            (product.category && product.category.toLowerCase().includes(searchTerm))
    );

    this.displayResults();
  }

  displayResults() {
    const resultsContainer = this.querySelector('#search-results');
    if (!resultsContainer) return;

    if (this.filteredProducts.length === 0) {
      resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>No se encontraron productos que coincidan con tu búsqueda.</p>
                </div>
            `;
      resultsContainer.style.display = 'block';
      return;
    }

    const resultsHTML = this.filteredProducts.slice(0, 5).map(product => `
            <div class="search-result-item" data-product-id="${product.id}">
                <img src="${product.image || '/assets/images/placeholder.svg'}" alt="${product.name}" class="result-image">
                <div class="result-info">
                    <h4 class="result-name">${product.name}</h4>
                    <p class="result-price">$${(product.price || 0).toLocaleString()}</p>
                </div>
            </div>
        `).join('');

    resultsContainer.innerHTML = `
            <div class="search-results-list">
                ${resultsHTML}
                ${this.filteredProducts.length > 5 ? 
    `<div class="see-all-results">
                        <a href="/products.html?search=${encodeURIComponent(this.querySelector('#product-search-input').value)}">
                            Ver todos los ${this.filteredProducts.length} resultados
                        </a>
                    </div>` : ''
}
            </div>
        `;

    resultsContainer.style.display = 'block';
        
    // Añadir eventos a los resultados
    const resultItems = resultsContainer.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
      item.addEventListener('click', () => {
        const productId = item.getAttribute('data-product-id');
        window.location.href = `/product-detail.html?id=${productId}`;
      });
    });
  }

  hideResults() {
    const resultsContainer = this.querySelector('#search-results');
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }
}

// Registrar el componente
customElements.define('product-search', ProductSearch);

export default ProductSearch;