/**
 * ============================================================================
 * Cart Manager Component
 * ============================================================================
 *
 * Sistema unificado de gestión del carrito de compras con persistencia
 * en localStorage y eventos personalizados.
 *
 * @module CartManager
 * @version 2.0.0
 * @requires ToastComponent (opcional) - para notificaciones
 * @requires FloresVictoriaUtils (opcional) - para formateo de precios
 *
 * Uso básico:
 * CartManager.addItem({ id: '1', name: 'Rosa', price: 5000, image: '/img/rosa.jpg' });
 * CartManager.removeItem('1');
 * CartManager.updateQuantity('1', 3);
 * const total = CartManager.getTotal();
 *
 * Eventos:
 * window.addEventListener('cartUpdated', (e) => {
 * });
 *
 * Características:
 * - Persistencia automática en localStorage
 * - Eventos personalizados para reactividad
 * - Actualización automática de UI
 * - Validación de datos
 * - Integración con ToastComponent para notificaciones
 */

/* global ToastComponent, FloresVictoriaUtils */

const CartManager = {
  // ========================================
  // Configuración
  // ========================================

  STORAGE_KEY: 'flores_victoria_cart',
  MAX_QUANTITY: 99,
  MIN_QUANTITY: 1,

  // ========================================
  // Estado interno
  // ========================================

  items: [],

  // ========================================
  // Lifecycle methods
  // ========================================

  /**
   * Inicializa el cart manager
   */
  init() {
    this.loadCart();
    this.updateCartUI();
    this.attachEventListeners();
  },

  /**
   * Adjunta event listeners globales
   */
  attachEventListeners() {
    // Listener para sincronizar entre pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.loadCart();
        this.updateCartUI();
      }
    });
  },

  // ========================================
  // Persistencia de datos
  // ========================================

  /**
   * Carga el carrito desde localStorage
   */
  loadCart() {
    try {
      const cartData = localStorage.getItem(this.STORAGE_KEY);
      this.items = cartData ? JSON.parse(cartData) : [];

      // Validar integridad de datos
      this.items = this.items.filter(this.validateItem.bind(this));
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      this.items = [];
      this.showError('Error al cargar el carrito');
    }
  },

  /**
   * Guarda el carrito en localStorage
   */
  saveCart() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      this.updateCartUI();
      this.dispatchCartEvent();
    } catch (error) {
      console.error('❌ Error saving cart:', error);

      if (error.name === 'QuotaExceededError') {
        this.showError('Carrito lleno. Por favor, finaliza tu compra.');
      } else {
        this.showError('Error al guardar el carrito');
      }
    }
  },

  // ========================================
  // Validación
  // ========================================

  /**
   * Valida un item del carrito
   * @param {Object} item - Item a validar
   * @returns {boolean} true si el item es válido
   */
  validateItem(item) {
    return (
      item &&
      typeof item.id !== 'undefined' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      item.price > 0 &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );
  },

  /**
   * Valida un producto antes de agregarlo
   * @param {Object} product - Producto a validar
   * @returns {boolean} true si el producto es válido
   */
  validateProduct(product) {
    if (!product || typeof product !== 'object') {
      this.showError('Producto inválido');
      return false;
    }

    if (!product.id || !product.name || !product.price) {
      this.showError('Faltan datos del producto');
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
   * Agrega un producto al carrito
   * @param {Object} product - Producto a agregar
   * @param {string|number} product.id - ID único del producto
   * @param {string} product.name - Nombre del producto
   * @param {number} product.price - Precio del producto
   * @param {string} product.image - URL de la imagen
   * @param {number} [product.quantity=1] - Cantidad inicial
   * @returns {boolean} true si se agregó correctamente
   */
  addItem(product) {
    if (!this.validateProduct(product)) {
      return false;
    }

    const existingItem = this.items.find((item) => item.id === product.id);
    const quantityToAdd = product.quantity || 1;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityToAdd;

      if (newQuantity > this.MAX_QUANTITY) {
        this.showError(`Cantidad máxima: ${this.MAX_QUANTITY}`);
        return false;
      }

      existingItem.quantity = newQuantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '/img/placeholder.jpg',
        quantity: Math.min(quantityToAdd, this.MAX_QUANTITY),
      });
    }

    this.saveCart();
    this.showSuccess(`${product.name} agregado al carrito`);

    return true;
  },

  /**
   * Elimina un producto del carrito
   * @param {string|number} productId - ID del producto a eliminar
   * @returns {boolean} true si se eliminó correctamente
   */
  removeItem(productId) {
    const itemIndex = this.items.findIndex((item) => item.id === productId);

    if (itemIndex === -1) {
      this.showError('Producto no encontrado en el carrito');
      return false;
    }

    const removedItem = this.items[itemIndex];
    this.items.splice(itemIndex, 1);
    this.saveCart();

    this.showInfo(`${removedItem.name} eliminado del carrito`);
    return true;
  },

  /**
   * Actualiza la cantidad de un producto
   * @param {string|number} productId - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {boolean} true si se actualizó correctamente
   */
  updateQuantity(productId, quantity) {
    const item = this.items.find((i) => i.id === productId);

    if (!item) {
      this.showError('Producto no encontrado');
      return false;
    }

    // Eliminar si la cantidad es 0 o negativa
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    // Validar cantidad máxima
    if (quantity > this.MAX_QUANTITY) {
      this.showError(`Cantidad máxima: ${this.MAX_QUANTITY}`);
      item.quantity = this.MAX_QUANTITY;
      this.saveCart();
      return false;
    }

    item.quantity = Math.max(this.MIN_QUANTITY, Math.floor(quantity));
    this.saveCart();
    return true;
  },

  // ========================================
  // Consultas y getters
  // ========================================

  /**
   * Obtiene una copia de todos los items
   * @returns {Array} Array de items del carrito
   */
  getItems() {
    return [...this.items];
  },

  /**
   * Obtiene el conteo total de items (considerando cantidades)
   * @returns {number} Número total de items
   */
  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },

  /**
   * Calcula el total del carrito
   * @returns {number} Total en pesos chilenos
   */
  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  /**
   * Verifica si un producto está en el carrito
   * @param {string|number} productId - ID del producto
   * @returns {boolean} true si el producto está en el carrito
   */
  hasItem(productId) {
    return this.items.some((item) => item.id === productId);
  },

  /**
   * Obtiene un item específico del carrito
   * @param {string|number} productId - ID del producto
   * @returns {Object|undefined} Item del carrito o undefined
   */
  getItem(productId) {
    return this.items.find((item) => item.id === productId);
  },

  /**
   * Obtiene el número de productos únicos (sin considerar cantidades)
   * @returns {number} Número de productos únicos
   */
  getUniqueItemCount() {
    return this.items.length;
  },

  /**
   * Verifica si el carrito está vacío
   * @returns {boolean} true si el carrito está vacío
   */
  isEmpty() {
    return this.items.length === 0;
  },

  // ========================================
  // Operaciones en lote
  // ========================================

  /**
   * Vacía completamente el carrito
   */
  clearCart() {
    if (this.isEmpty()) {
      this.showInfo('El carrito ya está vacío');
      return;
    }

    this.items = [];
    this.saveCart();
    this.showInfo('Carrito vaciado');
  },

  // ========================================
  // Actualización de UI
  // ========================================

  /**
   * Actualiza todos los elementos de UI relacionados con el carrito
   */
  updateCartUI() {
    const count = this.getItemCount();
    const total = this.getTotal();

    // Actualizar contadores
    document.querySelectorAll('.cart-count, .cart-counter').forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
      el.classList.toggle('has-items', count > 0);
    });

    // Actualizar totales
    document.querySelectorAll('.cart-total').forEach((el) => {
      el.textContent = this.formatPrice(total);
    });

    // Mostrar/ocultar mensajes de carrito vacío
    document.querySelectorAll('.cart-empty-message').forEach((el) => {
      el.style.display = count === 0 ? 'block' : 'none';
    });

    // Mostrar/ocultar contenedor de items
    document.querySelectorAll('.cart-items-container').forEach((el) => {
      el.style.display = count > 0 ? 'block' : 'none';
    });
  },

  /**
   * Dispara un evento personalizado cuando el carrito se actualiza
   */
  dispatchCartEvent() {
    const event = new CustomEvent('cartUpdated', {
      detail: {
        items: this.getItems(),
        count: this.getItemCount(),
        uniqueCount: this.getUniqueItemCount(),
        total: this.getTotal(),
        isEmpty: this.isEmpty(),
      },
      bubbles: true,
    });

    window.dispatchEvent(event);
  },

  /**
   * Renderiza los items del carrito en un contenedor
   * @param {string} containerId - ID del contenedor
   */
  renderCartItems(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
      console.warn(`⚠️ Cart container #${containerId} not found`);
      return;
    }

    if (this.isEmpty()) {
      container.innerHTML = `
 <div class="cart-empty">
 <div class="empty-cart-icon">🛒</div>
 <p class="empty-cart-message">Tu carrito está vacío</p>
 <a href="/pages/products.html" class="btn btn-primary">Ver productos</a>
 </div>
 `;
      return;
    }

    const itemsHTML = this.items
      .map(
        (item) => `
 <div class="cart-item" data-id="${item.id}">
 <img src="${item.image}" 
 alt="${item.name}" 
 class="cart-item-image"
 loading="lazy">
 <div class="cart-item-details">
 <h3 class="cart-item-name">${item.name}</h3>
 <p class="cart-item-price">${this.formatPrice(item.price)}</p>
 </div>
 <div class="cart-item-quantity">
 <button class="qty-btn qty-decrease" 
 onclick="CartManager.updateQuantity('${item.id}', ${item.quantity - 1})"
 aria-label="Disminuir cantidad">
 <i class="fas fa-minus"></i>
 </button>
 <input type="number" 
 value="${item.quantity}" 
 min="${this.MIN_QUANTITY}" 
 max="${this.MAX_QUANTITY}"
 class="qty-input"
 aria-label="Cantidad"
 onchange="CartManager.updateQuantity('${item.id}', parseInt(this.value))">
 <button class="qty-btn qty-increase" 
 onclick="CartManager.updateQuantity('${item.id}', ${item.quantity + 1})"
 aria-label="Aumentar cantidad">
 <i class="fas fa-plus"></i>
 </button>
 </div>
 <div class="cart-item-total">
 <span class="item-total-label">Subtotal:</span>
 <span class="item-total-amount">${this.formatPrice(item.price * item.quantity)}</span>
 </div>
 <button class="cart-item-remove" 
 onclick="CartManager.removeItem('${item.id}')"
 aria-label="Eliminar ${item.name}">
 <i class="fas fa-trash" aria-hidden="true"></i>
 </button>
 </div>
 `
      )
      .join('');

    container.innerHTML = itemsHTML;
  },

  // ========================================
  // Utilidades
  // ========================================

  /**
   * Formatea un precio en formato chileno
   * @param {number} price - Precio a formatear
   * @returns {string} Precio formateado
   */
  formatPrice(price) {
    if (typeof FloresVictoriaUtils !== 'undefined' && FloresVictoriaUtils.formatPrice) {
      return FloresVictoriaUtils.formatPrice(price);
    }
    return `$${price.toLocaleString('es-CL')}`;
  },

  /**
   * Muestra un mensaje de éxito
   * @param {string} message - Mensaje a mostrar
   */
  showSuccess(message) {
    if (typeof ToastComponent !== 'undefined' && ToastComponent.success) {
      ToastComponent.success(message);
    }
  },

  /**
   * Muestra un mensaje de información
   * @param {string} message - Mensaje a mostrar
   */
  showInfo(message) {
    if (typeof ToastComponent !== 'undefined' && ToastComponent.info) {
      ToastComponent.info(message);
    }
  },

  /**
   * Muestra un mensaje de error
   * @param {string} message - Mensaje a mostrar
   */
  showError(message) {
    if (typeof ToastComponent !== 'undefined' && ToastComponent.error) {
      ToastComponent.error(message);
    } else {
      console.error('❌', message);
    }
  },
};

// ========================================
// Auto-inicialización
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CartManager.init());
} else {
  CartManager.init();
}

// ========================================
// Export para uso en módulos
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartManager;
}

if (typeof window !== 'undefined') {
  window.CartManager = CartManager;
}
