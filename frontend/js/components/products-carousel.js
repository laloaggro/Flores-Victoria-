/**
 * ============================================================================
 * Products Carousel Component v2.0.0 - Flores Victoria
 * ============================================================================
 *
 * Carrusel de productos con navegación táctil y teclado.
 *
 * ⚠️  IMPORTANTE: Requiere CSS externo
 * ============================================================================
 * Este componente requiere el archivo CSS externo:
 *   /css/components/products-carousel.css
 *
 * Asegúrate de incluir en tu HTML ANTES de este script:
 *   <link rel="stylesheet" href="/css/components/products-carousel.css">
 *   <script src="/js/components/products-carousel.js"></script>
 *
 * @component ProductsCarousel
 * @version 2.0.0
 * @author Flores Victoria Team
 * @license MIT
 *
 * @features
 * - 🎨 Diseño responsive con scroll horizontal
 * - 👆 Navegación táctil (swipe) y botones
 * - ⌨️ Accesibilidad completa (ARIA, teclado)
 * - 🔄 Auto-play opcional con pausa en hover
 * - 🎯 Integración con cart-manager
 * - 📊 Analytics tracking
 * - 🖼️ Lazy loading de imágenes
 * - ⚡ Renderizado eficiente
 *
 * @example HTML
 * <products-carousel
 *   title="Productos Destacados"
 *   category="featured"
 *   limit="8"
 *   auto-play="true"
 *   interval="5000"
 * ></products-carousel>
 *
 * @attributes
 * - title: string - Título del carrusel (default: "Productos Destacados")
 * - category: string - Categoría de productos (default: "featured")
 * - limit: number - Cantidad de productos (default: 8)
 * - auto-play: boolean - Auto-reproducción (default: false)
 * - interval: number - Intervalo en ms (default: 5000)
 */

