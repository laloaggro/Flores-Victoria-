// wishlist-page.js - Funcionalidad específica para la página de wishlist

class WishlistPage {
  constructor() {
    this.api = {
      baseURL: 'http://localhost:3000/api',
      endpoints: {
        products: '/products',
        product: (id) => `/products/${id}`,
      },
    };

    this.elements = {
      grid: document.getElementById('wishlistGrid'),
      loadingSpinner: document.getElementById('loadingSpinner'),
      emptyState: document.getElementById('emptyWishlist'),
      totalItems: document.getElementById('totalWishlistItems'),
      totalValue: document.getElementById('wishlistValue'),
      sortSelect: document.getElementById('sortSelect'),
      clearBtn: document.getElementById('clearWishlistBtn'),
    };

    this.currentSort = 'recent';
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadWishlist();
    this.updateWishlistStats();
  }

  bindEvents() {
    // Sort functionality
    if (this.elements.sortSelect) {
      this.elements.sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.sortAndDisplayProducts();
      });
    }

    // Clear wishlist
    if (this.elements.clearBtn) {
      this.elements.clearBtn.addEventListener('click', () => {
        this.clearWishlist();
      });
    }

    // Global remove from wishlist handler
    document.addEventListener('click', (e) => {
      if (e.target.closest('.remove-from-wishlist')) {
        const productId = e.target.closest('.wishlist-card').dataset.productId;
        this.removeFromWishlist(productId);
      }
    });

    // Global add to cart handler
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) {
        const productId = e.target.closest('.wishlist-card').dataset.productId;
        this.addToCart(productId);
      }
    });

    // View product handler
    document.addEventListener('click', (e) => {
      if (e.target.closest('.view-product-btn')) {
        const productId = e.target.closest('.wishlist-card').dataset.productId;
        window.location.href = `/pages/product-detail.html?id=${productId}`;
      }
    });
  }

  getWishlist() {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  }

  saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    this.updateWishlistStats();
    this.updateGlobalWishlistCount();
  }

  async loadWishlist() {
    const wishlistIds = this.getWishlist();

    if (wishlistIds.length === 0) {
      this.showEmptyState();
      return;
    }

    this.showLoading();

    try {
      const products = await this.fetchProducts(wishlistIds);
      this.currentProducts = products;
      this.sortAndDisplayProducts();
    } catch (error) {
      console.error('Error loading wishlist:', error);
      this.showError('Error al cargar tu lista de deseos. Por favor, inténtalo de nuevo.');
    }
  }

  async fetchProducts(productIds) {
    try {
      const productPromises = productIds.map(async (id) => {
        const response = await fetch(`${this.api.baseURL}${this.api.endpoints.product(id)}`);
        if (!response.ok) throw new Error(`Failed to fetch product ${id}`);
        const product = await response.json();
        return { ...product, addedAt: Date.now() }; // Add timestamp for sorting
      });

      const products = await Promise.all(productPromises);
      return products.filter((product) => product && !product.error);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  sortAndDisplayProducts() {
    if (!this.currentProducts || this.currentProducts.length === 0) {
      this.showEmptyState();
      return;
    }

    const sortedProducts = [...this.currentProducts];

    switch (this.currentSort) {
      case 'price-low':
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'recent':
      default:
        sortedProducts.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
        break;
    }

    this.displayProducts(sortedProducts);
  }

  displayProducts(products) {
    this.hideLoading();
    this.hideEmptyState();

    const productCards = products.map((product) => this.createProductCard(product)).join('');
    this.elements.grid.innerHTML = productCards;

    // Add hover animations
    this.addCardAnimations();
  }

  createProductCard(product) {
    const imageUrl =
      product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg';

    const price = product.price || 0;
    const description =
      product.description || 'Hermoso arreglo floral para cualquier ocasión especial.';

    return `
            <div class="wishlist-card" data-product-id="${product._id}">
                <div class="wishlist-card-image">
                    <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                    <button class="remove-from-wishlist" title="Eliminar de favoritos">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="wishlist-card-content">
                    <h3 class="wishlist-card-title">${product.name}</h3>
                    <div class="wishlist-card-price">$${price.toLocaleString('es-CL')}</div>
                    <p class="wishlist-card-description">${description}</p>
                    <div class="wishlist-card-actions">
                        <button class="add-to-cart-btn">
                            <i class="fas fa-shopping-cart"></i>
                            Agregar al Carrito
                        </button>
                        <button class="view-product-btn" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  addCardAnimations() {
    const cards = document.querySelectorAll('.wishlist-card');

    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('fade-in');
    });
  }

  removeFromWishlist(productId) {
    const wishlist = this.getWishlist();
    const updatedWishlist = wishlist.filter((id) => id !== productId);

    this.saveWishlist(updatedWishlist);

    // Remove the card with animation
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
      card.style.transform = 'translateX(-100%)';
      card.style.opacity = '0';

      setTimeout(() => {
        this.loadWishlist(); // Reload to update stats and check for empty state
      }, 300);
    }

    this.showNotification('Producto eliminado de tu lista de deseos', 'info');
  }

  addToCart(productId) {
    // Find the product in current products
    const product = this.currentProducts.find((p) => p._id === productId);

    if (product) {
      // Get current cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      // Check if product already in cart
      const existingItem = cart.find((item) => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          productId,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '/images/placeholder.jpg',
          quantity: 1,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      this.updateGlobalCartCount();
      this.showNotification('Producto agregado al carrito', 'success');
    }
  }

  clearWishlist() {
    if (
      confirm('¿Estás seguro de que quieres eliminar todos los productos de tu lista de deseos?')
    ) {
      localStorage.removeItem('wishlist');
      this.updateWishlistStats();
      this.updateGlobalWishlistCount();
      this.showEmptyState();
      this.showNotification('Lista de deseos limpia', 'info');
    }
  }

  updateWishlistStats() {
    const wishlist = this.getWishlist();

    if (this.elements.totalItems) {
      this.elements.totalItems.textContent = wishlist.length;
    }

    if (this.currentProducts && this.elements.totalValue) {
      const totalValue = this.currentProducts.reduce(
        (sum, product) => sum + (product.price || 0),
        0
      );
      this.elements.totalValue.textContent = `$${totalValue.toLocaleString('es-CL')}`;
    }
  }

  updateGlobalWishlistCount() {
    const wishlist = this.getWishlist();
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
      wishlistCount.textContent = wishlist.length;
    }
  }

  updateGlobalCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
  }

  showLoading() {
    if (this.elements.loadingSpinner) {
      this.elements.loadingSpinner.style.display = 'flex';
    }
    if (this.elements.grid) {
      this.elements.grid.style.display = 'none';
    }
    if (this.elements.emptyState) {
      this.elements.emptyState.style.display = 'none';
    }
  }

  hideLoading() {
    if (this.elements.loadingSpinner) {
      this.elements.loadingSpinner.style.display = 'none';
    }
    if (this.elements.grid) {
      this.elements.grid.style.display = 'grid';
    }
  }

  showEmptyState() {
    this.hideLoading();
    if (this.elements.grid) {
      this.elements.grid.style.display = 'none';
    }
    if (this.elements.emptyState) {
      this.elements.emptyState.style.display = 'block';
    }

    // Update stats for empty state
    if (this.elements.totalItems) {
      this.elements.totalItems.textContent = '0';
    }
    if (this.elements.totalValue) {
      this.elements.totalValue.textContent = '$0';
    }
  }

  hideEmptyState() {
    if (this.elements.emptyState) {
      this.elements.emptyState.style.display = 'none';
    }
  }

  showError(message) {
    this.hideLoading();
    if (this.elements.grid) {
      this.elements.grid.innerHTML = `
                <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <div style="font-size: 3rem; color: #e53e3e; margin-bottom: 1rem;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color: #2d3748; margin-bottom: 1rem;">Error al cargar tu lista</h3>
                    <p style="color: #718096; margin-bottom: 2rem;">${message}</p>
                    <button onclick="window.location.reload()" class="browse-products-btn" style="background: #2d5016; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-refresh"></i> Intentar de nuevo
                    </button>
                </div>
            `;
    }
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : '#4299e1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-family: 'Poppins', sans-serif;
        `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize the wishlist page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WishlistPage();
});

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeInUp 0.6s ease forwards;
        opacity: 0;
        transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .wishlist-card {
        transition: all 0.3s ease;
    }
    
    .notification {
        font-size: 0.9rem;
        line-height: 1.4;
    }
`;
document.head.appendChild(style);
