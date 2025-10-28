// ❤️ Wishlist/Favorites System

class WishlistManager {
  constructor() {
    this.STORAGE_KEY = 'wishlist';
    this.API_BASE = '/api/wishlist';
    this.items = [];
    this.isAuthenticated = false;
    this.userId = null;
    
    this.init();
  }

  // Inicializar
  async init() {
    this.loadFromStorage();
    await this.checkAuth();
    
    if (this.isAuthenticated) {
      await this.syncWithServer();
    }

    this.attachEventListeners();
  }

  // Verificar autenticación
  async checkAuth() {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        this.isAuthenticated = true;
        this.userId = data.user?.id;
      }
    } catch (error) {
      this.isAuthenticated = false;
    }
  }

  // Cargar desde localStorage
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      this.items = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading wishlist:', error);
      this.items = [];
    }
  }

  // Guardar en localStorage
  saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }

  // Sincronizar con servidor
  async syncWithServer() {
    if (!this.isAuthenticated) return;

    try {
      // Obtener wishlist del servidor
      const response = await fetch(this.API_BASE);
      if (response.ok) {
        const serverItems = await response.json();
        
        // Merge with local items
        const localIds = this.items.map(item => item.productId);
        const serverIds = serverItems.map(item => item.productId);
        
        // Add local items that aren't on server
        for (const item of this.items) {
          if (!serverIds.includes(item.productId)) {
            await this.addToServer(item.productId);
          }
        }
        
        // Update local with server data
        this.items = serverItems;
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Error syncing wishlist:', error);
    }
  }

  // Agregar a wishlist
  async add(productId, product = null) {
    // Verificar si ya existe
    if (this.has(productId)) {
      this.showNotification('Este producto ya está en tu lista de favoritos', 'info');
      return false;
    }

    const item = {
      productId,
      addedAt: new Date().toISOString(),
      product: product || await this.fetchProduct(productId)
    };

    this.items.push(item);
    this.saveToStorage();
    this.updateUI();

    // Sincronizar con servidor si está autenticado
    if (this.isAuthenticated) {
      await this.addToServer(productId);
    }

    this.showNotification('Producto agregado a favoritos', 'success');
    this.dispatchEvent('wishlist:add', item);
    
    return true;
  }

  // Remover de wishlist
  async remove(productId) {
    const index = this.items.findIndex(item => item.productId === productId);
    
    if (index === -1) return false;

    const removedItem = this.items.splice(index, 1)[0];
    this.saveToStorage();
    this.updateUI();

    // Sincronizar con servidor
    if (this.isAuthenticated) {
      await this.removeFromServer(productId);
    }

    this.showNotification('Producto removido de favoritos', 'info');
    this.dispatchEvent('wishlist:remove', removedItem);
    
    return true;
  }

  // Toggle favorito
  async toggle(productId, product = null) {
    if (this.has(productId)) {
      return await this.remove(productId);
    } else {
      return await this.add(productId, product);
    }
  }

  // Verificar si está en favoritos
  has(productId) {
    return this.items.some(item => item.productId === productId);
  }

  // Obtener todos los favoritos
  getAll() {
    return [...this.items];
  }

  // Obtener cantidad de favoritos
  getCount() {
    return this.items.length;
  }

  // Limpiar wishlist
  async clear() {
    if (!confirm('¿Estás seguro de eliminar todos los favoritos?')) {
      return false;
    }

    this.items = [];
    this.saveToStorage();
    this.updateUI();

    if (this.isAuthenticated) {
      await this.clearOnServer();
    }

    this.showNotification('Lista de favoritos vaciada', 'info');
    this.dispatchEvent('wishlist:clear');
    
    return true;
  }

  // API calls
  async fetchProduct(productId) {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
    return null;
  }

  async addToServer(productId) {
    try {
      await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
    } catch (error) {
      console.error('Error adding to server:', error);
    }
  }

  async removeFromServer(productId) {
    try {
      await fetch(`${this.API_BASE}/${productId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error removing from server:', error);
    }
  }

  async clearOnServer() {
    try {
      await fetch(this.API_BASE, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error clearing server:', error);
    }
  }

  // UI Updates
  updateUI() {
    this.updateButtons();
    this.updateCounter();
    this.updatePage();
  }

  updateButtons() {
    document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
      const productId = btn.dataset.productId;
      const isInWishlist = this.has(productId);
      
      btn.classList.toggle('active', isInWishlist);
      btn.innerHTML = isInWishlist ? '❤️' : '🤍';
      btn.setAttribute('aria-label', isInWishlist ? 'Remover de favoritos' : 'Agregar a favoritos');
    });
  }

  updateCounter() {
    const counters = document.querySelectorAll('[data-wishlist-count]');
    const count = this.getCount();
    
    counters.forEach(counter => {
      counter.textContent = count;
      counter.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  updatePage() {
    // Si estamos en la página de favoritos, actualizar lista
    const wishlistPage = document.querySelector('.wishlist-page');
    if (wishlistPage) {
      this.renderWishlistPage();
    }
  }

  // Renderizar página de favoritos
  renderWishlistPage() {
    const container = document.getElementById('wishlist-items');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-wishlist">
          <div class="empty-icon">❤️</div>
          <h3>Tu lista de favoritos está vacía</h3>
          <p>Agrega productos que te gusten para guardarlos aquí</p>
          <a href="/products" class="btn btn-primary">Explorar Productos</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="wishlist-grid">
        ${this.items.map(item => this.renderWishlistItem(item)).join('')}
      </div>
    `;
  }

  renderWishlistItem(item) {
    const product = item.product;
    if (!product) return '';

    return `
      <div class="wishlist-item" data-product-id="${item.productId}">
        <button class="remove-btn" onclick="wishlist.remove('${item.productId}')">
          ✕
        </button>
        <a href="/product/${item.productId}" class="product-link">
          <img 
            src="${product.image || '/images/placeholder.jpg'}" 
            alt="${product.name}"
            class="product-image"
          />
          <div class="product-info">
            <h4 class="product-name">${product.name}</h4>
            <p class="product-price">$${product.price?.toLocaleString('es-CL') || '0'}</p>
            ${product.inStock ? 
              '<span class="stock-badge in-stock">En Stock</span>' : 
              '<span class="stock-badge out-of-stock">Agotado</span>'
            }
          </div>
        </a>
        <button class="add-to-cart-btn" onclick="cart.add('${item.productId}')">
          🛒 Agregar al Carrito
        </button>
      </div>
    `;
  }

  // Event Listeners
  attachEventListeners() {
    // Botones de toggle en productos
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-wishlist-toggle]');
      if (btn) {
        e.preventDefault();
        const productId = btn.dataset.productId;
        this.toggle(productId);
      }
    });
  }

  // Custom Events
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  // Notificaciones
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `wishlist-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Crear botón de wishlist
  static createButton(productId, initialState = false) {
    const button = document.createElement('button');
    button.className = 'wishlist-btn';
    button.dataset.wishlistToggle = '';
    button.dataset.productId = productId;
    button.innerHTML = initialState ? '❤️' : '🤍';
    button.setAttribute('aria-label', initialState ? 'Remover de favoritos' : 'Agregar a favoritos');
    
    return button;
  }
}

// Estilos
const wishlistStyles = `
.wishlist-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 8px;
  line-height: 1;
}

