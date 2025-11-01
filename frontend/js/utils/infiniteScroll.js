/**
 * Sistema de Infinite Scroll para productos
 * Carga productos de forma incremental mientras el usuario hace scroll
 */

export class InfiniteScroll {
  constructor(options = {}) {
    this.container = options.container;
    this.loadMoreCallback = options.onLoadMore;
    this.threshold = options.threshold || 300; // px desde el bottom
    this.isLoading = false;
    this.hasMore = true;
    this.loadingIndicator = null;
    
    this.init();
  }
  
  /**
   * Inicializa el infinite scroll
   */
  init() {
    if (!this.container) {
      console.error('InfiniteScroll: container no definido');
      return;
    }
    
    // Crear indicador de carga
    this.createLoadingIndicator();
    
    // Setup scroll listener
    this.setupScrollListener();
    
    console.log('🔄 Infinite Scroll inicializado');
  }
  
  /**
   * Crea el indicador de carga al final del scroll
   */
  createLoadingIndicator() {
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'infinite-scroll-loader';
    this.loadingIndicator.style.display = 'none';
    this.loadingIndicator.innerHTML = `
      <div class="loader-content">
        <div class="spinner"></div>
        <p>Cargando más productos...</p>
      </div>
    `;
    
    // Insertar después del container
    if (this.container.parentNode) {
      this.container.parentNode.insertBefore(
        this.loadingIndicator,
        this.container.nextSibling
      );
    }
  }
  
  /**
   * Configura el listener de scroll
   */
  setupScrollListener() {
    // Throttle para evitar demasiados checks
    let ticking = false;
    
    const checkScroll = () => {
      if (this.isLoading || !this.hasMore) return;
      
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = documentHeight - scrollPosition;
      
      if (distanceFromBottom < this.threshold) {
        this.loadMore();
      }
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
        });
        ticking = true;
      }
    });
    
    // También check inicial por si hay poco contenido
    setTimeout(() => checkScroll(), 500);
  }
  
  /**
   * Carga más productos
   */
  async loadMore() {
    if (this.isLoading || !this.hasMore) return;
    
    this.isLoading = true;
    this.showLoader();
    
    console.log('📥 Cargando más productos...');
    
    try {
      if (this.loadMoreCallback) {
        const hasMore = await this.loadMoreCallback();
        this.hasMore = hasMore !== false;
      }
    } catch (error) {
      console.error('Error al cargar más productos:', error);
      this.showError();
    } finally {
      this.isLoading = false;
      this.hideLoader();
    }
  }
  
  /**
   * Muestra el loader
   */
  showLoader() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'block';
      this.loadingIndicator.classList.remove('error');
    }
  }
  
  /**
   * Oculta el loader
   */
  hideLoader() {
    if (this.loadingIndicator) {
      setTimeout(() => {
        this.loadingIndicator.style.display = 'none';
      }, 300);
    }
  }
  
  /**
   * Muestra mensaje de error
   */
  showError() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add('error');
      this.loadingIndicator.innerHTML = `
        <div class="loader-content error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error al cargar productos</p>
          <button class="btn-retry" onclick="window.infiniteScroll?.loadMore()">
            <i class="fas fa-redo"></i> Reintentar
          </button>
        </div>
      `;
    }
  }
  
  /**
   * Muestra mensaje de fin
   */
  showEndMessage() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'block';
      this.loadingIndicator.innerHTML = `
        <div class="loader-content end">
          <i class="fas fa-check-circle"></i>
          <p>Has visto todos los productos disponibles</p>
        </div>
      `;
    }
  }
  
  /**
   * Resetea el infinite scroll
   */
  reset() {
    this.hasMore = true;
    this.isLoading = false;
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
      this.loadingIndicator.classList.remove('error');
    }
  }
  
  /**
   * Destruye el infinite scroll
   */
  destroy() {
    if (this.loadingIndicator && this.loadingIndicator.parentNode) {
      this.loadingIndicator.parentNode.removeChild(this.loadingIndicator);
    }
    // El scroll listener se mantiene por simplicidad
    // En producción, deberías guardarlo y removerlo aquí
  }
}

// Estilos para el infinite scroll (inyectados dinámicamente)
const injectStyles = () => {
  if (document.getElementById('infinite-scroll-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'infinite-scroll-styles';
  style.textContent = `
    .infinite-scroll-loader {
      padding: 3rem 1rem;
      text-align: center;
      animation: fadeIn 0.3s ease;
    }
    
    .loader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .loader-content .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2d5016;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loader-content p {
      font-size: 1rem;
      color: #666;
      margin: 0;
    }
    
    .loader-content.error i {
      font-size: 2rem;
      color: #e74c3c;
    }
    
    .loader-content.end i {
      font-size: 2rem;
      color: #27ae60;
    }
    
    .btn-retry {
      margin-top: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-retry:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  
  document.head.appendChild(style);
};

// Inyectar estilos cuando se cargue el módulo
if (typeof document !== 'undefined') {
  injectStyles();
}
