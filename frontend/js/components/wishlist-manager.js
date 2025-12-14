/**
 * ============================================================================
 * Wishlist Manager Component
 * ============================================================================
 *
 * Sistema unificado de gestión de lista de deseos con persistencia
 * en localStorage y eventos personalizados.
 *
 * @module WishlistManager
 * @version 1.0.0
 * @requires ToastComponent (opcional) - para notificaciones
 *
 * Uso básico:
 * WishlistManager.addItem({ id: '1', name: 'Rosa', price: 5000, image: '/img/rosa.jpg' });
 * WishlistManager.removeItem('1');
 * const items = WishlistManager.getItems();
 *
 * Eventos:
 * window.addEventListener('wishlistUpdated', (e) => {
 *   _logger_wishlist.log('Wishlist actualizada:', e.detail);
 * });
 */

// Logger condicional
const _isDev_wishlist =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.DEBUG === true);
const _logger_wishlist = {
  log: (...args) => _isDev_wishlist && ,
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  debug: (...args) => _isDev_wishlist && ,
};

/* global ToastComponent */

const WishlistManager = {
  // ========================================
  // Configuración
  // ========================================

  STORAGE_KEY: 'flores_victoria_wishlist',

  // ========================================
  // Estado interno
  // ========================================

  items: [],

  // ========================================
  // Lifecycle methods
  // ========================================

  /**
   * Inicializa el wishlist manager
   */
  init() {
    this.loadWishlist();
    this.updateWishlistUI();
    this.attachEventListeners();
  },

  /**
   * Adjunta event listeners globales
   */
  attachEventListeners() {
    // Listener para sincronizar entre pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.loadWishlist();
        this.updateWishlistUI();
      }
    });
  },

  // ========================================
  // Persistencia de datos
  // ========================================

  /**
   * Carga la wishlist desde localStorage
   */
  loadWishlist() {
    try {
      const wishlistData = localStorage.getItem(this.STORAGE_KEY);
      this.items = wishlistData ? JSON.parse(wishlistData) : [];
    } catch (error) {
      _logger_wishlist.error('❌ Error loading wishlist:', error);
      this.items = [];
    }
  },

  /**
   * Guarda la wishlist en localStorage
   */
  saveWishlist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      this.dispatchWishlistEvent();
      this.updateWishlistUI();
    } catch (error) {
      _logger_wishlist.error('❌ Error saving wishlist:', error);
      this.showError('Error al guardar la lista de deseos');
    }
  },

  // ========================================
  // Validación
  // ========================================

  /**
   * Valida que un producto tenga los campos requeridos
   * @param {Object} product - Producto a validar
   * @returns {boolean}
   */
  validateProduct(product) {
    if (!product || typeof product !== 'object') {
      this.showError('Producto inválido');
      return false;
    }

    if (!product.id) {
      this.showError('El producto debe tener un ID');
      return false;
    }

    if (!product.name) {
      this.showError('El producto debe tener un nombre');
      return false;
    }

    if (typeof product.price !== 'number' || product.price <= 0) {
      this.showError('Precio inválido');
      return false;
    }

    return true;
  },

  // ========================================
  // Gestión de items
  // ========================================

  /**
   * Agrega un producto a la wishlist
   * @param {Object} product - Producto a agregar
   * @returns {boolean} true si se agregó correctamente
   */
  addItem(product) {
    if (!this.validateProduct(product)) {
      return false;
    }

    // Verificar si ya existe
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      this.showInfo(`${product.name} ya está en tu lista de deseos`);
      return false;
    }

    this.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/img/placeholder.jpg',
      addedAt: new Date().toISOString(),
    });

    this.saveWishlist();
    this.showSuccess(`${product.name} agregado a tu lista de deseos ❤️`);

    return true;
  },

  /**
   * Elimina un producto de la wishlist
   * @param {string|number} productId - ID del producto a eliminar
   * @returns {boolean} true si se eliminó correctamente
   */
  removeItem(productId) {
    const itemIndex = this.items.findIndex((item) => item.id === productId);

    if (itemIndex === -1) {
      this.showError('Producto no encontrado en la lista de deseos');
      return false;
    }

    const removedItem = this.items[itemIndex];
    this.items.splice(itemIndex, 1);
    this.saveWishlist();

    this.showInfo(`${removedItem.name} eliminado de tu lista de deseos`);
    return true;
  },

  /**
   * Verifica si un producto está en la wishlist
   * @param {string|number} productId - ID del producto
   * @returns {boolean}
   */
  hasItem(productId) {
    return this.items.some((item) => item.id === productId);
  },

  /**
   * Toggle de un producto (agregar/quitar)
   * @param {Object} product - Producto
   * @returns {boolean} true si se agregó, false si se quitó
   */
  toggleItem(product) {
    if (this.hasItem(product.id)) {
      this.removeItem(product.id);
      return false;
    } else {
      this.addItem(product);
      return true;
    }
  },

  /**
   * Limpia toda la wishlist
   */
  clearWishlist() {
    this.items = [];
    this.saveWishlist();
    this.showSuccess('Lista de deseos limpiada');
  },

  // ========================================
  // Getters
  // ========================================

  /**
   * Obtiene todos los items de la wishlist
   * @returns {Array}
   */
  getItems() {
    return [...this.items];
  },

  /**
   * Obtiene el número de items en la wishlist
   * @returns {number}
   */
  getItemCount() {
    return this.items.length;
  },

  // ========================================
  // Actualización de UI
  // ========================================

  /**
   * Actualiza todos los elementos de UI relacionados con la wishlist
   */
  updateWishlistUI() {
    const count = this.getItemCount();

    // Actualizar contadores
    document.querySelectorAll('.wishlist-count, .wishlist-counter').forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
      el.classList.toggle('has-items', count > 0);
    });

    // Actualizar botones de wishlist
    document.querySelectorAll('[data-wishlist-id]').forEach((btn) => {
      const productId = btn.getAttribute('data-wishlist-id');
      const isInWishlist = this.hasItem(productId);
      btn.classList.toggle('active', isInWishlist);
      btn.setAttribute('aria-pressed', isInWishlist);
    });
  },

  /**
   * Dispara un evento personalizado cuando la wishlist se actualiza
   */
  dispatchWishlistEvent() {
    const event = new CustomEvent('wishlistUpdated', {
      detail: {
        items: this.getItems(),
        count: this.getItemCount(),
      },
      bubbles: true,
    });

    window.dispatchEvent(event);
  },

  // ========================================
  // Notificaciones
  // ========================================

  /**
   * Muestra una notificación de éxito
   * @param {string} message
   */
  showSuccess(message) {
    if (typeof ToastComponent !== 'undefined') {
      ToastComponent.show(message, 'success');
    } else {
      _logger_wishlist.log('✅', message);
    }
  },

  /**
   * Muestra una notificación de error
   * @param {string} message
   */
  showError(message) {
    if (typeof ToastComponent !== 'undefined') {
      ToastComponent.show(message, 'error');
    } else {
      _logger_wishlist.error('❌', message);
    }
  },

  /**
   * Muestra una notificación informativa
   * @param {string} message
   */
  showInfo(message) {
    if (typeof ToastComponent !== 'undefined') {
      ToastComponent.show(message, 'info');
    } else {
      _logger_wishlist.log('ℹ️', message);
    }
  },
};

// ========================================
// Auto-inicialización
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => WishlistManager.init());
} else {
  WishlistManager.init();
}

// ========================================
// Export para uso global y en módulos
// ========================================
if (typeof window !== 'undefined') {
  window.WishlistManager = WishlistManager;

  // Funciones globales para compatibilidad
  window.addToWishlist = (product) => WishlistManager.addItem(product);
  window.removeFromWishlist = (productId) => WishlistManager.removeItem(productId);
  window.toggleWishlist = (product) => WishlistManager.toggleItem(product);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WishlistManager;
}
