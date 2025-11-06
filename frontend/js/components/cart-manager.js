/**
 * Cart Manager Component
 * Sistema unificado de gestión del carrito de compras
 *
 * Uso:
 * CartManager.addItem(product);
 * CartManager.removeItem(productId);
 * CartManager.getTotal();
 */

/* global ToastComponent, FloresVictoriaUtils */

const CartManager = {
  STORAGE_KEY: 'flores_victoria_cart',

  init() {
    this.loadCart();
    this.updateCartUI();
  },

  loadCart() {
    try {
      const cartData = localStorage.getItem(this.STORAGE_KEY);
      this.items = cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      this.items = [];
    }
  },

  saveCart() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      this.updateCartUI();
      this.dispatchCartEvent();
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  addItem(product) {
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity || 1,
      });
    }

    this.saveCart();

    if (typeof ToastComponent !== 'undefined') {
      ToastComponent.success(`${product.name} agregado al carrito`);
    }

    return true;
  },

  removeItem(productId) {
    const itemIndex = this.items.findIndex((item) => item.id === productId);

    if (itemIndex > -1) {
      const removedItem = this.items[itemIndex];
      this.items.splice(itemIndex, 1);
      this.saveCart();

      if (typeof ToastComponent !== 'undefined') {
        ToastComponent.info(`${removedItem.name} eliminado del carrito`);
      }

      return true;
    }

    return false;
  },

  updateQuantity(productId, quantity) {
    const item = this.items.find((i) => i.id === productId);

    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }

      item.quantity = quantity;
      this.saveCart();
      return true;
    }

    return false;
  },

  getItems() {
    return [...this.items];
  },

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  clearCart() {
    this.items = [];
    this.saveCart();

    if (typeof ToastComponent !== 'undefined') {
      ToastComponent.info('Carrito vaciado');
    }
  },

  hasItem(productId) {
    return this.items.some((item) => item.id === productId);
  },

  getItem(productId) {
    return this.items.find((item) => item.id === productId);
  },

  updateCartUI() {
    const count = this.getItemCount();

    document.querySelectorAll('.cart-count, .cart-counter').forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });

    document.querySelectorAll('.cart-total').forEach((el) => {
      if (typeof FloresVictoriaUtils !== 'undefined') {
        el.textContent = FloresVictoriaUtils.formatPrice(this.getTotal());
      } else {
        el.textContent = `$${this.getTotal().toLocaleString('es-CL')}`;
      }
    });

    document.querySelectorAll('.cart-empty-message').forEach((el) => {
      el.style.display = count === 0 ? 'block' : 'none';
    });

    document.querySelectorAll('.cart-items-container').forEach((el) => {
      el.style.display = count > 0 ? 'block' : 'none';
    });
  },

  dispatchCartEvent() {
    const event = new CustomEvent('cartUpdated', {
      detail: {
        items: this.getItems(),
        count: this.getItemCount(),
        total: this.getTotal(),
      },
    });
    window.dispatchEvent(event);
  },

  renderCartItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <p>Tu carrito está vacío</p>
          <a href="/pages/products.html" class="btn btn-primary">Ver productos</a>
        </div>
      `;
      return;
    }

    const itemsHTML = this.items
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <p class="cart-item-price">${
            typeof FloresVictoriaUtils !== 'undefined'
              ? FloresVictoriaUtils.formatPrice(item.price)
              : `$${item.price.toLocaleString('es-CL')}`
          }</p>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
          <input type="number" value="${item.quantity}" min="1" 
                 onchange="CartManager.updateQuantity('${item.id}', parseInt(this.value))">
          <button class="qty-btn" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-total">
          ${
            typeof FloresVictoriaUtils !== 'undefined'
              ? FloresVictoriaUtils.formatPrice(item.price * item.quantity)
              : `$${(item.price * item.quantity).toLocaleString('es-CL')}`
          }
        </div>
        <button class="cart-item-remove" onclick="CartManager.removeItem('${item.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `
      )
      .join('');

    container.innerHTML = itemsHTML;
  },

  items: [],
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CartManager.init());
} else {
  CartManager.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartManager;
}
