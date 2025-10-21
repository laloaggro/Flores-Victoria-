// Migrado de componente web personalizado a módulo ES6
import { formatPrice } from '../utils/utils.js';
import { API_ENDPOINTS } from '../../config/api.js';
import http from '../../utils/httpClient.js';

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
    this.productsPerPage = 12; // Aumentado de 9 a 12 productos por página
    this.allProducts = [];
    this.filteredProducts = [];
    this.currentCategory = 'all';
    this.searchTerm = '';
    
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
        
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .product-card {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
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
          font-size: 1.5rem;
          font-weight: bold;
          color: #4caf50;
          margin-bottom: 1rem;
        }
        
        .add-to-cart {
          width: 100%;
          padding: 0.75rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }
        
        .add-to-cart:hover {
          background-color: #45a049;
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
          background-color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .pagination button:hover {
          background-color: #f5f5f5;
        }
        
        .pagination button.active {
          background-color: #e91e63;
          color: white;
          border-color: #e91e63;
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
              <option value="Ramos">Ramos</option>
              <option value="Arreglos">Arreglos</option>
              <option value="Coronas">Coronas</option>
              <option value="Insumos">Insumos</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Condolencias">Condolencias</option>
              <option value="Jardinería">Jardinería</option>
            </select>
          </div>
        </div>
        
        <div id="productsGrid" class="products-grid">
          <!-- Los productos se cargarán aquí dinámicamente -->
        </div>
        
        <div id="pagination" class="pagination">
          <!-- La paginación se generará aquí dinámicamente -->
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
    // Búsqueda
    const searchInput = this.shadowRoot.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.currentPage = 1;
      this.filterAndPaginateProducts();
    });
    
    // Filtrado por categoría
    const categoryFilter = this.shadowRoot.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.currentPage = 1;
      this.filterAndPaginateProducts();
    });
  }

  /**
   * Carga los productos desde la API
   */
  async loadProducts() {
    try {
  // Usar el cliente HTTP con baseURL (incluye /api) y endpoint relativo
  const data = await http.get(API_ENDPOINTS.PRODUCTS.GET_ALL);
      
      // Verificar que los datos sean un array
      if (Array.isArray(data)) {
        this.allProducts = data;
      } else if (data && Array.isArray(data.products)) {
        // Si es un objeto con una propiedad products que es un array
        this.allProducts = data.products;
      } else if (data && data.data && Array.isArray(data.data)) {
        // Si es un objeto con una propiedad data que es un array (nuevo formato)
        this.allProducts = data.data;
      } else {
        console.error('La respuesta de la API no contiene un array de productos:', data);
        this.allProducts = [];
      }
      
      this.filterAndPaginateProducts();
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.showError();
    }
  }

  /**
   * Filtra y pagina los productos
   */
  filterAndPaginateProducts() {
    // Verificar que allProducts sea un array antes de usar filter
    if (!Array.isArray(this.allProducts)) {
      console.error('allProducts no es un array:', this.allProducts);
      this.allProducts = [];
    }
    
    // Filtrar productos
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm) || 
                           product.description.toLowerCase().includes(this.searchTerm);
      
      const matchesCategory = this.currentCategory === 'all' || 
                            product.category === this.currentCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    // Calcular paginación
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    this.currentProducts = this.filteredProducts.slice(startIndex, endIndex);
    
    // Actualizar UI
    this.updateProductsGrid();
    this.updatePagination();
  }

  /**
   * Actualiza la cuadrícula de productos
   */
  updateProductsGrid() {
    const productsGrid = this.shadowRoot.getElementById('productsGrid');
    
    if (this.filteredProducts.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <p>No se encontraron productos que coincidan con los criterios de búsqueda.</p>
        </div>
      `;
      return;
    }
    
    // Calcular productos a mostrar en la página actual
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
    
    // Renderizar productos
    productsGrid.innerHTML = productsToShow.map(product => this.renderProductCard(product)).join('');
    
    // Agregar event listeners a los botones de agregar al carrito
    productsGrid.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = parseInt(e.target.dataset.productId);
        this.addToCart(productId);
      });
    });
  }

  /**
   * Renderiza una tarjeta de producto individual
   * @param {Object} product - Objeto con la información del producto
   * @returns {string} HTML de la tarjeta del producto
   */
  renderProductCard(product) {
    // Determinar la URL de la imagen
    let imageUrl = product.image_url || product.image || '/assets/images/placeholder.svg';
    
    // Asegurar que la URL de la imagen sea correcta
    if (imageUrl.startsWith('./assets/images/')) {
      imageUrl = imageUrl.substring(1); // Quitar el punto inicial
    } else if (imageUrl.startsWith('assets/images/')) {
      imageUrl = `/${imageUrl}`;
    }
    
    // Si la imagen aún no es válida, usar el placeholder
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || !imageUrl.startsWith('/assets/images/')) {
      imageUrl = '/assets/images/placeholder.svg';
    }
    
    return `
      <div class="product-card">
        <div class="product-image">
          <img 
            src="${imageUrl}" 
            alt="${product.name}" 
            loading="lazy" 
            width="300" 
            height="200"
            style="background-color: transparent;"
            onerror="this.src='/assets/images/placeholder.svg'; this.onerror=null;">
        </div>
        <div class="product-info" style="background-color: white;">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-price">${formatPrice(parseFloat(product.price))}</div>
          <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
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
    const pagination = this.shadowRoot.getElementById('pagination');
    const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
    
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }
    
    let paginationHTML = '';
    
    // Botón anterior
    paginationHTML += `
      <button ${this.currentPage === 1 ? 'disabled' : ''} 
              data-page="${this.currentPage - 1}">
        Anterior
      </button>
    `;
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        paginationHTML += `
          <button class="${i === this.currentPage ? 'active' : ''}" 
                  data-page="${i}">
            ${i}
          </button>
        `;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += '<span>...</span>';
      }
    }
    
    // Botón siguiente
    paginationHTML += `
      <button ${this.currentPage === totalPages ? 'disabled' : ''} 
              data-page="${this.currentPage + 1}">
        Siguiente
      </button>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Agregar event listeners a los botones de paginación
    pagination.querySelectorAll('button[data-page]').forEach(button => {
      button.addEventListener('click', (e) => {
        this.currentPage = parseInt(e.target.dataset.page);
        this.renderProducts();
        this.renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /**
   * Actualiza la paginación
   */
  updatePagination() {
    const pagination = this.shadowRoot.getElementById('pagination');
    const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
    
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }
    
    let paginationHTML = '';
    
    // Botón anterior
    paginationHTML += `
      <button ${this.currentPage === 1 ? 'disabled' : ''} 
              data-page="${this.currentPage - 1}">
        Anterior
      </button>
    `;
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        paginationHTML += `
          <button class="${i === this.currentPage ? 'active' : ''}" 
                  data-page="${i}">
            ${i}
          </button>
        `;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += '<span>...</span>';
      }
    }
    
    // Botón siguiente
    paginationHTML += `
      <button ${this.currentPage === totalPages ? 'disabled' : ''} 
              data-page="${this.currentPage + 1}">
        Siguiente
      </button>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Agregar event listeners a los botones de paginación
    pagination.querySelectorAll('button[data-page]').forEach(button => {
      button.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        if (page !== this.currentPage) {
          this.currentPage = page;
          this.updateProductsGrid();
          this.updatePagination();
          
          // Scroll hacia arriba cuando se cambia de página
          this.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Agrega un producto al carrito
   * @param {number} productId - ID del producto a agregar
   */
  addToCart(productId) {
    // Obtener producto por ID
    const product = this.allProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Obtener carrito del localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image_url || product.image,
        quantity: 1
      });
    }
    
    // Guardar carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mostrar notificación
    this.showNotification(`"${product.name}" agregado al carrito`, 'success');
    
    // Actualizar contador del carrito en el header
    this.updateCartCount();
  }

  /**
   * Muestra una notificación
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (success, error, etc.)
   */
  showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 2rem;
      background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    // Agregar al documento
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Actualiza el contador del carrito en el header
   */
  updateCartCount() {
    // Este método enviará un evento personalizado
    // que será escuchado por el header para actualizar el contador
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }

  /**
   * Muestra un mensaje de error
   */
  showError() {
    const productsGrid = this.shadowRoot.getElementById('productsGrid');
    productsGrid.innerHTML = `
      <div class="error-container">
        <p class="error-message">Error al cargar productos. Por favor, inténtelo de nuevo más tarde.</p>
        <button class="btn btn-primary" onclick="document.querySelector('products-component').loadProducts()">Reintentar</button>
      </div>
    `;
  }
}

// Registrar el componente personalizado
if (!customElements.get('products-component')) {
  customElements.define('products-component', Products);
}

export default Products;
