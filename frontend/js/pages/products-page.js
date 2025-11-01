    /**
 * Controlador principal de la página de productos
 * Integra el sistema de filtros inteligentes con el componente de productos
 */

import { API_ENDPOINTS } from '../config/api.js';
import { http } from '../utils/httpClient.js';
import { InfiniteScroll } from '../utils/infiniteScroll.js';
import { productCache } from '../utils/productCache.js';
import { productCompare } from '../utils/productCompare.js';
import { ProductFilters } from '../utils/productFilters.js';
import { ProductSorter } from '../utils/productSorter.js';
import { SearchAutocomplete } from '../utils/searchAutocomplete.js';
import {
  renderProductsGrid,
  renderLoadingState,
  setupCardEventListeners,
} from '../utils/productCardRenderer.js';
import { showSkeletonLoaders } from '../utils/skeletonLoaders.js';

class ProductsPageController {
  constructor() {
    this.allProducts = [];
    this.filteredProducts = [];
    this.sortedProducts = [];
    this.currentPage = 1;
    this.productsPerPage = 12;
    this.productsPerLoad = 6; // Para infinite scroll
    this.isLoading = false;
    this.useInfiniteScroll = true; // Toggle para infinite scroll
    
    // Inicializar sistemas
    this.productFilters = new ProductFilters();
    this.productSorter = new ProductSorter({
      defaultSort: 'featured',
      onSortChange: () => this.handleSortChange(),
    });
    this.searchAutocomplete = new SearchAutocomplete({
      inputId: 'search-input',
      onSelect: (product) => this.handleProductSelect(product),
    });
    this.infiniteScroll = null;
    
    // Elementos del DOM
    this.productsGrid = null;
    this.pagination = null;
    this.resultsInfo = null;
  }
  
  /**
   * Inicializa la página de productos
   */
  async init() {
    console.log('🚀 Inicializando página de productos...');
    
    // Obtener elementos del DOM
    this.productsGrid = document.getElementById('productsGrid');
    this.pagination = document.getElementById('pagination');
    this.resultsInfo = document.getElementById('resultsInfo');
    
    if (!this.productsGrid) {
      console.error('No se encontró el elemento productsGrid');
      return;
    }
    
    // Configurar filtros
    this.setupFilters();
    
    // Configurar ordenamiento
    this.productSorter.init('product-sort-controls');
    
    // Cargar productos
    await this.loadProducts();
    
    // Configurar búsqueda con autocompletado
    this.searchAutocomplete.init(this.allProducts);
    
    // Configurar infinite scroll si está habilitado
    if (this.useInfiniteScroll) {
      this.setupInfiniteScroll();
    }
    
    // Configurar sistema de comparación
    this.setupCompareSystem();
    
    // Configurar listeners para Quick View
    this.setupQuickViewListener();
    
    console.log('✅ Página de productos inicializada');
  }
  
