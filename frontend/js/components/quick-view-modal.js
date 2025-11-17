/**/**

 * Quick View Modal v2.0.0 - Completamente nuevo * ============================================================================

 * Vista rápida simple y funcional * QuickView Modal Component v1.0.0

 */ * Vista rápida de productos sin cambiar de página

 * ============================================================================

(function() { *

  'use strict'; * ⚠️ IMPORTANTE: Requiere CSS externo

 * ============================================================================

  class QuickViewModal { * Este componente requiere el archivo CSS externo:

    constructor() { * /css/quick-view.css

      this.modal = null; *

      this.currentProduct = null; * Asegúrate de incluir en tu HTML ANTES de este script:

      this.currentQuantity = 1; * <link rel="stylesheet" href="/css/quick-view.css">

      this.products = []; * <script src="/js/components/quick-view-modal.js"></script>

       *

      this.init(); * Características:

    } * - 🖼️ Carousel de imágenes con navegación

 * - 🔍 Zoom en hover sobre imágenes

    init() { * - 📋 Información completa del producto

      // Crear el modal * - 🛒 Agregar al carrito directamente

      this.createModal(); * - 🔢 Selector de cantidad

       * - 💝 Agregar a favoritos

      // Cargar productos * - 📤 Compartir en redes sociales

      this.loadProducts(); * - ⌨️ Cerrar con Esc o click fuera del modal

       * - 📱 Responsive y touch-friendly

      // Event listeners globales * - ♿ Accesible (ARIA, keyboard nav, focus trap)

      this.setupGlobalListeners(); *

       * @author Flores Victoria Dev Team

      console.log('✅ Quick View Modal v2.0 inicializado'); * @version 1.0.0

    } * @date 2025-11-12

 */

    createModal() {

      const modalHTML = `(function () {

        <div id="quick-view-modal" class="quick-view-modal" style="display: none;">  'use strict';

          <div class="quick-view-overlay"></div>

          <div class="quick-view-container">  class QuickViewModal {

            <!-- Botón cerrar -->    constructor(config = {}) {

            <button class="quick-view-close" aria-label="Cerrar">      this.config = {

              <i class="fas fa-times"></i>        modalId: 'quick-view-modal',

            </button>        enableZoom: true,

        enableShare: true,

            <!-- Contenido -->        enableWishlist: true,

            <div class="quick-view-content">        minQuantity: 1,

              <!-- Galería -->        maxQuantity: 99,

              <div class="quick-view-gallery">        closeOnEscape: true,

                <div class="quick-view-main-image">        closeOnOutsideClick: true,

                  <img id="qv-main-img" src="" alt="">        enableKeyboardNav: true,

                </div>        enableAnalytics: true,

                <div class="quick-view-thumbnails" id="qv-thumbnails">        animationDuration: 300,

                  <!-- Thumbnails dinámicos -->        ...config,

                </div>      };

              </div>

      this.currentProduct = null;

              <!-- Info del producto -->      this.currentImageIndex = 0;

              <div class="quick-view-info">      this.quantity = 1;

                <span class="qv-category" id="qv-category"></span>      this.modal = null;

                <h2 class="qv-title" id="qv-title"></h2>      this.focusTrap = null;

                

                <div class="qv-rating">      this.init();

                  <div class="qv-stars" id="qv-stars"></div>    }

                  <span class="qv-reviews" id="qv-reviews"></span>

                </div>    init() {

      if (document.readyState === 'loading') {

                <div class="qv-price-section">        document.addEventListener('DOMContentLoaded', () => this.setup());

                  <div class="qv-price" id="qv-price"></div>      } else {

                  <div class="qv-stock">        this.setup();

                    <i class="fas fa-check-circle"></i> Disponible      }

                  </div>    }

                </div>

    setup() {

                <p class="qv-description" id="qv-description"></p>      // Crear modal en el DOM

      this.createModal();

                <!-- Cantidad -->

                <div class="qv-quantity">      // Agregar event listeners

                  <label><i class="fas fa-boxes"></i> Cantidad:</label>      this.attachGlobalListeners();

                  <div class="qv-quantity-controls">

                    <button class="qv-qty-btn" id="qv-qty-minus">-</button>      // Exponer API pública

                    <input type="number" id="qv-qty-input" value="1" min="1" max="99">      window.QuickViewModal = this;

                    <button class="qv-qty-btn" id="qv-qty-plus">+</button>    }

                  </div>

                </div>    createModal() {

      // Verificar si ya existe

                <!-- Botones de acción -->      if (document.getElementById(this.config.modalId)) {

                <div class="qv-actions">        this.modal = document.getElementById(this.config.modalId);

                  <button class="qv-btn-cart" id="qv-btn-cart">        return;

                    <i class="fas fa-shopping-cart"></i>      }

                    Agregar al Carrito

                  </button>      // Crear estructura del modal

                  <button class="qv-btn-wishlist" id="qv-btn-wishlist">      const modalHTML = `

                    <i class="far fa-heart"></i> <div id="${this.config.modalId}" class="quick-view-modal" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" style="display: none;">

                  </button> <div class="quick-view-overlay"></div>

                </div> <div class="quick-view-container">

 <button class="quick-view-close" aria-label="Cerrar vista rápida" title="Cerrar (Esc)">

                <!-- Ver detalles completos --> <i class="fas fa-times"></i>

                <button class="qv-btn-details" id="qv-btn-details"> </button>

                  <i class="fas fa-eye"></i>

                  Ver Detalles Completos <div class="quick-view-content">

                  <i class="fas fa-arrow-right"></i> <!-- Columna Izquierda: Imágenes -->

                </button> <div class="quick-view-gallery">

              </div> <div class="quick-view-main-image">

            </div> <img src="" alt="" id="quick-view-main-img" class="zoomable-image">

          </div> <div class="quick-view-badge"></div>

        </div> </div>

      `; 

 <div class="quick-view-thumbnails">

      document.body.insertAdjacentHTML('beforeend', modalHTML); <!-- Thumbnails dinámicos -->

      this.modal = document.getElementById('quick-view-modal'); </div>

      

      // Event listeners del modal <div class="quick-view-image-nav">

      this.setupModalListeners(); <button class="image-nav-btn prev" aria-label="Imagen anterior">

    } <i class="fas fa-chevron-left"></i>

 </button>

    setupGlobalListeners() { <button class="image-nav-btn next" aria-label="Imagen siguiente">

      // Escuchar clicks en botones de quick view <i class="fas fa-chevron-right"></i>

      document.addEventListener('click', (e) => { </button>

        const btn = e.target.closest('[data-action="quick-view"]'); </div>

        if (btn) { </div>

          e.preventDefault();

          const productId = parseInt(btn.dataset.productId); <!-- Columna Derecha: Detalles -->

          this.open(productId); <div class="quick-view-details">

        } <div class="quick-view-header">

      }); <span class="quick-view-category" id="quick-view-category"></span>

    } <h2 class="quick-view-title" id="quick-view-title"></h2>

 </div>

    setupModalListeners() {

      // Cerrar modal <div class="quick-view-rating">

      const closeBtn = this.modal.querySelector('.quick-view-close'); <div class="stars" id="quick-view-stars"></div>

      const overlay = this.modal.querySelector('.quick-view-overlay'); <span class="reviews-count" id="quick-view-reviews"></span>

       </div>

      closeBtn.addEventListener('click', () => this.close());

      overlay.addEventListener('click', () => this.close()); <div class="quick-view-price-section">

 <div class="quick-view-price" id="quick-view-price"></div>

      // Escape key <div class="quick-view-stock" id="quick-view-stock">

      document.addEventListener('keydown', (e) => { <i class="fas fa-check-circle"></i> En stock

        if (e.key === 'Escape' && this.isOpen()) { </div>

          this.close(); </div>

        }

      }); <div class="quick-view-description">

 <p id="quick-view-description" style="font-size: 0.9375rem; color: #6c757d; line-height: 1.6; margin-bottom: 1.5rem;"></p>

      // Cantidad </div>

      document.getElementById('qv-qty-minus').addEventListener('click', () => {

        this.decreaseQuantity(); <div class="quick-view-actions">

      }); <div class="actions-grid">

 <div class="quantity-selector">

      document.getElementById('qv-qty-plus').addEventListener('click', () => { <label>

        this.increaseQuantity(); <i class="fas fa-boxes"></i>

      }); Cantidad

 </label>

      document.getElementById('qv-qty-input').addEventListener('change', (e) => { <div class="quantity-controls">

        this.setQuantity(parseInt(e.target.value)); <button class="quantity-btn minus" aria-label="Disminuir cantidad">

      }); <i class="fas fa-minus"></i>

 </button>

      // Agregar al carrito <input type="number" class="quantity-input" id="quick-view-quantity" value="1" min="1" max="99" aria-label="Cantidad">

      document.getElementById('qv-btn-cart').addEventListener('click', () => { <button class="quantity-btn plus" aria-label="Aumentar cantidad">

        this.addToCart(); <i class="fas fa-plus"></i>

      }); </button>

 </div>

      // Wishlist </div>

      document.getElementById('qv-btn-wishlist').addEventListener('click', () => {

        this.toggleWishlist(); <div class="action-buttons">

      }); <button class="btn-add-to-cart" id="quick-view-add-cart">

 <i class="fas fa-shopping-cart"></i>

      // Ver detalles completos <span>Agregar al Carrito</span>

      document.getElementById('qv-btn-details').addEventListener('click', () => { </button>

        this.goToDetails();

      }); <button class="btn-wishlist" id="quick-view-wishlist" title="Agregar a favoritos">

    } <i class="far fa-heart"></i>

 </button>

    async loadProducts() { </div>

      try { </div>

        const response = await fetch('/public/assets/mock/products.json'); </div>

        this.products = await response.json();

      } catch (error) {  </div>

        console.error('Error cargando productos:', error); </div>

        this.products = [];

      } <button type="button" class="quick-view-full-details" id="quick-view-full-link">

    } <i class="fas fa-eye"></i>

 Ver detalles completos

    open(productId) { <i class="fas fa-arrow-right"></i>

      const product = this.products.find(p => p.id === productId); </button>

       </div>

      if (!product) { </div>

        console.error('Producto no encontrado:', productId); </div>

        return; </div>

      } `;



      this.currentProduct = product;      // Insertar en el body

      this.currentQuantity = 1;      document.body.insertAdjacentHTML('beforeend', modalHTML);

            this.modal = document.getElementById(this.config.modalId);

      // Renderizar producto

      this.renderProduct(product);      // Attach event listeners del modal

            this.attachModalListeners();

      // Mostrar modal    }

      this.modal.style.display = 'flex';

      document.body.style.overflow = 'hidden';    attachGlobalListeners() {

            // Interceptar clicks en botones "Ver detalles" o "Quick View"

      // Animar entrada      document.addEventListener('click', (e) => {

      setTimeout(() => {        const viewBtn = e.target.closest('[data-quick-view]');

        this.modal.classList.add('active');        if (viewBtn) {

      }, 10);          e.preventDefault();

    }          const productId = parseInt(viewBtn.dataset.quickView);

          this.open(productId);

    close() {        }

      this.modal.classList.remove('active');      });

          }

      setTimeout(() => {

        this.modal.style.display = 'none';    attachModalListeners() {

        document.body.style.overflow = '';      // Cerrar modal

      }, 300);      const closeBtn = this.modal.querySelector('.quick-view-close');

    }      closeBtn.addEventListener('click', () => this.close());



    isOpen() {      // Cerrar con overlay

      return this.modal.style.display === 'flex';      if (this.config.closeOnOutsideClick) {

    }        const overlay = this.modal.querySelector('.quick-view-overlay');

        overlay.addEventListener('click', () => this.close());

    renderProduct(product) {      }

      // Título y categoría

      document.getElementById('qv-title').textContent = product.name;      // Cerrar con Esc

      document.getElementById('qv-category').textContent = product.category;      if (this.config.closeOnEscape) {

        document.addEventListener('keydown', (e) => {

      // Precio          if (e.key === 'Escape' && this.isOpen()) {

      document.getElementById('qv-price').textContent =             this.close();

        `$${product.price.toLocaleString('es-CO')}`;          }

        });

      // Rating      }

      const rating = product.rating || 5;

      document.getElementById('qv-stars').innerHTML =       // Navegación de imágenes

        '★'.repeat(rating) + '☆'.repeat(5 - rating);      const prevBtn = this.modal.querySelector('.image-nav-btn.prev');

      document.getElementById('qv-reviews').textContent =       const nextBtn = this.modal.querySelector('.image-nav-btn.next');

        `(${product.reviews || 0} reseñas)`;

      prevBtn.addEventListener('click', () => this.previousImage());

      // Descripción (máximo 150 caracteres)      nextBtn.addEventListener('click', () => this.nextImage());

      const desc = product.description || '';

      document.getElementById('qv-description').textContent =       // Selector de cantidad

        desc.length > 150 ? desc.substring(0, 150) + '...' : desc;      const minusBtn = this.modal.querySelector('.quantity-btn.minus');

      const plusBtn = this.modal.querySelector('.quantity-btn.plus');

      // Imagen principal      const quantityInput = this.modal.querySelector('#quick-view-quantity');

      const mainImg = document.getElementById('qv-main-img');

      mainImg.src = product.image_url;      minusBtn.addEventListener('click', () => this.decreaseQuantity());

      mainImg.alt = product.name;      plusBtn.addEventListener('click', () => this.increaseQuantity());

      quantityInput.addEventListener('change', (e) => this.setQuantity(e.target.value));

      // Thumbnails (simulamos 4 imágenes)

      const thumbnailsContainer = document.getElementById('qv-thumbnails');      // Agregar al carrito

      thumbnailsContainer.innerHTML = '';      const addCartBtn = this.modal.querySelector('#quick-view-add-cart');

            addCartBtn.addEventListener('click', () => this.addToCart());

      for (let i = 0; i < 4; i++) {

        const thumb = document.createElement('div');      // Wishlist

        thumb.className = 'qv-thumbnail' + (i === 0 ? ' active' : '');      const wishlistBtn = this.modal.querySelector('#quick-view-wishlist');

        thumb.innerHTML = `<img src="${product.image_url}" alt="${product.name}">`;      wishlistBtn.addEventListener('click', () => this.toggleWishlist());

        thumb.addEventListener('click', () => {

          document.querySelectorAll('.qv-thumbnail').forEach(t =>       // Ver detalles completos button

            t.classList.remove('active')      const fullDetailsBtn = this.modal.querySelector('#quick-view-full-link');

          );      if (fullDetailsBtn) {

          thumb.classList.add('active');        fullDetailsBtn.addEventListener('click', (e) => {

        });          e.preventDefault();

        thumbnailsContainer.appendChild(thumb);          console.log('🔍 Click en Ver detalles completos');

      }          this.goToProductDetail(e);

        });

      // Reset cantidad        console.log('✅ Event listener agregado al botón de detalles');

      document.getElementById('qv-qty-input').value = 1;      } else {

      this.currentQuantity = 1;        console.error('❌ No se encontró el botón #quick-view-full-link');

      }

      // Actualizar estado wishlist

      this.updateWishlistButton();      // Keyboard navigation

    }      if (this.config.enableKeyboardNav) {

        this.modal.addEventListener('keydown', (e) => this.handleKeyboard(e));

    decreaseQuantity() {      }

      if (this.currentQuantity > 1) {    }

        this.currentQuantity--;

        document.getElementById('qv-qty-input').value = this.currentQuantity;    open(productId) {

      }      // Obtener datos del producto

    }      const product = this.getProduct(productId);



    increaseQuantity() {      if (!product) {

      if (this.currentQuantity < 99) {        console.error('❌ Producto no encontrado:', productId);

        this.currentQuantity++;        return;

        document.getElementById('qv-qty-input').value = this.currentQuantity;      }

      }

    }      this.currentProduct = product;

      this.currentImageIndex = 0;

    setQuantity(value) {      this.quantity = 1;

      if (value >= 1 && value <= 99) {

        this.currentQuantity = value;      // Renderizar contenido

      } else {      this.renderProduct(product);

        document.getElementById('qv-qty-input').value = this.currentQuantity;

      }      // Mostrar modal

    }      this.modal.style.display = 'flex';

      document.body.classList.add('modal-open');

    addToCart() {

      if (!this.currentProduct) return;      // Animación de entrada

      setTimeout(() => {

      if (window.cartManager) {        this.modal.classList.add('is-open');

        window.cartManager.addItem({      }, 10);

          ...this.currentProduct,

          quantity: this.currentQuantity      // Focus trap

        });      this.setupFocusTrap();

        

        this.showToast('Producto agregado al carrito', 'success');      // Analytics

        this.close();      if (this.config.enableAnalytics && window.FloresVictoriaAnalytics) {

      } else {        window.FloresVictoriaAnalytics.trackQuickView(productId, product.name);

        console.error('CartManager no disponible');      }

        this.showToast('Error al agregar al carrito', 'error');    }

      }

    }    close() {

      // Animación de salida

    toggleWishlist() {      this.modal.classList.remove('is-open');

      if (!this.currentProduct) return;

      setTimeout(() => {

      if (window.wishlistManager) {        this.modal.style.display = 'none';

        window.wishlistManager.toggleItem(this.currentProduct.id);        document.body.classList.remove('modal-open');

        this.updateWishlistButton();        this.currentProduct = null;

                this.currentImageIndex = 0;

        const isInWishlist = window.wishlistManager.isInWishlist(        this.quantity = 1;

          this.currentProduct.id      }, this.config.animationDuration);

        );

        this.showToast(      // Remover focus trap

          isInWishlist ? 'Agregado a favoritos' : 'Eliminado de favoritos',      this.removeFocusTrap();

          'success'    }

        );

      }    isOpen() {

    }      return this.modal.style.display !== 'none';

    }

    updateWishlistButton() {

      if (!this.currentProduct || !window.wishlistManager) return;    renderProduct(product) {

      // Título y categoría

      const btn = document.getElementById('qv-btn-wishlist');      document.getElementById('quick-view-title').textContent = product.name;

      const icon = btn.querySelector('i');      document.getElementById('quick-view-category').textContent = product.category;

      

      const isInWishlist = window.wishlistManager.isInWishlist(      // Precio

        this.currentProduct.id      const priceEl = document.getElementById('quick-view-price');

      );      priceEl.textContent = `$${product.price.toLocaleString('es-MX')}`;

      

      if (isInWishlist) {      // Rating

        icon.classList.remove('far');      const starsEl = document.getElementById('quick-view-stars');

        icon.classList.add('fas');      const rating = product.rating || 5;

        btn.classList.add('active');      starsEl.innerHTML =

      } else {        '<i class="fas fa-star"></i>'.repeat(rating) +

        icon.classList.remove('fas');        '<i class="far fa-star"></i>'.repeat(5 - rating);

        icon.classList.add('far');

        btn.classList.remove('active');      document.getElementById('quick-view-reviews').textContent =

      }        `(${product.reviews || 0} reseñas)`;

    }

      // Descripción (simplificada - máximo 150 caracteres)

    goToDetails() {      const description = product.description || 'Sin descripción disponible';

      if (!this.currentProduct) return;      const shortDescription =

        description.length > 150

      // Mostrar feedback          ? `${description.substring(0, 150)}...`

      const btn = document.getElementById('qv-btn-details');          : description;

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';      document.getElementById('quick-view-description').textContent = shortDescription;

      btn.disabled = true;

      // Badge

      // Cerrar modal      const badgeEl = this.modal.querySelector('.quick-view-badge');

      this.close();      badgeEl.textContent = product.badge || 'Nuevo';



      // Redirigir      // Stock

      setTimeout(() => {      const stockEl = document.getElementById('quick-view-stock');

        window.location.href = `/pages/product-detail.html?id=${this.currentProduct.id}`;      if (product.stock === false || product.stock === 0) {

      }, 300);        stockEl.innerHTML = '<i class="fas fa-times-circle"></i> Agotado';

    }        stockEl.classList.add('out-of-stock');

      } else {

    showToast(message, type = 'info') {        stockEl.innerHTML = '<i class="fas fa-check-circle"></i> En stock';

      if (window.Toast) {        stockEl.classList.remove('out-of-stock');

        window.Toast.show(message, type);      }

      } else if (window.showToast) {

        window.showToast(message, type);      // Imágenes

      } else {      this.renderImages(product);

        console.log(`[${type}] ${message}`);

      }      // Wishlist state

    }      this.updateWishlistButton(product.id);

  }    }



  // Inicializar cuando el DOM esté listo    renderFeatures(features) {

  if (document.readyState === 'loading') {      const container = document.getElementById('quick-view-features');

    document.addEventListener('DOMContentLoaded', () => {

      window.quickViewModal = new QuickViewModal();      if (!features || features.length === 0) {

    });        container.style.display = 'none';

  } else {        return;

    window.quickViewModal = new QuickViewModal();      }

  }

      container.style.display = 'block';

})();      container.innerHTML = '<h3>Características</h3><ul class="features-list"></ul>';


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
