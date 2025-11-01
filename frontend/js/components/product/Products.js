// Migrado de componente web personalizado a módulo ES6
import { API_ENDPOINTS } from '../../config/api.js';
import { http } from '../../utils/httpClient.js';
import { formatPrice } from '../utils/utils.js';

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
          cursor: pointer;
          position: relative;
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
        
        /* Modal de detalle del producto */
        .product-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          z-index: 10000;
          overflow-y: auto;
          animation: fadeIn 0.3s ease;
        }
        
        .product-modal.active {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
          z-index: 1;
        }
        
        .modal-close:hover {
          background: rgba(0, 0, 0, 0.8);
        }
        
        .modal-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 2rem;
        }
        
        .modal-image-section {
          position: relative;
        }
        
        .modal-main-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .modal-thumbnails {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
        }
        
        .modal-thumbnail {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.3s ease;
        }
        
        .modal-thumbnail:hover,
        .modal-thumbnail.active {
          border-color: #e91e63;
        }
        
        .modal-info-section {
          display: flex;
          flex-direction: column;
        }
        
        .modal-title {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .modal-category {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #f0f0f0;
          border-radius: 20px;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          width: fit-content;
        }
        
        .modal-price {
          font-size: 2.5rem;
          font-weight: bold;
          color: #4caf50;
          margin-bottom: 1.5rem;
        }
        
        .modal-description {
          color: #666;
          line-height: 1.8;
          margin-bottom: 2rem;
          font-size: 1rem;
        }
        
        .modal-details {
          background: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        
        .modal-detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .modal-detail-item:last-child {
          border-bottom: none;
        }
        
        .modal-detail-label {
          font-weight: 600;
          color: #555;
        }
        
        .modal-detail-value {
          color: #333;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }
        
        .modal-add-cart {
          flex: 1;
          padding: 1rem 2rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        
        .modal-add-cart:hover {
          background-color: #45a049;
        }
        
        .modal-wishlist {
          padding: 1rem;
          background-color: white;
          color: #e91e63;
          border: 2px solid #e91e63;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        
        .modal-wishlist:hover {
          background-color: #e91e63;
          color: white;
        }
        
        @media (max-width: 768px) {
          .modal-body {
            grid-template-columns: 1fr;
          }
          
          .modal-main-image {
            height: 300px;
          }
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
              <option value="ramos">🌹 Ramos</option>
              <option value="arreglos">💐 Arreglos Florales</option>
              <option value="bouquets">💝 Bouquets</option>
              <option value="rosas">🌹 Rosas</option>
              <option value="tulipanes">🌷 Tulipanes</option>
              <option value="lirios">🌺 Lirios</option>
              <option value="girasoles">🌻 Girasoles</option>
              <option value="orquideas">🌸 Orquídeas</option>
              <option value="claveles">🌼 Claveles</option>
              <option value="mixtos">🎨 Arreglos Mixtos</option>
              <option value="corporativos">🏢 Corporativos</option>
              <option value="eventos">🎉 Eventos</option>
              <option value="bodas">💒 Bodas</option>
              <option value="condolencias">🕊️ Condolencias</option>
              <option value="coronas">⚘ Coronas</option>
              <option value="plantas">🌿 Plantas</option>
              <option value="macetas">🪴 Macetas</option>
              <option value="accesorios">🎀 Accesorios</option>
            </select>
          </div>
        </div>
        
        <div id="productsGrid" class="products-grid">
          <!-- Los productos se cargarán aquí dinámicamente -->
        </div>
        
        <div id="pagination" class="pagination">
          <!-- La paginación se generará aquí dinámicamente -->
        </div>
        
        <!-- Modal de detalle del producto -->
        <div id="productModal" class="product-modal">
          <div class="modal-content">
            <button class="modal-close" id="modalClose">&times;</button>
            <div class="modal-body" id="modalBody">
              <!-- El contenido del modal se generará dinámicamente -->
            </div>
          </div>
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

    // Cerrar modal
    const modalClose = this.shadowRoot.getElementById('modalClose');
    const productModal = this.shadowRoot.getElementById('productModal');

    modalClose.addEventListener('click', () => {
      this.closeProductModal();
    });

    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        this.closeProductModal();
      }
    });

    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && productModal.classList.contains('active')) {
        this.closeProductModal();
      }
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
      // Intentar fallback local en desarrollo si la API no responde
      const isLocalHost = ['localhost', '127.0.0.1'].includes(location.hostname);
      const isDev = location.port === '5173';
      const isLocalDev = isLocalHost && isDev;
      if (isLocalDev) {
        try {
          const res = await fetch('/assets/mock/products.json', { cache: 'no-store' });
          if (res.ok) {
            const mock = await res.json();
            if (Array.isArray(mock)) {
              this.allProducts = mock;
              this.filterAndPaginateProducts();
              return;
            }
          }
        } catch (e) {
          console.warn('Fallback local no disponible:', e);
        }
      }
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
    this.filteredProducts = this.allProducts.filter((product) => {
      const name = (product && product.name ? String(product.name) : '').toLowerCase();
      const desc = (
        product && product.description ? String(product.description) : ''
      ).toLowerCase();
      const matchesSearch = name.includes(this.searchTerm) || desc.includes(this.searchTerm);

      const matchesCategory =
        this.currentCategory === 'all' || product.category === this.currentCategory;

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
    productsGrid.innerHTML = productsToShow
      .map((product) => this.renderProductCard(product))
      .join('');

    // Agregar event listeners a las imágenes para abrir modal
    productsGrid.querySelectorAll('.product-image').forEach((imageDiv) => {
      imageDiv.addEventListener('click', () => {
        const productId = imageDiv.closest('.product-card').dataset.productId;
        this.openProductModal(productId);
      });
    });

    // Agregar event listeners a los botones de agregar al carrito
    productsGrid.querySelectorAll('.add-to-cart').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId =
          e.currentTarget && e.currentTarget.dataset
            ? e.currentTarget.dataset.productId
            : e.target.dataset.productId;
        this.addToCart(productId);
      });
    });

    // Thumbnails: cambiar imagen principal en la tarjeta y navegación tipo carousel
    productsGrid.querySelectorAll('.product-card').forEach((card) => {
      const mainImg = card.querySelector('img[data-main-image="true"]');
      const thumbs = card.querySelectorAll('.card-thumb');
      const leftBtn = card.querySelector('.thumb-nav.left');
      const rightBtn = card.querySelector('.thumb-nav.right');
      let activeIdx = 0;
      if (!mainImg || !thumbs || !thumbs.length) return;
      // Miniatura click
      thumbs.forEach((thumb, idx) => {
        thumb.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          thumbs.forEach((t) => t.classList.remove('active'));
          thumb.classList.add('active');
          mainImg.src = thumb.src;
          activeIdx = idx;
        });
      });
      // Navegación con flechas
      if (leftBtn && rightBtn) {
        leftBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (activeIdx > 0) {
            activeIdx--;
            thumbs[activeIdx].click();
            thumbs[activeIdx].scrollIntoView({ behavior: 'smooth', inline: 'center' });
          }
        });
        rightBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (activeIdx < thumbs.length - 1) {
            activeIdx++;
            thumbs[activeIdx].click();
            thumbs[activeIdx].scrollIntoView({ behavior: 'smooth', inline: 'center' });
          }
        });
      }
    });
  }

  /**
   * Renderiza una tarjeta de producto individual
   * @param {Object} product - Objeto con la información del producto
   * @returns {string} HTML de la tarjeta del producto
   */
  renderProductCard(product) {
    // Usar imagen final con marca de agua (AI-generada o watermarked)
    const imageUrl = product.id 
      ? `/images/products/final/${product.id}.png` 
      : '/images/placeholder.svg';
    
    // Fallback a imágenes originales si existen
    const images = product.images && Array.isArray(product.images) && product.images.length
      ? [imageUrl, ...product.images]
      : [imageUrl];

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <picture>
            <source type="image/webp" srcset="${imageUrl.replace(/\.(jpg|jpeg|png)(\?|$)/i, '.webp$2')}">
            <img 
              src="${imageUrl}"
              alt="${product.name}"
              loading="lazy"
              decoding="async"
              width="300"
              height="200"
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              style="background-color: transparent;"
              onerror="this.src='/images/placeholder.svg'; this.onerror=null;"
              data-main-image="true"
            >
          </picture>
        </div>
        ${
          images.length > 1
            ? `
        <div class="card-thumbnails" role="list" aria-label="Más imágenes de ${product.name}">
          ${images
            .map(
              (img, idx) => `
            <img 
              src="${img}"
              alt="${product.name} ${idx + 1}"
              class="card-thumb ${idx === 0 ? 'active' : ''}"
              data-thumb-index="${idx}"
            >
          `
            )
            .join('')}
        </div>
        `
            : ''
        }
        <div class="product-info" style="background-color: white;">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description || ''}</p>
          <div class="product-price">${
            isNaN(parseFloat(product.price))
              ? 'Precio a consultar'
              : formatPrice(parseFloat(product.price))
          }</div>
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
    pagination.querySelectorAll('button[data-page]').forEach((button) => {
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
    pagination.querySelectorAll('button[data-page]').forEach((button) => {
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
    const product = this.allProducts.find((p) => p.id === productId);
    if (!product) return;

    // Obtener carrito del localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image_url || product.image,
        quantity: 1,
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

  /**
   * Abre el modal con el detalle del producto
   * @param {number} productId - ID del producto
   */
  openProductModal(productId) {
    const product = this.allProducts.find((p) => p.id === productId);
    if (!product) return;

    const modal = this.shadowRoot.getElementById('productModal');
    const modalBody = this.shadowRoot.getElementById('modalBody');

    modalBody.innerHTML = this.renderProductModal(product);

    // Event listeners para las miniaturas
    const thumbnails = modalBody.querySelectorAll('.modal-thumbnail');
    const mainImage = modalBody.querySelector('.modal-main-image');

    thumbnails.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        mainImage.src = thumb.src;
        thumbnails.forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // Event listener para el botón de agregar al carrito en el modal
    const addCartBtn = modalBody.querySelector('.modal-add-cart');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        this.addToCart(productId);
      });
    }

    // Event listener para el botón de wishlist
    const wishlistBtn = modalBody.querySelector('.modal-wishlist');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => {
        this.showNotification('Producto agregado a favoritos', 'success');
      });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal de detalle del producto
   */
  closeProductModal() {
    const modal = this.shadowRoot.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Renderiza el contenido del modal de detalle del producto
   * @param {Object} product - Objeto con la información del producto
   * @returns {string} HTML del modal
   */
  renderProductModal(product) {
    // Determinar la URL de la imagen principal
    let mainImageUrl = '/images/placeholder.svg';
    const imageUrls = [];

    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      mainImageUrl = product.images[0];
      imageUrls.push(...product.images);
    } else if (product.image_url) {
      mainImageUrl = product.image_url;
      imageUrls.push(product.image_url);
    } else if (product.image) {
      mainImageUrl = product.image;
      imageUrls.push(product.image);
    }

    // Normalizar URLs
    const normalizeUrl = (u) => {
      let v = u;
      if (v.startsWith('./')) v = v.substring(1);
      if (!v.startsWith('/') && !v.startsWith('http')) v = `/${v}`;
      return v;
    };

    mainImageUrl = normalizeUrl(mainImageUrl);
    const normalizedImages = imageUrls.map(normalizeUrl);

    // Información adicional del producto
    const details = [];
    if (product.category) details.push({ label: 'Categoría', value: product.category });
    if (product.stock !== undefined) {
      const stockStatus = product.stock > 0 ? `${product.stock} disponibles` : 'Agotado';
      details.push({ label: 'Disponibilidad', value: stockStatus });
    }
    if (product.sku) details.push({ label: 'SKU', value: product.sku });
    if (product.weight) details.push({ label: 'Peso', value: `${product.weight} kg` });
    if (product.dimensions) details.push({ label: 'Dimensiones', value: product.dimensions });

    return `
      <div class="modal-image-section">
        <img src="${mainImageUrl}" alt="${product.name}" class="modal-main-image">
        ${
          normalizedImages.length > 1
            ? `
          <div class="modal-thumbnails">
            ${normalizedImages
              .map(
                (img, idx) => `
              <img 
                src="${img}" 
                alt="${product.name} ${idx + 1}" 
                class="modal-thumbnail ${idx === 0 ? 'active' : ''}"
              >
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
      
      <div class="modal-info-section">
        <h2 class="modal-title">${product.name}</h2>
        ${product.category ? `<div class="modal-category">${product.category}</div>` : ''}
        <div class="modal-price">${formatPrice(parseFloat(product.price))}</div>
        <p class="modal-description">${product.description || 'Sin descripción disponible.'}</p>
        
        ${
          details.length > 0
            ? `
          <div class="modal-details">
            ${details
              .map(
                (detail) => `
              <div class="modal-detail-item">
                <span class="modal-detail-label">${detail.label}:</span>
                <span class="modal-detail-value">${detail.value}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
        
        <div class="modal-actions">
          <button class="modal-add-cart">
            <i class="fas fa-shopping-cart"></i> Agregar al Carrito
          </button>
          <button class="modal-wishlist" title="Agregar a favoritos">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    `;
  }
}

// Registrar el componente personalizado
if (!customElements.get('products-component')) {
  customElements.define('products-component', Products);
}

export default Products;