  /**
   * Configura el sistema de filtros
   */
  setupFilters() {
    // Inicializar los event listeners de los filtros
    this.productFilters.init();
    
    // Registrar callback cuando los filtros cambien
    this.productFilters.onChange(() => {
      console.log('🔄 Filtros aplicados:', this.productFilters.getFilters());
      this.applyFilters();
    });
    
    // Conectar búsqueda del header (si existe)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.productFilters.setSearchTerm(e.target.value.toLowerCase());
      });
    }
  }
  
  /**
   * Carga los productos desde la API
   */
  async loadProducts() {
    try {
      this.isLoading = true;
      this.showLoading();
      
      console.log('📡 Cargando productos...');
      
      // Intentar cargar desde cache primero
      const cachedProducts = productCache.get();
      if (cachedProducts && cachedProducts.length > 0) {
        this.allProducts = cachedProducts;
        console.log(`✅ ${this.allProducts.length} productos cargados desde caché`);
        this.applyFilters();
        return;
      }
      
      console.log('📡 Cargando productos desde API...');
      
      // Llamar a la API con paginación amplia
      const response = await http.get(`${API_ENDPOINTS.PRODUCTS.GET_ALL}?page=1&limit=100`);
      
      // Extraer array de productos según formato de respuesta
      if (Array.isArray(response)) {
        this.allProducts = response;
      } else if (response?.data && Array.isArray(response.data)) {
        this.allProducts = response.data;
      } else if (response?.products && Array.isArray(response.products)) {
        this.allProducts = response.products;
      } else {
        console.error('Formato de respuesta inesperado:', response);
        this.allProducts = [];
      }
      
      console.log(`✅ ${this.allProducts.length} productos cargados desde API`);
      
      // Guardar en cache
      productCache.set(this.allProducts);
      
      // Actualizar datos del autocompletado
      if (this.searchAutocomplete) {
        this.searchAutocomplete.updateProducts(this.allProducts);
      }
      
      // Aplicar filtros iniciales
      this.applyFilters();
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      this.showError('Error al cargar productos. Por favor, intenta nuevamente.');
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Aplica los filtros y renderiza los resultados
   */
  applyFilters() {
    // Aplicar filtros usando ProductFilters
    this.filteredProducts = this.productFilters.applyFilters(this.allProducts);
    
    // Aplicar ordenamiento
    this.sortedProducts = this.productSorter.sortProducts(this.filteredProducts);
    
    // Resetear a la primera página
    this.currentPage = 1;
    
    // Resetear infinite scroll si está habilitado
    if (this.infiniteScroll) {
      this.infiniteScroll.reset();
    }
    
    // Renderizar productos
    this.renderProducts();
    
    // Actualizar información de resultados
    this.updateResultsInfo();
    
    // Actualizar paginación (si no es infinite scroll)
    if (!this.useInfiniteScroll) {
      this.updatePagination();
    }
    
    // Scroll suave al top de productos
    this.scrollToProducts();
  }
  
  /**
   * Maneja cambios en el ordenamiento
   */
  handleSortChange() {
    // Re-ordenar productos filtrados
    this.sortedProducts = this.productSorter.sortProducts(this.filteredProducts);
    
    // Resetear a primera página
    this.currentPage = 1;
    
    // Renderizar
    this.renderProducts();
    this.updatePagination();
    this.scrollToProducts();
  }
  
  /**
   * Maneja selección de producto desde autocompletado
   */
  handleProductSelect(product) {
    console.log('Producto seleccionado desde búsqueda:', product.name);
    
    // Abrir Quick View del producto
    window.dispatchEvent(new CustomEvent('open-quick-view', { 
      detail: { productId: product.id } 
    }));
  }
  
  /**
   * Configura infinite scroll
   */
  setupInfiniteScroll() {
    this.infiniteScroll = new InfiniteScroll({
      container: this.productsGrid,
      threshold: 400,
      onLoadMore: () => this.loadMoreProducts(),
    });
    
    // Ocultar paginación tradicional
    if (this.pagination) {
      this.pagination.style.display = 'none';
    }
    
    // Exponer globalmente para debug
    window.infiniteScroll = this.infiniteScroll;
  }
  
  /**
   * Carga más productos (para infinite scroll)
   */
  async loadMoreProducts() {
    const totalProducts = this.sortedProducts.length;
    const currentlyShown = this.currentPage * this.productsPerPage;
    
    if (currentlyShown >= totalProducts) {
      // No hay más productos
      this.infiniteScroll?.showEndMessage();
      return false;
    }
    
    // Simular delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Incrementar página
    this.currentPage++;
    
    // Renderizar productos adicionales
    this.renderMoreProducts();
    
    return true; // Hay más productos disponibles
  }
  
  /**
   * Renderiza productos adicionales (append para infinite scroll)
   */
  renderMoreProducts() {
    if (!this.productsGrid) return;
    
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const newProducts = this.sortedProducts.slice(startIndex, endIndex);
    
    if (newProducts.length === 0) return;
    
    // Crear fragment temporal
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderProductsGrid(newProducts);
    
    // Agregar cada producto al grid
    Array.from(tempDiv.children).forEach((child) => {
      this.productsGrid.appendChild(child);
    });
    
    // Configurar event listeners para las nuevas tarjetas
    setupCardEventListeners(this.productsGrid);
    
    console.log(
      `📦 Productos ${startIndex + 1}-${Math.min(endIndex, this.sortedProducts.length)} agregados (total: ${this.sortedProducts.length})`
    );
  }
  
  /**
   * Renderiza los productos en el grid
   */
  renderProducts() {
    if (!this.productsGrid) return;
    
    // Calcular productos de la página actual
    const startIndex = 0; // Siempre empezar desde 0 para infinite scroll
    const endIndex = this.currentPage * this.productsPerPage;
    const productsToShow = this.sortedProducts.slice(startIndex, endIndex);
    
    // Renderizar usando productCardRenderer
    this.productsGrid.innerHTML = renderProductsGrid(productsToShow);
    
    // Configurar event listeners de las tarjetas
    setupCardEventListeners(this.productsGrid);
    
    console.log(
      `📦 Mostrando productos ${startIndex + 1}-${Math.min(endIndex, this.sortedProducts.length)} de ${this.sortedProducts.length}`
    );
  }
  
  /**
   * Actualiza la información de resultados
   */
  updateResultsInfo() {
    if (!this.resultsInfo) return;
    
    const stats = this.productFilters.getStats(this.sortedProducts);
    const total = this.sortedProducts.length;
    const shown = Math.min(this.currentPage * this.productsPerPage, total);
    
    let infoText = '';
    
    if (this.useInfiniteScroll) {
      infoText = `Mostrando ${shown} de ${total} producto${total !== 1 ? 's' : ''}`;
    } else {
      infoText = `Mostrando ${total} producto${total !== 1 ? 's' : ''}`;
    }
    
    if (total !== this.allProducts.length) {
      infoText += ` de ${this.allProducts.length} total`;
    }
    
    // Agregar estadísticas relevantes
    if (stats.averagePrice) {
      infoText += ` • Precio promedio: ${formatPrice(stats.averagePrice)}`;
    }
    
    this.resultsInfo.textContent = infoText;
  }
  
  /**
   * Actualiza la paginación
   */
  updatePagination() {
    if (!this.pagination) return;
    
    const totalPages = Math.ceil(this.sortedProducts.length / this.productsPerPage);
    
    if (totalPages <= 1) {
      this.pagination.innerHTML = '';
      return;
    }
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Botón anterior
    paginationHTML += `
      <button class="btn-pagination" 
              ${this.currentPage === 1 ? 'disabled' : ''} 
              data-action="prev">
        <i class="fas fa-chevron-left"></i> Anterior
      </button>
    `;
    
    // Números de página
    paginationHTML += '<div class="page-numbers">';
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 2 && i <= this.currentPage + 2)
      ) {
        paginationHTML += `
          <button class="btn-page ${i === this.currentPage ? 'active' : ''}" 
                  data-page="${i}">
            ${i}
          </button>
        `;
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += '<span class="pagination-ellipsis">...</span>';
      }
    }
    
    paginationHTML += '</div>';
    
    // Botón siguiente
    paginationHTML += `
      <button class="btn-pagination" 
              ${this.currentPage === totalPages ? 'disabled' : ''} 
              data-action="next">
        Siguiente <i class="fas fa-chevron-right"></i>
      </button>
    `;
    
    paginationHTML += '</div>';
    
    this.pagination.innerHTML = paginationHTML;
    
    // Agregar event listeners
    this.pagination.querySelectorAll('.btn-pagination').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'prev' && this.currentPage > 1) {
          this.currentPage--;
          this.renderProducts();
          this.updatePagination();
          this.scrollToProducts();
        } else if (action === 'next' && this.currentPage < totalPages) {
          this.currentPage++;
          this.renderProducts();
          this.updatePagination();
          this.scrollToProducts();
        }
      });
    });
    
    this.pagination.querySelectorAll('.btn-page').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.currentPage = parseInt(btn.dataset.page);
        this.renderProducts();
        this.updatePagination();
        this.scrollToProducts();
      });
    });
  }
  
  /**
   * Scroll suave a la sección de productos
   */
  scrollToProducts() {
    const productsSection = document.querySelector('.smart-filters') || this.productsGrid;
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  /**
   * Muestra el estado de carga
   */
  showLoading() {
    if (!this.productsGrid) return;
    // Usar skeleton loaders en lugar del spinner genérico
    showSkeletonLoaders(this.productsGrid, 12);
  }
  
  /**
   * Muestra un mensaje de error
   */
  showError(message) {
    if (!this.productsGrid) return;
    this.productsGrid.innerHTML = `
      <div class="products-error">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Oops!</h3>
        <p>${message}</p>
        <button class="btn-primary" onclick="window.productsController.loadProducts()">
          <i class="fas fa-redo"></i> Reintentar
        </button>
      </div>
    `;
  }
  
  /**
   * Configura el listener para Quick View
   */
  setupQuickViewListener() {
    window.addEventListener('open-quick-view', async (e) => {
      const { productId } = e.detail;
      await this.openQuickView(productId);
    });
  }
  
  /**
   * Configura el sistema de comparación
   */
  setupCompareSystem() {
    // Inicializar sistema de comparación
    productCompare.init();
    
    // Exponer globalmente para acceso desde botones
    window.productCompare = productCompare;
    
    // Listener para toggle de comparación
    window.addEventListener('toggle-compare', (e) => {
      const { productId } = e.detail;
      const product = this.allProducts.find((p) => p.id === productId);
      
      if (product) {
        if (productCompare.isInCompare(productId)) {
          productCompare.removeProduct(productId);
        } else {
          productCompare.addProduct(product);
        }
      }
    });
    
    console.log('🔍 Sistema de comparación configurado');
  }
  
  /**
   * Abre el modal de Quick View para un producto
   */
  async openQuickView(productId) {
    const product = this.allProducts.find((p) => p.id === productId);
    
    if (!product) {
      console.error('Producto no encontrado:', productId);
      return;
    }
    
    // Crear modal si no existe
    let modal = document.getElementById('quickViewModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'quickViewModal';
      modal.className = 'quick-view-modal';
      document.body.appendChild(modal);
    }
    
    // Renderizar contenido del modal
    modal.innerHTML = `
      <div class="quick-view-content">
        <button class="btn-close-modal" aria-label="Cerrar">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="quick-view-grid">
          <div class="quick-view-images">
            ${this.renderQuickViewImages(product)}
          </div>
          
          <div class="quick-view-info">
            <h2>${product.name}</h2>
            <p class="quick-view-description">${product.description || ''}</p>
            
            <div class="quick-view-price">
              ${formatPrice(product.price)}
            </div>
            
            ${product.flowers && product.flowers.length > 0 ? `
              <div class="quick-view-flowers">
                <strong>Incluye:</strong>
                <ul>
                  ${product.flowers.map((f) => `<li>🌸 ${f}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${product.delivery_time ? `
              <div class="quick-view-delivery">
                <i class="fas fa-shipping-fast"></i>
                <span>${product.delivery_time}</span>
              </div>
            ` : ''}
            
            <button class="btn-add-cart-modal" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              Agregar al carrito
            </button>
            
            <a href="/pages/product-detail.html?id=${product.id}" class="btn-view-details">
              Ver detalles completos
            </a>
          </div>
        </div>
      </div>
    `;
    
    // Mostrar modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Event listener para cerrar
    modal.querySelector('.btn-close-modal').addEventListener('click', () => {
      this.closeQuickView();
    });
    
    // Cerrar al hacer click fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeQuickView();
      }
    });
    
    // Listener para agregar al carrito desde el modal
    setupCardEventListeners(modal);
  }
  
  /**
   * Renderiza las imágenes del Quick View
   */
  renderQuickViewImages(product) {
    if (!product.images || product.images.length === 0) {
      return '<img src="/images/placeholders/flower-placeholder.svg" alt="Sin imagen" />';
    }
    
    return product.images
      .map(
        (img) =>
          `<img src="${img}" 
                alt="${product.name}" 
                loading="lazy"
                onerror="this.src='/images/placeholders/flower-placeholder.svg'" />`
      )
      .join('');
  }
  
  /**
   * Cierra el modal de Quick View
   */
  closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// Función auxiliar para formatPrice (si no está disponible)
function formatPrice(price) {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0;
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(price);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.productsController = new ProductsPageController();
  window.productsController.init();
});

// También exponer para uso manual
window.ProductsPageController = ProductsPageController;
