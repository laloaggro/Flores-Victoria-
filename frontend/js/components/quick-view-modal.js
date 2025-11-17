/**
 * ============================================================================
 * QuickView Modal Component v1.0.0
 * Vista rápida de productos sin cambiar de página
 * ============================================================================
 *
 * ⚠️ IMPORTANTE: Requiere CSS externo
 * ============================================================================
 * Este componente requiere el archivo CSS externo:
 * /css/quick-view.css
 *
 * Asegúrate de incluir en tu HTML ANTES de este script:
 * <link rel="stylesheet" href="/css/quick-view.css">
 * <script src="/js/components/quick-view-modal.js"></script>
 *
 * Características:
 * - 🖼️ Carousel de imágenes con navegación
 * - 🔍 Zoom en hover sobre imágenes
 * - 📋 Información completa del producto
 * - 🛒 Agregar al carrito directamente
 * - 🔢 Selector de cantidad
 * - 💝 Agregar a favoritos
 * - 📤 Compartir en redes sociales
 * - ⌨️ Cerrar con Esc o click fuera del modal
 * - 📱 Responsive y touch-friendly
 * - ♿ Accesible (ARIA, keyboard nav, focus trap)
 *
 * @author Flores Victoria Dev Team
 * @version 1.0.0
 * @date 2025-11-12
 */

