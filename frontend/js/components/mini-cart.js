/**
 * Mini Cart Component
 * Dropdown cart display in header with real-time updates
 */

class MiniCart {
  constructor(options = {}) {
    this.options = {
      container: '.mini-cart',
      trigger: '.cart-icon',
      cartEndpoint: '/api/cart',
      maxItems: 5,
      autoClose: true,
      autoCloseDelay: 3000,
      ...options
    };

    this.isOpen = false;
    this.cartData = {
      items: [],
      subtotal: 0,
      itemCount: 0
    };

    this.init();
  }

  init() {
    this.createStructure();
    this.attachEventListeners();
    this.loadCartData();
    
    // Listen for cart updates from other components
    document.addEventListener('cart:updated', () => this.loadCartData());
    document.addEventListener('cart:item-added', (e) => this.handleItemAdded(e.detail));
  }

  createStructure() {
    const container = document.querySelector(this.options.container);
    if (!container) {
      console.warn('Mini-cart container not found');
      return;
    }

    container.innerHTML = `
      <div class="mini-cart-trigger">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-badge" data-count="0">0</span>
      </div>
      <div class="mini-cart-dropdown" aria-hidden="true">
        <div class="mini-cart-header">
          <h3>Tu Carrito</h3>
          <button class="mini-cart-close" aria-label="Cerrar carrito">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="mini-cart-body">
          <div class="mini-cart-items"></div>
          <div class="mini-cart-empty" style="display: none;">
            <i class="fas fa-shopping-basket"></i>
            <p>Tu carrito está vacío</p>
            <a href="/pages/products.html" class="btn btn-primary">Ver Productos</a>
          </div>
        </div>
        <div class="mini-cart-footer">
          <div class="mini-cart-subtotal">
            <span>Subtotal:</span>
            <span class="subtotal-amount">$0.00</span>
          </div>
          <div class="mini-cart-actions">
            <a href="/pages/cart.html" class="btn btn-outline">Ver Carrito</a>
            <a href="/pages/checkout.html" class="btn btn-primary">Finalizar Compra</a>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const container = document.querySelector(this.options.container);
    if (!container) return;

    const trigger = container.querySelector('.mini-cart-trigger');
    const dropdown = container.querySelector('.mini-cart-dropdown');
    const closeBtn = container.querySelector('.mini-cart-close');

    // Toggle dropdown
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Close button
    closeBtn?.addEventListener('click', () => this.close());

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !container.contains(e.target)) {
        this.close();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Prevent dropdown from closing when clicking inside
    dropdown?.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  async loadCartData() {
    try {
      // Try to get cart from localStorage first (faster)
      const localCart = this.getLocalCart();
      if (localCart) {
        this.cartData = localCart;
        this.render();
      }

      // Then fetch from server to ensure sync
      const response = await fetch(this.options.cartEndpoint);
      if (response.ok) {
        const data = await response.json();
        this.cartData = this.parseCartData(data);
        this.saveLocalCart();
        this.render();
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to localStorage
      const localCart = this.getLocalCart();
      if (localCart) {
        this.cartData = localCart;
        this.render();
      }
    }
  }

  parseCartData(data) {
    return {
      items: data.items || data.products || [],
      subtotal: data.subtotal || data.total || 0,
      itemCount: data.itemCount || data.items?.length || 0
    };
  }

  getLocalCart() {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : null;
    } catch (error) {
      console.error('Error reading local cart:', error);
      return null;
    }
  }

  saveLocalCart() {
    try {
      localStorage.setItem('cart', JSON.stringify(this.cartData));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  }

  render() {
    this.updateBadge();
    this.updateItems();
    this.updateSubtotal();
    this.updateEmptyState();
  }

  updateBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      const count = this.cartData.itemCount;
      badge.textContent = count;
      badge.setAttribute('data-count', count);
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  updateItems() {
    const itemsContainer = document.querySelector('.mini-cart-items');
    if (!itemsContainer) return;

    const items = this.cartData.items.slice(0, this.options.maxItems);
    
    if (items.length === 0) {
      itemsContainer.innerHTML = '';
      return;
    }

    itemsContainer.innerHTML = items.map(item => this.renderItem(item)).join('');

    // Attach remove handlers
    itemsContainer.querySelectorAll('.mini-cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.dataset.itemId;
        this.removeItem(itemId);
      });
    });

    // Show "view all" link if more items exist
    if (this.cartData.items.length > this.options.maxItems) {
      itemsContainer.insertAdjacentHTML('beforeend', `
        <div class="mini-cart-view-all">
          <a href="/pages/cart.html">
            Ver todos los productos (${this.cartData.items.length})
          </a>
        </div>
      `);
    }
  }

  renderItem(item) {
    const price = parseFloat(item.price || 0);
    const quantity = parseInt(item.quantity || 1);
    const total = price * quantity;

    return `
      <div class="mini-cart-item" data-item-id="${item.id}">
        <div class="mini-cart-item-image">
          <img src="${item.image || '/images/placeholder.jpg'}" 
               alt="${item.name}"
               loading="lazy">
        </div>
        <div class="mini-cart-item-details">
          <h4 class="mini-cart-item-name">${item.name}</h4>
          <div class="mini-cart-item-meta">
            <span class="quantity">${quantity}x</span>
            <span class="price">$${price.toFixed(2)}</span>
          </div>
        </div>
        <div class="mini-cart-item-actions">
          <span class="mini-cart-item-total">$${total.toFixed(2)}</span>
          <button class="mini-cart-item-remove" 
                  data-item-id="${item.id}"
                  aria-label="Eliminar ${item.name}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  updateSubtotal() {
    const subtotalElement = document.querySelector('.subtotal-amount');
    if (subtotalElement) {
      subtotalElement.textContent = `$${this.cartData.subtotal.toFixed(2)}`;
    }
  }