(function () {
  'use strict';

  /**
   * Datos de productos de ejemplo
   * TODO: Reemplazar con API call real
   */
  const SAMPLE_PRODUCTS = [
    {
      id: 'AML001',
      name: 'Ramo "Pasión Eterna"',
      description: 'Exuberante ramo de 12 rosas rojas premium',
      price: 35000,
      original_price: 42000,
      image: '/images/products/final/AML001.webp',
      category: 'featured',
      rating: 4.9,
      stock: 15,
    },
    {
      id: 'AML002',
      name: 'Bouquet "Romance Rosa"',
      description: 'Delicado bouquet de rosas rosadas',
      price: 28000,
      original_price: 35000,
      image: '/images/products/final/AML002.webp',
      category: 'featured',
      rating: 4.8,
      stock: 20,
    },
    {
      id: 'PLT001',
      name: 'Ramo de Rosas Rojas Premium',
      description: 'Clásico ramo de 12 rosas rojas con follaje fresco',
      price: 45000,
      original_price: 55000,
      image: '/images/products/final/PLT001.webp',
      category: 'featured',
      rating: 4.7,
      stock: 12,
    },
    {
      id: 'VAR007',
      name: 'Lirios Asiáticos Luxury',
      description: 'Ramo de lirios asiáticos en tonos rosa, naranja y blanco',
      price: 54000,
      original_price: 68000,
      image: '/images/products/final/VAR007.webp',
      category: 'featured',
      rating: 5.0,
      stock: 4,
    },
    {
      id: 'EXO001',
      name: 'Orquídea Phalaenopsis Elegante',
      description: 'Elegante orquídea en maceta, ideal para regalo corporativo',
      price: 75000,
      original_price: 85000,
      image: '/images/products/final/EXO001.webp',
      category: 'featured',
      rating: 4.8,
      stock: 7,
    },
    {
      id: 'AML003',
      name: 'Arreglo Aniversario de Amor',
      description: 'Romántico arreglo con rosas rojas, lirios y detalles dorados',
      price: 65000,
      original_price: 78000,
      image: '/images/products/final/AML003.webp',
      category: 'featured',
      rating: 4.9,
      stock: 10,
    },
    {
      id: 'VAR001',
      name: 'Ramo Primaveral Multicolor',
      description: 'Explosión de colores con tulipanes, ranúnculos y fresias',
      price: 48000,
      original_price: 58000,
      image: '/images/products/final/VAR001.webp',
      category: 'featured',
      rating: 4.8,
      stock: 14,
    },
    {
      id: 'PLT003',
      name: 'Girasoles Radiantes',
      description: 'Arreglo de 8 girasoles con detalles verdes y flores de campo',
      price: 38000,
      original_price: 46000,
      image: '/images/products/final/PLT003.webp',
      category: 'featured',
      rating: 4.6,
      stock: 6,
    },
  ];

  /**
   * Web Component: ProductsCarousel
   */
  class ProductsCarousel extends HTMLElement {
    constructor() {
      super();

      // Configuración
      this.config = {
        title: this.getAttribute('title') || 'Productos Destacados',
        category: this.getAttribute('category') || 'featured',
        limit: parseInt(this.getAttribute('limit')) || 8,
        autoPlay: this.getAttribute('auto-play') === 'true',
        interval: parseInt(this.getAttribute('interval')) || 5000,
      };

      // Estado
      this.state = {
        products: [],
        currentIndex: 0,
        isPlaying: this.config.autoPlay,
        isDragging: false,
        startX: 0,
        scrollLeft: 0,
      };

      // Referencias
      this.refs = {
        container: null,
        track: null,
        prevBtn: null,
        nextBtn: null,
        dots: null,
      };

      // Intervalos
      this.autoPlayInterval = null;
    }

    /**
     * Lifecycle: connectedCallback
     */
    connectedCallback() {
      this.loadProducts();
      this.render();
      this.attachEventListeners();
      if (this.config.autoPlay) {
        this.startAutoPlay();
      }
      this.trackView();
    }

    /**
     * Lifecycle: disconnectedCallback
     */
    disconnectedCallback() {
      this.stopAutoPlay();
      this.detachEventListeners();
    }

    /**
     * Cargar productos
     */
    loadProducts() {
      // TODO: Reemplazar con API call
      // const url = `/api/products?category=${this.config.category}&limit=${this.config.limit}`;

      this.state.products = SAMPLE_PRODUCTS.filter(
        (p) => p.category === this.config.category
      ).slice(0, this.config.limit);

      // Si no hay suficientes, usar todos
      if (this.state.products.length < this.config.limit) {
        this.state.products = SAMPLE_PRODUCTS.slice(0, this.config.limit);
      }
    }

    /**
     * Renderizar componente
     */
    render() {
      const { title } = this.config;
      const { products } = this.state;

      this.innerHTML = `
        <section class="products-carousel" data-component="products-carousel">
          <div class="container">
            <div class="carousel-header">
              <h2 class="carousel-title">${this.escapeHtml(title)}</h2>
              <div class="carousel-controls">
                <button class="carousel-btn carousel-btn-prev" aria-label="Producto anterior">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="carousel-btn carousel-btn-next" aria-label="Producto siguiente">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="carousel-container" role="region" aria-label="${this.escapeHtml(title)}">
              <div class="carousel-track">
                ${products.map((product) => this.renderProduct(product)).join('')}
              </div>
            </div>

            ${products.length > 4 ? this.renderDots() : ''}
          </div>
        </section>
      `;

      this.refs.container = this.querySelector('.carousel-container');
      this.refs.track = this.querySelector('.carousel-track');
      this.refs.prevBtn = this.querySelector('.carousel-btn-prev');
      this.refs.nextBtn = this.querySelector('.carousel-btn-next');
      this.refs.dots = this.querySelector('.carousel-dots');

      this.injectStyles();
    }

    /**
     * Renderizar producto
     */
    renderProduct(product) {
      const discount = product.original_price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0;

      return `
        <article class="product-card" data-product-id="${product.id}">
          ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ''}
          
          <div class="product-image">
            <img 
              src="${product.image}" 
              alt="${this.escapeHtml(product.name)}"
              loading="lazy"
              onerror="this.src='/images/placeholder-product.jpg'"
            />
          </div>

          <div class="product-info">
            <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
            <p class="product-description">${this.escapeHtml(product.description)}</p>
            
            <div class="product-rating" aria-label="Calificación: ${product.rating} de 5 estrellas">
              ${this.renderStars(product.rating)}
              <span class="rating-value">${product.rating}</span>
            </div>

            <div class="product-footer">
              <div class="product-price">
                ${
                  product.original_price
                    ? `
                  <span class="price-original">$${this.formatPrice(product.original_price)}</span>
                `
                    : ''
                }
                <span class="price-current">$${this.formatPrice(product.price)}</span>
              </div>

              <button 
                class="btn-add-to-cart" 
                data-product-id="${product.id}"
                aria-label="Agregar ${this.escapeHtml(product.name)} al carrito"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 2l-7 20 20-7-3-3-10 7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 3l-3 3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Agregar
              </button>
            </div>
          </div>

          ${
            product.stock < 5 && product.stock > 0
              ? `
            <div class="stock-warning">¡Solo ${product.stock} disponibles!</div>
          `
              : ''
          }
        </article>
      `;
    }

    /**
     * Renderizar estrellas de rating
     */
    renderStars(rating) {
      const fullStars = Math.floor(rating);
      const hasHalf = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

      let stars = '';
      for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star star-full">★</span>';
      }
      if (hasHalf) {
        stars += '<span class="star star-half">★</span>';
      }
      for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star star-empty">☆</span>';
      }
      return stars;
    }

    /**
     * Renderizar dots de navegación
     */
    renderDots() {
      const { products } = this.state;
      const dotsCount = Math.ceil(products.length / 4);

      return `
        <div class="carousel-dots" role="tablist" aria-label="Navegación del carrusel">
          ${Array.from(
            { length: dotsCount },
            (_, i) => `
            <button 
              class="carousel-dot ${i === 0 ? 'active' : ''}" 
              role="tab"
              aria-selected="${i === 0}"
              aria-label="Ver productos ${i * 4 + 1} a ${Math.min((i + 1) * 4, products.length)}"
              data-index="${i}"
            ></button>
          `
          ).join('')}
        </div>
      `;
    }

    /**
     * Adjuntar event listeners
     */
    attachEventListeners() {
      // Navegación
      if (this.refs.prevBtn) {
        this.refs.prevBtn.addEventListener('click', () => this.navigate('prev'));
      }
      if (this.refs.nextBtn) {
        this.refs.nextBtn.addEventListener('click', () => this.navigate('next'));
      }

      // Dots
      if (this.refs.dots) {
        this.refs.dots.querySelectorAll('.carousel-dot').forEach((dot) => {
          dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            this.goToSlide(index);
          });
        });
      }

      // Touch/Mouse drag
      if (this.refs.container) {
        this.refs.container.addEventListener('mousedown', (e) => this.handleDragStart(e));
        this.refs.container.addEventListener('touchstart', (e) => this.handleDragStart(e));
        this.refs.container.addEventListener('mousemove', (e) => this.handleDragMove(e));
        this.refs.container.addEventListener('touchmove', (e) => this.handleDragMove(e));
        this.refs.container.addEventListener('mouseup', () => this.handleDragEnd());
        this.refs.container.addEventListener('touchend', () => this.handleDragEnd());
        this.refs.container.addEventListener('mouseleave', () => this.handleDragEnd());

        // Pausa auto-play en hover
        if (this.config.autoPlay) {
          this.refs.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
          this.refs.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }
      }

      // Botones "Agregar al carrito"
      this.querySelectorAll('.btn-add-to-cart').forEach((btn) => {
        btn.addEventListener('click', (e) => this.handleAddToCart(e));
      });

      // Teclado
      this.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Remover event listeners
     */
    detachEventListeners() {
      // Los event listeners se limpian automáticamente al desconectar el componente
    }

    /**
     * Navegar en el carrusel
     */
    navigate(direction) {
      const itemsPerView = this.getItemsPerView();
      const maxIndex = Math.ceil(this.state.products.length / itemsPerView) - 1;

      if (direction === 'next') {
        this.state.currentIndex = Math.min(this.state.currentIndex + 1, maxIndex);
      } else {
        this.state.currentIndex = Math.max(this.state.currentIndex - 1, 0);
      }

      this.updateCarousel();
      this.trackNavigation(direction);
    }

    /**
     * Ir a slide específico
     */
    goToSlide(index) {
      this.state.currentIndex = index;
      this.updateCarousel();
    }

    /**
     * Actualizar carrusel
     */
    updateCarousel() {
      const itemsPerView = this.getItemsPerView();
      const scrollAmount = this.state.currentIndex * (100 / itemsPerView);

      if (this.refs.track) {
        this.refs.track.style.transform = `translateX(-${scrollAmount}%)`;
      }

      // Actualizar dots
      if (this.refs.dots) {
        const dots = this.refs.dots.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
          if (index === this.state.currentIndex) {
            dot.classList.add('active');
            dot.setAttribute('aria-selected', 'true');
          } else {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
          }
        });
      }

      // Habilitar/deshabilitar botones
      if (this.refs.prevBtn) {
        this.refs.prevBtn.disabled = this.state.currentIndex === 0;
      }
      if (this.refs.nextBtn) {
        const maxIndex = Math.ceil(this.state.products.length / itemsPerView) - 1;
        this.refs.nextBtn.disabled = this.state.currentIndex >= maxIndex;
      }
    }

    /**
     * Obtener items por vista según viewport
     */
    getItemsPerView() {
      const width = window.innerWidth;
      if (width >= 1200) return 4;
      if (width >= 768) return 3;
      if (width >= 480) return 2;
      return 1;
    }

    /**
     * Drag handlers
     */
    handleDragStart(e) {
      this.state.isDragging = true;
      this.state.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      this.state.scrollLeft = this.refs.container.scrollLeft;
      this.refs.container.style.cursor = 'grabbing';
      this.pauseAutoPlay();
    }

    handleDragMove(e) {
      if (!this.state.isDragging) return;
      e.preventDefault();

      const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const walk = (x - this.state.startX) * 2;
      this.refs.container.scrollLeft = this.state.scrollLeft - walk;
    }

    handleDragEnd() {
      if (!this.state.isDragging) return;
      this.state.isDragging = false;
      this.refs.container.style.cursor = 'grab';
      this.resumeAutoPlay();
    }

    /**
     * Agregar producto al carrito
     */
    handleAddToCart(e) {
      e.preventDefault();
      const productId = e.currentTarget.dataset.productId;
      const product = this.state.products.find((p) => p.id === productId);

      if (!product) return;

      // Usar CartManager global si está disponible
      if (window.FloresVictoriaComponents?.CartManager) {
        window.FloresVictoriaComponents.CartManager.addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        });

        // Toast notification
        if (window.FloresVictoriaComponents?.Toast) {
          window.FloresVictoriaComponents.Toast.show({
            message: `✅ ${product.name} agregado al carrito`,
            type: 'success',
            duration: 3000,
          });
        }
      }

      // Analytics
      this.trackAddToCart(product);
    }

    /**
     * Keyboard navigation
     */
    handleKeyboard(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.navigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.navigate('next');
      }
    }

    /**
     * Auto-play
     */
    startAutoPlay() {
      if (!this.config.autoPlay) return;

      this.autoPlayInterval = setInterval(() => {
        const itemsPerView = this.getItemsPerView();
        const maxIndex = Math.ceil(this.state.products.length / itemsPerView) - 1;

        if (this.state.currentIndex >= maxIndex) {
          this.state.currentIndex = 0;
        } else {
          this.navigate('next');
        }
      }, this.config.interval);
    }

    stopAutoPlay() {
      if (this.autoPlayInterval) {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
      }
    }

    pauseAutoPlay() {
      if (this.config.autoPlay && this.state.isPlaying) {
        this.stopAutoPlay();
      }
    }

    resumeAutoPlay() {
      if (this.config.autoPlay && this.state.isPlaying) {
        this.startAutoPlay();
      }
    }

    /**
     * Analytics tracking
     */
    trackView() {
      if (window.FloresVictoriaComponents?.Analytics) {
        window.FloresVictoriaComponents.Analytics.track('carousel_view', {
          carousel_title: this.config.title,
          carousel_category: this.config.category,
          products_count: this.state.products.length,
        });
      }
    }

    trackNavigation(direction) {
      if (window.FloresVictoriaComponents?.Analytics) {
        window.FloresVictoriaComponents.Analytics.track('carousel_navigate', {
          carousel_title: this.config.title,
          direction,
          slide_index: this.state.currentIndex,
        });
      }
    }

    trackAddToCart(product) {
      if (window.FloresVictoriaComponents?.Analytics) {
        window.FloresVictoriaComponents.Analytics.track('add_to_cart', {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          source: 'carousel',
        });
      }
    }

    /**
     * Utilities
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /**
     * Verificar que el CSS externo esté cargado
     */
    injectStyles() {
      // Verificar si el CSS externo está cargado
      const cssLoaded = Array.from(document.styleSheets).some((sheet) => {
        try {
          return sheet.href && sheet.href.includes('products-carousel.css');
        } catch (e) {
          return false;
        }
      });

      if (!cssLoaded) {
        console.warn(
          '[ProductsCarousel] ⚠️  CSS externo no detectado. ' +
            'Asegúrate de incluir: <link rel="stylesheet" href="/css/components/products-carousel.css">'
        );
      }
    }
  }

  // Registrar Web Component
  if ('customElements' in window) {
    customElements.define('products-carousel', ProductsCarousel);
    console.log('✅ ProductsCarousel Web Component registrado');
  } else {
    console.error('❌ customElements no soportado en este navegador');
  }

  // Exportar globalmente
  window.FloresVictoriaComponents = window.FloresVictoriaComponents || {};
  window.FloresVictoriaComponents.ProductsCarousel = ProductsCarousel;
})();