.wishlist-btn:hover {
  transform: scale(1.2);
}

.wishlist-btn.active {
  animation: heartbeat 0.3s ease-in-out;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.wishlist-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
  transition: transform 0.2s;
}

.wishlist-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  z-index: 10;
}

.remove-btn:hover {
  background: rgba(0,0,0,0.7);
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.product-name {
  font-size: 16px;
  margin: 10px 0 5px;
  color: #333;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  margin: 5px 0;
}

.stock-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stock-badge.in-stock {
  background: #d4edda;
  color: #155724;
}

.stock-badge.out-of-stock {
  background: #f8d7da;
  color: #721c24;
}

.add-to-cart-btn {
  width: 100%;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
  transition: background 0.2s;
}

.add-to-cart-btn:hover {
  background: #5568d3;
}

.empty-wishlist {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-wishlist h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.empty-wishlist p {
  font-size: 16px;
  margin-bottom: 20px;
}

[data-wishlist-count] {
  background: #f44336;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 700;
  margin-left: 5px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
`;

// Inyectar estilos
if (!document.getElementById('wishlist-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'wishlist-styles';
  styleSheet.textContent = wishlistStyles;
  document.head.appendChild(styleSheet);
}

// Crear instancia global
const wishlist = new WishlistManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WishlistManager;
}

window.wishlist = wishlist;
