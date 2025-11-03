/**
 * Quick View Modal Component
 * Shows product details in a modal without leaving current page
 */

class QuickView {
  constructor(options = {}) {
    this.options = {
      endpoint: '/api/products',
      animationDuration: 300,
      closeOnOverlay: true,
      enableKeyboard: true,
      imageGallery: true,
      ...options,
    };

    this.isOpen = false;
    this.currentProduct = null;
    this.currentImageIndex = 0;
    this.modal = null;

    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
  }

  createModal() {
    // Remove existing modal if any
    const existing = document.querySelector('.quick-view-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="quick-view-overlay"></div>
      <div class="quick-view-content">
        <button class="quick-view-close" aria-label="Cerrar vista rápida">
          <i class="fas fa-times"></i>
        </button>
        <div class="quick-view-body">
          <div class="quick-view-loading">
            <div class="spinner"></div>
            <p>Cargando producto...</p>
          </div>
          <div class="quick-view-error" style="display: none;">
            <i class="fas fa-exclamation-circle"></i>
            <p>Error al cargar el producto</p>
            <button class="btn btn-primary retry-btn">Reintentar</button>
          </div>
          <div class="quick-view-product" style="display: none;">
            <!-- Product content will be injected here -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
  }

  attachEventListeners() {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector('.quick-view-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Overlay click
    if (this.options.closeOnOverlay) {
      const overlay = this.modal.querySelector('.quick-view-overlay');
      overlay?.addEventListener('click', () => this.close());
    }

    // Keyboard events
    if (this.options.enableKeyboard) {
      document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Retry button
    const retryBtn = this.modal.querySelector('.retry-btn');
    retryBtn?.addEventListener('click', () => {
      if (this.currentProduct) {
        this.loadProduct(this.currentProduct.id || this.currentProduct);
      }
    });

    // Listen for quick view triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-quick-view]');
      if (trigger) {
        e.preventDefault();
        const productId = trigger.dataset.quickView;
        this.open(productId);
      }
    });
  }

  handleKeyboard(e) {
    if (!this.isOpen) return;

    switch (e.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
    }
  }

  async open(productId) {
    if (!productId) return;

    this.isOpen = true;
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    await this.loadProduct(productId);
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.currentProduct = null;
    this.currentImageIndex = 0;
  }

  async loadProduct(productId) {
    this.showLoading();

    try {
      const response = await fetch(`${this.options.endpoint}/${productId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el producto');
      }

      const data = await response.json();
      this.currentProduct = data.product || data;
      this.renderProduct();
    } catch (error) {
      console.error('Error loading product:', error);
      this.showError();
    }
  }

  showLoading() {
    const loading = this.modal.querySelector('.quick-view-loading');
    const error = this.modal.querySelector('.quick-view-error');
    const product = this.modal.querySelector('.quick-view-product');

    if (loading) loading.style.display = 'flex';
    if (error) error.style.display = 'none';
    if (product) product.style.display = 'none';
  }

  showError() {
    const loading = this.modal.querySelector('.quick-view-loading');
    const error = this.modal.querySelector('.quick-view-error');
    const product = this.modal.querySelector('.quick-view-product');

    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'flex';
    if (product) product.style.display = 'none';
  }

  renderProduct() {
    const loading = this.modal.querySelector('.quick-view-loading');
    const error = this.modal.querySelector('.quick-view-error');
    const productContainer = this.modal.querySelector('.quick-view-product');

    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'none';
    if (productContainer) productContainer.style.display = 'grid';

    const product = this.currentProduct;
    const images = product.images || [product.image] || [];
    const price = parseFloat(product.price || 0);
    const stock = parseInt(product.stock || 0);
    const discount = parseFloat(product.discount || 0);
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

    productContainer.innerHTML = `
      <div class="quick-view-gallery">
        ${this.renderGallery(images)}
      </div>
      <div class="quick-view-details">
        <div class="quick-view-header">
          ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
          <h2 class="product-name">${product.name}</h2>
          ${product.rating ? this.renderRating(product.rating, product.reviews || 0) : ''}
        </div>

        <div class="product-price-section">
          ${discount > 0 ? `
            <div class="price-wrapper">
              <span class="price-original">$${price.toFixed(2)}</span>
              <span class="price-discount">${discount}% OFF</span>
            </div>
          ` : ''}
          <div class="price-current">$${finalPrice.toFixed(2)}</div>
        </div>

        ${product.description ? `
          <div class="product-description">
            <h3>Descripción</h3>
            <p>${product.description}</p>
          </div>
        ` : ''}

        ${product.features ? this.renderFeatures(product.features) : ''}

        <div class="product-stock">
          ${stock > 0 ? `
            <span class="stock-available">
              <i class="fas fa-check-circle"></i>
              ${stock} disponibles
            </span>
          ` : `
            <span class="stock-unavailable">
              <i class="fas fa-times-circle"></i>
              Sin stock
            </span>
          `}
        </div>

        <div class="product-actions">
          <div class="quantity-selector">
            <label for="quantity-${product.id}">Cantidad:</label>
            <div class="quantity-controls">
              <button class="quantity-btn decrease" data-action="decrease">
                <i class="fas fa-minus"></i>
              </button>
              <input 
                type="number" 
                id="quantity-${product.id}" 
                class="quantity-input" 
                value="1" 
                min="1" 
                max="${stock}"
                ${stock === 0 ? 'disabled' : ''}
              >
              <button class="quantity-btn increase" data-action="increase">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>

          <div class="action-buttons">
            <button 
              class="btn btn-primary add-to-cart-btn" 
              data-product-id="${product.id}"
              ${stock === 0 ? 'disabled' : ''}
            >
              <i class="fas fa-shopping-cart"></i>
              ${stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
            </button>
            <button class="btn btn-outline add-to-wishlist-btn" data-product-id="${product.id}">
              <i class="far fa-heart"></i>
            </button>
          </div>

          <a href="/pages/product-detail.html?id=${product.id}" class="view-full-details">
            Ver detalles completos
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;

    this.attachProductEventListeners();
  }

  renderGallery(images) {
    if (!images || images.length === 0) {
      return '<div class="gallery-placeholder"><i class="fas fa-image"></i></div>';
    }

    return `
      <div class="gallery-main">
        <img 
          src="${images[0]}" 
          alt="Imagen principal" 
          class="gallery-main-image"
          loading="eager"
        >
        ${images.length > 1 ? `
          <button class="gallery-nav prev" aria-label="Imagen anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="gallery-nav next" aria-label="Imagen siguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        ` : ''}
      </div>
      ${images.length > 1 ? `
        <div class="gallery-thumbnails">
          ${images.map((img, index) => `
            <button 
              class="gallery-thumb ${index === 0 ? 'active' : ''}" 
              data-index="${index}"
              aria-label="Ver imagen ${index + 1}"
            >
              <img src="${img}" alt="Miniatura ${index + 1}">
            </button>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  renderRating(rating, reviewCount) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('<i class="fas fa-star"></i>');
      } else if (i - 0.5 <= rating) {
        stars.push('<i class="fas fa-star-half-alt"></i>');
      } else {
        stars.push('<i class="far fa-star"></i>');
      }
    }

    return `
      <div class="product-rating">
        <div class="rating-stars">${stars.join('')}</div>
        <span class="rating-count">(${reviewCount} ${reviewCount === 1 ? 'reseña' : 'reseñas'})</span>
      </div>
    `;
  }

  renderFeatures(features) {
    if (!Array.isArray(features) || features.length === 0) return '';

    return `
      <div class="product-features">
        <h3>Características</h3>
        <ul>
          ${features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  attachProductEventListeners() {
    // Quantity controls
    const decreaseBtn = this.modal.querySelector('.quantity-btn.decrease');
    const increaseBtn = this.modal.querySelector('.quantity-btn.increase');
    const quantityInput = this.modal.querySelector('.quantity-input');

    decreaseBtn?.addEventListener('click', () => {
      const current = parseInt(quantityInput.value);
      if (current > 1) quantityInput.value = current - 1;
    });

    increaseBtn?.addEventListener('click', () => {
      const current = parseInt(quantityInput.value);
      const max = parseInt(quantityInput.max);
      if (current < max) quantityInput.value = current + 1;
    });

    // Add to cart
    const addToCartBtn = this.modal.querySelector('.add-to-cart-btn');
    addToCartBtn?.addEventListener('click', () => this.addToCart());

    // Add to wishlist
    const addToWishlistBtn = this.modal.querySelector('.add-to-wishlist-btn');
    addToWishlistBtn?.addEventListener('click', () => this.addToWishlist());

    // Gallery navigation
    const prevBtn = this.modal.querySelector('.gallery-nav.prev');
    const nextBtn = this.modal.querySelector('.gallery-nav.next');

    prevBtn?.addEventListener('click', () => this.previousImage());
    nextBtn?.addEventListener('click', () => this.nextImage());

    // Thumbnail clicks
    const thumbnails = this.modal.querySelectorAll('.gallery-thumb');
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.dataset.index);
        this.showImage(index);
      });
    });
  }

  previousImage() {
    const images = this.currentProduct?.images || [];
    if (images.length <= 1) return;

    this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
    this.showImage(this.currentImageIndex);
  }

  nextImage() {
    const images = this.currentProduct?.images || [];
    if (images.length <= 1) return;

    this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
    this.showImage(this.currentImageIndex);
  }

  showImage(index) {
    const images = this.currentProduct?.images || [];
    if (!images[index]) return;

    this.currentImageIndex = index;

    const mainImage = this.modal.querySelector('.gallery-main-image');
    if (mainImage) {
      mainImage.src = images[index];
    }

    // Update active thumbnail
    const thumbnails = this.modal.querySelectorAll('.gallery-thumb');
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  async addToCart() {
    const quantityInput = this.modal.querySelector('.quantity-input');
    const quantity = parseInt(quantityInput?.value || 1);

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: this.currentProduct.id,
          quantity,
        }),
      });

      if (response.ok) {
        // Emit event for cart update
        document.dispatchEvent(new CustomEvent('cart:item-added', {
          detail: {
            product: this.currentProduct,
            quantity,
          },
        }));

        this.showNotification('Producto agregado al carrito', 'success');
        this.close();
      } else {
        throw new Error('Error al agregar al carrito');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showNotification('Error al agregar al carrito', 'error');
    }
  }

  async addToWishlist() {
    try {
      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: this.currentProduct.id,
        }),
      });

      if (response.ok) {
        this.showNotification('Producto agregado a favoritos', 'success');
        
        // Update heart icon
        const wishlistBtn = this.modal.querySelector('.add-to-wishlist-btn i');
        if (wishlistBtn) {
          wishlistBtn.className = 'fas fa-heart';
        }
      } else {
        throw new Error('Error al agregar a favoritos');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showNotification('Error al agregar a favoritos', 'error');
    }
  }

  showNotification(message, type = 'info') {
    if (window.ToastNotification) {
      const toast = new window.ToastNotification();
      toast[type](message);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.quickView = new QuickView();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickView;
}