  updateEmptyState() {
    const itemsContainer = document.querySelector('.mini-cart-items');
    const emptyState = document.querySelector('.mini-cart-empty');
    const footer = document.querySelector('.mini-cart-footer');

    if (this.cartData.items.length === 0) {
      if (itemsContainer) itemsContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      if (footer) footer.style.display = 'none';
    } else {
      if (itemsContainer) itemsContainer.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';
      if (footer) footer.style.display = 'block';
    }
  }

  async removeItem(itemId) {
    try {
      const response = await fetch(`${this.options.cartEndpoint}/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.cartData.items = this.cartData.items.filter(item => item.id !== itemId);
        this.recalculateCart();
        this.saveLocalCart();
        this.render();
        
        // Emit event for other components
        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: this.cartData
        }));

        this.showNotification('Producto eliminado del carrito');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      this.showNotification('Error al eliminar el producto', 'error');
    }
  }

  recalculateCart() {
    this.cartData.itemCount = this.cartData.items.length;
    this.cartData.subtotal = this.cartData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * parseInt(item.quantity));
    }, 0);
  }

  handleItemAdded(item) {
    this.showNotification('Producto agregado al carrito', 'success');
    
    if (this.options.autoClose) {
      this.open();
      setTimeout(() => this.close(), this.options.autoCloseDelay);
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    const dropdown = document.querySelector('.mini-cart-dropdown');
    if (!dropdown) return;

    dropdown.classList.add('is-open');
    dropdown.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    // Load fresh data when opening
    this.loadCartData();
  }

  close() {
    const dropdown = document.querySelector('.mini-cart-dropdown');
    if (!dropdown) return;

    dropdown.classList.remove('is-open');
    dropdown.setAttribute('aria-hidden', 'true');
    this.isOpen = false;
  }

  showNotification(message, type = 'info') {
    // Use toast system if available
    if (window.ToastNotification) {
      const toast = new window.ToastNotification();
      toast[type](message);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.mini-cart')) {
    window.miniCart = new MiniCart();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiniCart;
}