(function () {
  'use strict';

  class QuickViewModal {
    constructor(config = {}) {
      this.config = {
        modalId: 'quick-view-modal',
        enableZoom: true,
        enableShare: true,
        enableWishlist: true,
        minQuantity: 1,
        maxQuantity: 99,
        closeOnEscape: true,
        closeOnOutsideClick: true,
        enableKeyboardNav: true,
        enableAnalytics: true,
        animationDuration: 300,
        ...config,
      };

      this.currentProduct = null;
      this.currentImageIndex = 0;
      this.quantity = 1;
      this.modal = null;
      this.focusTrap = null;

      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      // Crear modal en el DOM
      this.createModal();

      // Agregar event listeners
      this.attachGlobalListeners();

      // Exponer API pública
      window.QuickViewModal = this;
    }

    createModal() {
      // Verificar si ya existe
      if (document.getElementById(this.config.modalId)) {
        this.modal = document.getElementById(this.config.modalId);
        return;
      }

      // Crear estructura del modal
      const modalHTML = `
 <div id="${this.config.modalId}" class="quick-view-modal" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" style="display: none;">
 <div class="quick-view-overlay"></div>
 <div class="quick-view-container">
 <button class="quick-view-close" aria-label="Cerrar vista rápida" title="Cerrar (Esc)">
 <i class="fas fa-times"></i>
 </button>

 <div class="quick-view-content">
 <!-- Columna Izquierda: Imágenes -->
 <div class="quick-view-gallery">
 <div class="quick-view-main-image">
 <img src="" alt="" id="quick-view-main-img" class="zoomable-image">
 <div class="quick-view-badge"></div>
 </div>
 
 <div class="quick-view-thumbnails">
 <!-- Thumbnails dinámicos -->
 </div>

 <div class="quick-view-image-nav">
 <button class="image-nav-btn prev" aria-label="Imagen anterior">
 <i class="fas fa-chevron-left"></i>
 </button>
 <button class="image-nav-btn next" aria-label="Imagen siguiente">
 <i class="fas fa-chevron-right"></i>
 </button>
 </div>
 </div>

 <!-- Columna Derecha: Detalles -->
 <div class="quick-view-details">
 <div class="quick-view-header">
 <span class="quick-view-category" id="quick-view-category"></span>
 <h2 class="quick-view-title" id="quick-view-title"></h2>
 </div>

 <div class="quick-view-rating">
 <div class="stars" id="quick-view-stars"></div>
 <span class="reviews-count" id="quick-view-reviews"></span>
 </div>

 <div class="quick-view-price-section">
 <div class="quick-view-price" id="quick-view-price"></div>
 <div class="quick-view-stock" id="quick-view-stock">
 <i class="fas fa-check-circle"></i> En stock
 </div>
 </div>

 <div class="quick-view-description">
 <h3>Descripción</h3>
 <p id="quick-view-description"></p>
 </div>

 <div class="quick-view-features" id="quick-view-features">
 <!-- Features dinámicas -->
 </div>

 <div class="quick-view-actions">
 <div class="actions-grid">
 <div class="quantity-selector">
 <label>
 <i class="fas fa-boxes"></i>
 Cantidad
 </label>
 <div class="quantity-controls">
 <button class="quantity-btn minus" aria-label="Disminuir cantidad">
 <i class="fas fa-minus"></i>
 </button>
 <input type="number" class="quantity-input" id="quick-view-quantity" value="1" min="1" max="99" aria-label="Cantidad">
 <button class="quantity-btn plus" aria-label="Aumentar cantidad">
 <i class="fas fa-plus"></i>
 </button>
 </div>
 </div>

 <div class="action-buttons">
 <button class="btn-add-to-cart" id="quick-view-add-cart">
 <i class="fas fa-shopping-cart"></i>
 <span>Agregar al Carrito</span>
 </button>

 <button class="btn-wishlist" id="quick-view-wishlist" title="Agregar a favoritos">
 <i class="far fa-heart"></i>
 </button>
 </div>
 </div>
 </div>

 <div class="quick-view-meta">
 <div class="meta-item">
 <strong>SKU:</strong>
 <span id="quick-view-sku"></span>
 </div>
 <div class="meta-item">
 <strong>Categoría:</strong>
 <span id="quick-view-meta-category"></span>
 </div>
 </div>

 <div class="quick-view-share" id="quick-view-share">
 <p><strong>Compartir:</strong></p>
 <div class="share-buttons">
 <button class="share-btn facebook" data-network="facebook" title="Compartir en Facebook">
 <i class="fab fa-facebook-f"></i>
 </button>
 <button class="share-btn twitter" data-network="twitter" title="Compartir en Twitter">
 <i class="fab fa-twitter"></i>
 </button>
 <button class="share-btn whatsapp" data-network="whatsapp" title="Compartir en WhatsApp">
 <i class="fab fa-whatsapp"></i>
 </button>
 <button class="share-btn copy" data-network="copy" title="Copiar enlace">
 <i class="fas fa-link"></i>
 </button>
 </div>
 </div>

 <a href="#" class="quick-view-full-details" id="quick-view-full-link">
 Ver detalles completos <i class="fas fa-arrow-right"></i>
 </a>
 </div>
 </div>
 </div>
 </div>
 `;

      // Insertar en el body
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this.modal = document.getElementById(this.config.modalId);

      // Attach event listeners del modal
      this.attachModalListeners();
    }

    attachGlobalListeners() {
      // Interceptar clicks en botones "Ver detalles" o "Quick View"
      document.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('[data-quick-view]');
        if (viewBtn) {
          e.preventDefault();
          const productId = parseInt(viewBtn.dataset.quickView);
          this.open(productId);
        }
      });
    }

    attachModalListeners() {
      // Cerrar modal
      const closeBtn = this.modal.querySelector('.quick-view-close');
      closeBtn.addEventListener('click', () => this.close());

      // Cerrar con overlay
      if (this.config.closeOnOutsideClick) {
        const overlay = this.modal.querySelector('.quick-view-overlay');
        overlay.addEventListener('click', () => this.close());
      }

      // Cerrar con Esc
      if (this.config.closeOnEscape) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen()) {
            this.close();
          }
        });
      }

      // Navegación de imágenes
      const prevBtn = this.modal.querySelector('.image-nav-btn.prev');
      const nextBtn = this.modal.querySelector('.image-nav-btn.next');

      prevBtn.addEventListener('click', () => this.previousImage());
      nextBtn.addEventListener('click', () => this.nextImage());

      // Selector de cantidad
      const minusBtn = this.modal.querySelector('.quantity-btn.minus');
      const plusBtn = this.modal.querySelector('.quantity-btn.plus');
      const quantityInput = this.modal.querySelector('#quick-view-quantity');

      minusBtn.addEventListener('click', () => this.decreaseQuantity());
      plusBtn.addEventListener('click', () => this.increaseQuantity());
      quantityInput.addEventListener('change', (e) => this.setQuantity(e.target.value));

      // Agregar al carrito
      const addCartBtn = this.modal.querySelector('#quick-view-add-cart');
      addCartBtn.addEventListener('click', () => this.addToCart());

      // Wishlist
      const wishlistBtn = this.modal.querySelector('#quick-view-wishlist');
      wishlistBtn.addEventListener('click', () => this.toggleWishlist());

      // Share buttons
      const shareButtons = this.modal.querySelectorAll('.share-btn');
      shareButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const network = e.currentTarget.dataset.network;
          this.share(network);
        });
      });

      // Ver detalles completos button
      const fullDetailsBtn = this.modal.querySelector('#quick-view-full-link');
      fullDetailsBtn.addEventListener('click', (e) => this.goToProductDetail(e));

      // Keyboard navigation
      if (this.config.enableKeyboardNav) {
        this.modal.addEventListener('keydown', (e) => this.handleKeyboard(e));
      }
    }

    open(productId) {
      // Obtener datos del producto
      const product = this.getProduct(productId);

      if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        return;
      }

      this.currentProduct = product;
      this.currentImageIndex = 0;
      this.quantity = 1;

      // Renderizar contenido
      this.renderProduct(product);

      // Mostrar modal
      this.modal.style.display = 'flex';
      document.body.classList.add('modal-open');

      // Animación de entrada
      setTimeout(() => {
        this.modal.classList.add('is-open');
      }, 10);

      // Focus trap
      this.setupFocusTrap();

      // Analytics
      if (this.config.enableAnalytics && window.FloresVictoriaAnalytics) {
        window.FloresVictoriaAnalytics.trackQuickView(productId, product.name);
      }
    }

    close() {
      // Animación de salida
      this.modal.classList.remove('is-open');

      setTimeout(() => {
        this.modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        this.currentProduct = null;
        this.currentImageIndex = 0;
        this.quantity = 1;
      }, this.config.animationDuration);

      // Remover focus trap
      this.removeFocusTrap();
    }

    isOpen() {
      return this.modal.style.display !== 'none';
    }

    renderProduct(product) {
      // Título y categoría
      document.getElementById('quick-view-title').textContent = product.name;
      document.getElementById('quick-view-category').textContent = product.category;
      document.getElementById('quick-view-meta-category').textContent = product.category;

      // Precio
      const priceEl = document.getElementById('quick-view-price');
      priceEl.textContent = `$${product.price.toLocaleString('es-MX')}`;

      // Rating
      const starsEl = document.getElementById('quick-view-stars');
      const rating = product.rating || 5;
      starsEl.innerHTML =
        '<i class="fas fa-star"></i>'.repeat(rating) +
        '<i class="far fa-star"></i>'.repeat(5 - rating);

      document.getElementById('quick-view-reviews').textContent =
        `(${product.reviews || 0} reseñas)`;

      // Descripción
      document.getElementById('quick-view-description').textContent =
        product.description || 'Sin descripción disponible';

      // SKU
      document.getElementById('quick-view-sku').textContent = product.sku || `FV-${product.id}`;

      // Badge
      const badgeEl = this.modal.querySelector('.quick-view-badge');
      badgeEl.textContent = product.badge || 'Nuevo';

      // Stock
      const stockEl = document.getElementById('quick-view-stock');
      if (product.stock === false || product.stock === 0) {
        stockEl.innerHTML = '<i class="fas fa-times-circle"></i> Agotado';
        stockEl.classList.add('out-of-stock');
      } else {
        stockEl.innerHTML = '<i class="fas fa-check-circle"></i> En stock';
        stockEl.classList.remove('out-of-stock');
      }

      // Features (si existen)
      this.renderFeatures(product.features);

      // Imágenes
      this.renderImages(product);

      // Link a detalles completos
      const fullLink = document.getElementById('quick-view-full-link');
      fullLink.href = `/pages/product-detail.html?id=${product.id}`;

      // Wishlist state
      this.updateWishlistButton(product.id);
    }

    renderFeatures(features) {
      const container = document.getElementById('quick-view-features');

      if (!features || features.length === 0) {
        container.style.display = 'none';
        return;
      }

      container.style.display = 'block';
      container.innerHTML = '<h3>Características</h3><ul class="features-list"></ul>';

      const list = container.querySelector('.features-list');
      features.forEach((feature) => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check"></i> ${feature}`;
        list.appendChild(li);
      });
    }

    renderImages(product) {
      // Imagen principal
      const mainImg = document.getElementById('quick-view-main-img');
      const images = product.images || [product.image_url || product.image];
      const placeholderImage = '/images/placeholder-flower.svg';

      // Función para manejar error de imagen
      const handleImageError = (img) => {
        img.onerror = null; // Prevenir loop infinito
        img.src = placeholderImage;
        img.style.objectFit = 'contain';
        img.style.padding = '2rem';
      };

      mainImg.src = images[0] || placeholderImage;
      mainImg.alt = product.name;
      mainImg.onerror = () => handleImageError(mainImg);

      // Thumbnails
      const thumbnailsContainer = this.modal.querySelector('.quick-view-thumbnails');
      thumbnailsContainer.innerHTML = '';

      if (images.length > 1) {
        images.forEach((img, index) => {
          const thumb = document.createElement('button');
          thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
          const thumbImg = document.createElement('img');
          thumbImg.src = img || placeholderImage;
          thumbImg.alt = `${product.name} ${index + 1}`;
          thumbImg.onerror = () => handleImageError(thumbImg);
          thumb.appendChild(thumbImg);
          thumb.addEventListener('click', () => this.selectImage(index));
          thumbnailsContainer.appendChild(thumb);
        });
      } else {
        thumbnailsContainer.style.display = 'none';
      }

      // Zoom en hover (si está habilitado)
      if (this.config.enableZoom) {
        this.enableImageZoom(mainImg);
      }
    }

    selectImage(index) {
      if (!this.currentProduct) return;

      const images = this.currentProduct.images || [
        this.currentProduct.image_url || this.currentProduct.image,
      ];
      this.currentImageIndex = index;

      // Actualizar imagen principal
      const mainImg = document.getElementById('quick-view-main-img');
      mainImg.src = images[index];

      // Actualizar thumbnails activos
      const thumbnails = this.modal.querySelectorAll('.thumbnail');
      thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
      });
    }

    previousImage() {
      if (!this.currentProduct) return;

      const images = this.currentProduct.images || [
        this.currentProduct.image_url || this.currentProduct.image,
      ];
      this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
      this.selectImage(this.currentImageIndex);
    }

    nextImage() {
      if (!this.currentProduct) return;

      const images = this.currentProduct.images || [
        this.currentProduct.image_url || this.currentProduct.image,
      ];
      this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
      this.selectImage(this.currentImageIndex);
    }

    enableImageZoom(img) {
      img.addEventListener('mousemove', (e) => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        img.style.transformOrigin = `${x}% ${y}%`;
        img.style.transform = 'scale(1.5)';
      });

      img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
    }

    // Quantity methods
    increaseQuantity() {
      if (this.quantity < this.config.maxQuantity) {
        this.quantity++;
        this.updateQuantityInput();
      }
    }

    decreaseQuantity() {
      if (this.quantity > this.config.minQuantity) {
        this.quantity--;
        this.updateQuantityInput();
      }
    }

    setQuantity(value) {
      const num = parseInt(value);
      if (num >= this.config.minQuantity && num <= this.config.maxQuantity) {
        this.quantity = num;
      } else if (num < this.config.minQuantity) {
        this.quantity = this.config.minQuantity;
      } else {
        this.quantity = this.config.maxQuantity;
      }
      this.updateQuantityInput();
    }

    updateQuantityInput() {
      const input = this.modal.querySelector('#quick-view-quantity');
      input.value = this.quantity;
    }

    // Cart methods
    addToCart() {
      if (!this.currentProduct) return;

      // Llamar función global addToCart si existe
      if (typeof window.addToCart === 'function') {
        for (let i = 0; i < this.quantity; i++) {
          window.addToCart(this.currentProduct.id);
        }
        this.showNotification(
          `${this.currentProduct.name} (x${this.quantity}) agregado al carrito 🛒`,
          'success'
        );
      } else {
        console.warn('Función addToCart no disponible');
      }

      // Analytics
      if (this.config.enableAnalytics && window.FloresVictoriaAnalytics) {
        window.FloresVictoriaAnalytics.trackAddToCart(
          this.currentProduct.id,
          this.currentProduct.name,
          this.quantity,
          'quick-view'
        );
      }
    }

    toggleWishlist() {
      if (!this.currentProduct) return;

      if (typeof window.addToWishlist === 'function') {
        window.addToWishlist(this.currentProduct.id);
        this.updateWishlistButton(this.currentProduct.id);
      }
    }

    updateWishlistButton(productId) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const inWishlist = wishlist.some((item) => item.id === productId);

      const btn = this.modal.querySelector('#quick-view-wishlist');
      const icon = btn.querySelector('i');

      if (inWishlist) {
        icon.className = 'fas fa-heart';
        btn.classList.add('active');
      } else {
        icon.className = 'far fa-heart';
        btn.classList.remove('active');
      }
    }

    // Share methods
    share(network) {
      if (!this.currentProduct) return;

      const url = encodeURIComponent(
        `${window.location.origin}/pages/product-detail.html?id=${this.currentProduct.id}`
      );
      const text = encodeURIComponent(`¡Mira este hermoso arreglo! ${this.currentProduct.name}`);

      let shareUrl = '';

      switch (network) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          window.open(shareUrl, '_blank', 'width=600,height=400');
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
          window.open(shareUrl, '_blank', 'width=600,height=400');
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${text}%20${url}`;
          window.open(shareUrl, '_blank');
          break;
        case 'copy':
          navigator.clipboard.writeText(decodeURIComponent(url)).then(() => {
            this.showNotification('Enlace copiado al portapapeles ✓', 'success');
          });
          break;
      }

      // Analytics
      if (this.config.enableAnalytics && window.FloresVictoriaAnalytics) {
        window.FloresVictoriaAnalytics.trackShare(network, this.currentProduct.id);
      }
    }

    // Utilities
    getProduct(productId) {
      // Intentar obtener del catálogo global
      if (window.productCatalogInstance && window.productCatalogInstance.allProducts) {
        return window.productCatalogInstance.allProducts.find((p) => p.id === productId);
      }

      // Fallback: buscar en productsData global
      if (window.productsData) {
        return window.productsData.find((p) => p.id === productId);
      }

      return null;
    }

    handleKeyboard(e) {
      if (!this.isOpen()) return;

      switch (e.key) {
        case 'ArrowLeft':
          this.previousImage();
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.nextImage();
          e.preventDefault();
          break;
      }
    }

    setupFocusTrap() {
      // Elementos focusables
      const focusable = this.modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      this.focusTrap = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              lastFocusable.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              firstFocusable.focus();
              e.preventDefault();
            }
          }
        }
      };

      this.modal.addEventListener('keydown', this.focusTrap);
      firstFocusable?.focus();
    }

    removeFocusTrap() {
      if (this.focusTrap) {
        this.modal.removeEventListener('keydown', this.focusTrap);
        this.focusTrap = null;
      }
    }

    goToProductDetail(e) {
      e.preventDefault();
      
      const product = this.currentProduct;
      
      if (!product) {
        console.error('No hay producto actual para ver detalles');
        return;
      }

      // Analytics: registrar evento
      if (this.config.enableAnalytics && window.gtag) {
        gtag('event', 'view_product_details', {
          event_category: 'engagement',
          event_label: product.name,
          value: product.id
        });
      }

      // Mostrar feedback visual antes de redirigir
      const btn = e.currentTarget;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando detalles...';
      btn.style.pointerEvents = 'none';

      // Cerrar modal con animación
      this.close();

      // Redirigir después de un breve delay para suavizar la transición
      setTimeout(() => {
        window.location.href = `/pages/product-detail.html?id=${product.id}`;
      }, 300);

      // Restaurar botón después de un tiempo (por si el usuario regresa)
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.pointerEvents = '';
      }, 2000);
    }

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.style.cssText = `
 position: fixed;
 top: 20px;
 right: 20px;
 background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#dc3545' : '#C2185B'};
 color: white;
 padding: 1rem 1.5rem;
 border-radius: 8px;
 box-shadow: 0 4px 12px rgba(0,0,0,0.2);
 z-index: 10000;
 font-weight: 600;
 transform: translateX(100%);
 transition: transform 0.3s ease;
 `;
      notification.textContent = message;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  }

  // Exportar a window
  window.QuickViewModal = QuickViewModal;

  // Auto-inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new QuickViewModal();
    });
  } else {
    new QuickViewModal();
  }
})();
