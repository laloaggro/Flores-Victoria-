// Eliminar la importación de formatPrice ya que se definirá en el componente

/**
 * Componente para mostrar una lista de productos
 * Incluye funcionalidades de filtrado, búsqueda y paginación
 *
 * Este componente maneja:
 * - Carga de productos desde la API
 * - Paginación de resultados
 * - Búsqueda por nombre
 * - Filtrado por categoría
 * - Visualización en cuadrícula responsive
 *
 * Puede usarse como elemento personalizado <products-component></products-component>
 */
class Products extends HTMLElement {
  constructor() {
    super();

    // Estado del componente
    this.currentPage = 1;
    this.productsPerPage = 9;
    this.allProducts = [];
    this.filteredProducts = [];
    this.currentCategory = 'all';
    this.searchTerm = '';
    this.categories = [];

    // Crear shadow DOM
    this.attachShadow({ mode: 'open' });
  }

  /**
   * Método llamado cuando el elemento es conectado al DOM
   * Inicializa el componente y carga los productos
   */
  connectedCallback() {
    this.render();
    this.loadProducts();
  }

  /**
   * Renderiza la estructura básica del componente
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .products-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .search-box {
          flex: 1;
          max-width: 400px;
          position: relative;
        }
        
        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .search-box i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #777;
        }
        
        .filters {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .filter-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .category-section {
          margin-bottom: 3rem;
        }
        
        .category-title {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: #333;
          border-bottom: 2px solid #28a745;
          padding-bottom: 0.5rem;
        }
        
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .product-card {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: white;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .product-image {
          height: 200px;
          overflow: hidden;
        }
        
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .product-card:hover .product-image img {
          transform: scale(1.05);
        }
        
        .product-info {
          padding: 1.5rem;
        }
        
        .product-title {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .product-description {
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        
        .product-price {
          font-size: 1.25rem;
          font-weight: bold;
          color: #28a745;
          margin-bottom: 1rem;
        }
        
        .add-to-cart-btn {
          width: 100%;
          padding: 0.75rem;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .add-to-cart-btn:hover {
          background-color: #218838;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        
        .pagination button {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .pagination button:hover:not(:disabled) {
          background-color: #f8f9fa;
        }
        
        .pagination button.active {
          background-color: #28a745;
          color: white;
          border-color: #28a745;
        }
        
        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .loading, .error-message {
          text-align: center;
          padding: 2rem;
          font-size: 1.2rem;
        }
        
        .error-message {
          color: #f44336;
        }
        
        .no-products {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        
        .view-more-container {
          text-align: center;
          margin-top: 1rem;
        }
        
        .view-more-btn {
          padding: 0.75rem 1.5rem;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }
        
        .view-more-btn:hover {
          background-color: #218838;
        }
        
        @media (max-width: 768px) {
          .products-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-box {
            max-width: 100%;
          }
          
          .filters {
            justify-content: center;
          }
          
          .category-title {
            font-size: 1.5rem;
          }
        }
      </style>
      <div class="products-container">
        <div class="products-header">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="searchInput" placeholder="Buscar productos...">
          </div>
          <div class="filters">
            <select class="filter-select" id="categoryFilter">
              <option value="all">Todas las categorías</option>
            </select>
          </div>
        </div>
        <div class="products-grid" id="productsGrid">
          <div class="loading">Cargando productos...</div>
        </div>
        <div class="pagination" id="pagination">
          <!-- Paginación se renderizará aquí -->
        </div>
      </div>
    `;

    // Configurar eventos
    this.setupEventListeners();
  }

  /**
   * Configura los event listeners para los controles
   */
  setupEventListeners() {
    // Esperar a que el DOM se cargue
    setTimeout(() => {
      // Búsqueda
      const searchInput = this.shadowRoot.getElementById('searchInput');
      if (searchInput) {
        // Eliminar event listeners anteriores para evitar duplicados
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);

        newSearchInput.addEventListener('input', (e) => {
          this.searchTerm = e.target.value.toLowerCase();
          this.currentPage = 1;
          this.filterAndPaginateProducts();
        });
      }

      // Filtrado por categoría
      const categoryFilter = this.shadowRoot.getElementById('categoryFilter');
      if (categoryFilter) {
        // Eliminar event listeners anteriores para evitar duplicados
        const newCategoryFilter = categoryFilter.cloneNode(true);
        categoryFilter.parentNode.replaceChild(newCategoryFilter, categoryFilter);

        newCategoryFilter.addEventListener('change', (e) => {
          this.currentCategory = e.target.value;
          this.currentPage = 1;
          this.filterAndPaginateProducts();
        });
      }

      // Añadir event listeners a los botones "Ver más" en tiempo real
      const observer = new MutationObserver(() => {
        const viewMoreButtons = this.shadowRoot.querySelectorAll('.view-more-btn');
        viewMoreButtons.forEach((button) => {
          // Verificar si ya tiene el event listener
          if (!button.hasAttribute('data-listener-added')) {
            button.setAttribute('data-listener-added', 'true');
            button.addEventListener('click', (e) => {
              const category = e.target.dataset.category;
              const categoryFilter = this.shadowRoot.getElementById('categoryFilter');
              if (categoryFilter) {
                categoryFilter.value = category;
                categoryFilter.dispatchEvent(new Event('change'));
              }
            });
          }
        });

        // Añadir event listeners a los botones de paginación
        const pageButtons = this.shadowRoot.querySelectorAll('.pagination button');
        pageButtons.forEach((button) => {
          // Verificar si ya tiene el event listener
          if (!button.hasAttribute('data-listener-added')) {
            button.setAttribute('data-listener-added', 'true');
            button.addEventListener('click', (e) => {
              const page = parseInt(e.target.dataset.page);
              if (page && page !== this.currentPage) {
                this.currentPage = page;
                this.renderFilteredProducts();
              }
            });
          }
        });
      });

      observer.observe(this.shadowRoot, { childList: true, subtree: true });
    }, 0);
  }

  /**
   * Carga los productos desde la API
   */
  async loadProducts() {
    try {
      // Verificar que la API_CONFIG esté definida
      if (typeof window === 'undefined' || !window.API_CONFIG) {
        throw new Error('API_CONFIG no está definida. Asegúrate de incluir el archivo api.js.');
      }

      // Mostrar indicador de carga
      const productsGrid = this.shadowRoot.getElementById('productsGrid');
      if (productsGrid) {
        productsGrid.innerHTML = '<div class="loading">Cargando productos...</div>';
      }

      // Controlador para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

      // Cargar productos
      const productsResponse = await fetch(`${window.API_CONFIG.PRODUCT_SERVICE}/all`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!productsResponse.ok) {
        throw new Error(`Error al cargar productos: ${productsResponse.status}`);
      }
      const productsData = await productsResponse.json();

      // Manejar correctamente el formato de datos de la API
      if (productsData && productsData.data && Array.isArray(productsData.data.products)) {
        this.allProducts = productsData.data.products;
      } else if (productsData && Array.isArray(productsData.products)) {
        this.allProducts = productsData.products;
      } else if (Array.isArray(productsData)) {
        this.allProducts = productsData;
      } else {
        console.warn('Formato de datos inesperado:', productsData);
        this.allProducts = []; // Inicializar como array vacío si el formato no es el esperado
      }

      // Categorías predefinidas en lugar de cargar desde la API
      this.categories = [
        'Ramos',
        'Arreglos',
        'Coronas',
        'Insumos',
        'Accesorios',
        'Condolencias',
        'Jardinería',
      ];

      // Mapeo de categorías de la API a nombres en español
      this.categoryMapping = {
        bouquets: 'Ramos',
        arrangements: 'Arreglos',
        wreaths: 'Coronas',
        supplies: 'Insumos',
        accessories: 'Accesorios',
        condolences: 'Condolencias',
        gardening: 'Jardinería',
      };

      // Actualizar el selector de categorías
      this.updateCategoryFilter();

      // Filtrar y paginar productos
      this.filterAndPaginateProducts();
    } catch (error) {
      console.error('Error al cargar productos:', error);
      const productsGrid = this.shadowRoot.getElementById('productsGrid');
      if (productsGrid) {
        if (error.name === 'AbortError') {
          productsGrid.innerHTML =
            '<div class="error-message">Error al cargar productos: Tiempo de espera agotado. Por favor, recarga la página.</div>';
        } else {
          productsGrid.innerHTML = `<div class="error-message">Error al cargar productos: ${error.message}</div>`;
        }
      }
    }
  }

  /**
   * Actualiza el selector de categorías con las categorías disponibles
   */
  updateCategoryFilter() {
    const categoryFilter = this.shadowRoot.getElementById('categoryFilter');
    if (!categoryFilter) return;

    // Limpiar opciones excepto la opción "Todas las categorías"
    categoryFilter.innerHTML = '<option value="all">Todas las categorías</option>';

    // Añadir opciones para cada categoría
    this.categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  /**
   * Filtra y pagina los productos
   */
  filterAndPaginateProducts() {
    // Filtrar productos
    this.filteredProducts = this.allProducts.filter((product) => {
      const matchesSearch =
        !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm));

      // Usar el mapeo de categorías para comparar correctamente
      const productCategory = this.categoryMapping[product.category] || product.category;
      const matchesCategory =
        this.currentCategory === 'all' || productCategory === this.currentCategory;

      return matchesSearch && matchesCategory;
    });

    // Mostrar productos organizados por categorías si no hay filtro de categoría ni búsqueda
    if (this.searchTerm === '' && this.currentCategory === 'all') {
      this.renderProductsByCategory();
    } else {
      // Mostrar productos filtrados normalmente
      this.renderFilteredProducts();
    }
  }

  /**
   * Renderiza productos organizados por categorías
   */
  renderProductsByCategory() {
    const productsGrid = this.shadowRoot.getElementById('productsGrid');
    if (!productsGrid) return;

    // Agrupar productos por categoría usando el mapeo
    const productsByCategory = {};
    this.filteredProducts.forEach((product) => {
      const categoryName = this.categoryMapping[product.category] || product.category;
      if (!productsByCategory[categoryName]) {
        productsByCategory[categoryName] = [];
      }
      productsByCategory[categoryName].push(product);
    });

    // Renderizar productos por categoría
    let html = '';

    // Si no hay productos, mostrar mensaje
    if (Object.keys(productsByCategory).length === 0) {
      productsGrid.innerHTML = '<div class="no-products">No se encontraron productos.</div>';
      return;
    }

    for (const category in productsByCategory) {
      // Mostrar solo los productos de la categoría actual si hay un filtro activo
      if (this.currentCategory !== 'all' && this.currentCategory === category) {
        html += `
          <div class="category-section">
            <h2 class="category-title">${category}</h2>
            <div class="products-grid">
        `;

        productsByCategory[category].forEach((product) => {
          html += this.createProductCard(product);
        });

        html += `
            </div>
          </div>
        `;
      } else if (this.currentCategory === 'all') {
        // Para la vista de todas las categorías, mostrar solo los primeros 6 productos por categoría
        html += `
          <div class="category-section">
            <h2 class="category-title">${category}</h2>
            <div class="products-grid">
        `;

        productsByCategory[category].slice(0, 6).forEach((product) => {
          html += this.createProductCard(product);
        });

        html += `
            </div>
            <div class="view-more-container">
              <button class="view-more-btn" data-category="${category}">
                Ver más productos de ${category}
              </button>
            </div>
          </div>
        `;
      }
    }

    productsGrid.innerHTML = html;
    this.renderPagination();
  }

  /**
   * Renderiza la paginación
   */
  renderPagination() {
    const paginationContainer = this.shadowRoot.getElementById('pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === this.currentPage ? 'active' : '';
      html += `<button class="${activeClass}" data-page="${i}">${i}</button>`;
    }

    paginationContainer.innerHTML = html;
  }

  /**
   * Renderiza productos filtrados normalmente
   */
  renderFilteredProducts() {
    const productsGrid = this.shadowRoot.getElementById('productsGrid');
    if (!productsGrid) return;

    // Calcular paginación
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);

    if (paginatedProducts.length === 0) {
      productsGrid.innerHTML =
        '<div class="no-products">No se encontraron productos que coincidan con los criterios de búsqueda.</div>';
      this.renderPagination();
      return;
    }

    // Renderizar productos
    productsGrid.innerHTML = paginatedProducts
      .map((product) => this.createProductCard(product))
      .join('');
    this.renderPagination();
  }

  /**
   * Crea una tarjeta de producto
   * @param {Object} product - El producto a mostrar
   * @returns {string} HTML de la tarjeta de producto
   */
  createProductCard(product) {
    // Formatear precio
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    });
    const price = formatter.format(product.price);

    // Usar imagen por defecto si la imagen no está disponible o no se puede cargar
    const imageUrl = product.image_url || '/images/products/default.jpg';

    return `
      <div class="product-card">
        <div class="product-image">
          <img src="${imageUrl}" alt="${product.name}" onerror="this.src='/images/products/default.jpg';this.onerror=null;">
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description || ''}</p>
          <div class="product-price">${price}</div>
          <button class="add-to-cart-btn" data-product-id="${product.id}">
            <i class="fas fa-shopping-cart"></i> Agregar al carrito
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza la paginación
   */
  renderPagination() {
    const paginationContainer = this.shadowRoot.getElementById('pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === this.currentPage ? 'active' : '';
      html += `<button class="${activeClass}" data-page="${i}">${i}</button>`;
    }

    paginationContainer.innerHTML = html;

    // Añadir event listeners a los botones de paginación
    const pageButtons = this.shadowRoot.querySelectorAll('.pagination button');
    pageButtons.forEach((button) => {
      // Remover event listeners antiguos para evitar duplicados
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      newButton.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.renderFilteredProducts();
        }
      });
    });
  }

  /**
   * Formatea un precio en CLP (pesos chilenos)
   * @param {number} price - El precio a formatear
   * @returns {string} El precio formateado como string
   */
  formatPrice(price) {
    // Asegurar que el precio es un número
    const numericPrice = typeof price === 'number' ? price : parseFloat(price);

    // Verificar que el precio sea un número válido
    if (isNaN(numericPrice)) {
      return 'Precio no disponible';
    }

    // Formatear el precio con separadores de miles y el símbolo de peso chileno
    return `$${numericPrice.toLocaleString('es-CL')}`;
  }
}

// Registrar el componente personalizado
if (!customElements.get('products-component')) {
  customElements.define('products-component', Products);
}

export default Products;
