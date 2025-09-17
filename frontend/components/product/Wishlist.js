// Wishlist.js - Componente web para lista de deseos

class Wishlist extends HTMLElement {
  constructor() {
    super();
    this.wishlistItems = [];
  }

  connectedCallback() {
    this.render();
    this.fetchWishlist();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
            <div class="wishlist">
                <div class="wishlist-header">
                    <h2>Mi Lista de Deseos</h2>
                    <p class="wishlist-count"><span id="wishlist-count">0</span> productos</p>
                </div>
                
                <div id="wishlist-content">
                    <div class="wishlist-loading">Cargando lista de deseos...</div>
                </div>
            </div>
        `;
  }

  setupEventListeners() {
    // Escuchar eventos de actualización de la lista de deseos
    window.addEventListener('wishlistUpdated', () => {
      this.fetchWishlist();
    });
  }

  async fetchWishlist() {
    try {
      // En un entorno real, esto haría una llamada a la API
      // const response = await fetch('/api/wishlist', {
      //     headers: {
      //         'Authorization': `Bearer ${token}`
      //     }
      // });
            
      // Simular datos de la lista de deseos
      const data = {
        items: [
          {
            id: 1,
            product_id: 101,
            name: 'Ramo de Rosas Rojas',
            price: 15990,
            image: '/assets/images/products/ramo-rosas.jpg',
            in_stock: true
          },
          {
            id: 2,
            product_id: 102,
            name: 'Arreglo Floral Primavera',
            price: 24990,
            image: '/assets/images/products/arreglo-primavera.jpg',
            in_stock: true
          }
        ]
      };
            
      this.wishlistItems = data.items;
      this.displayWishlist();
    } catch (error) {
      console.error('Error al obtener la lista de deseos:', error);
      this.displayError('Error al cargar la lista de deseos');
    }
  }

  displayWishlist() {
    const wishlistContent = this.querySelector('#wishlist-content');
    const wishlistCount = this.querySelector('#wishlist-count');
        
    if (!wishlistContent || !wishlistCount) return;
        
    wishlistCount.textContent = this.wishlistItems.length;
        
    if (this.wishlistItems.length === 0) {
      wishlistContent.innerHTML = `
                <div class="wishlist-empty">
                    <i class="fas fa-heart" style="font-size: 3rem; color: var(--light-400); margin-bottom: 1rem;"></i>
                    <h3>Tu lista de deseos está vacía</h3>
                    <p>¡Agrega productos que te gusten para encontrarlos fácilmente más tarde!</p>
                    <a href="/products.html" class="btn btn-primary">Ver Productos</a>
                </div>
            `;
      return;
    }
        
    const wishlistHTML = `
            <div class="wishlist-items">
                ${this.wishlistItems.map(item => `
                    <div class="wishlist-item" data-product-id="${item.product_id}">
                        <div class="wishlist-item-image">
                            <img src="${item.image || '/assets/images/placeholder.svg'}" alt="${item.name}">
                        </div>
                        <div class="wishlist-item-details">
                            <h3 class="wishlist-item-name">${item.name}</h3>
                            <p class="wishlist-item-price">$${item.price ? item.price.toLocaleString() : '0'}</p>
                            <p class="wishlist-item-stock ${item.in_stock ? 'in-stock' : 'out-of-stock'}">
                                ${item.in_stock ? 'En stock' : 'Agotado'}
                            </p>
                        </div>
                        <div class="wishlist-item-actions">
                            <button class="btn btn-primary add-to-cart" data-product-id="${item.product_id}">
                                Agregar al Carrito
                            </button>
                            <button class="btn btn-outline remove-from-wishlist" data-product-id="${item.product_id}">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    wishlistContent.innerHTML = wishlistHTML;
    this.attachItemEventListeners();
  }

  attachItemEventListeners() {
    // Añadir al carrito
    const addToCartButtons = this.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        this.addToCart(productId);
      });
    });
        
    // Remover de la lista de deseos
    const removeButtons = this.querySelectorAll('.remove-from-wishlist');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.closest('.remove-from-wishlist').getAttribute('data-product-id');
        this.removeFromWishlist(productId);
      });
    });
  }

  displayError(message) {
    const wishlistContent = this.querySelector('#wishlist-content');
    if (wishlistContent) {
      wishlistContent.innerHTML = `
                <div class="wishlist-error">
                    <p>${message}</p>
                    <button class="btn btn-primary" id="retry-wishlist">Reintentar</button>
                </div>
            `;
            
      const retryButton = this.querySelector('#retry-wishlist');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.fetchWishlist();
        });
      }
    }
  }

  async addToCart(productId) {
    try {
      // En un entorno real, esto haría una llamada a la API
      // const response = await fetch('/api/cart', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //         'Authorization': `Bearer ${token}`
      //     },
      //     body: JSON.stringify({ product_id: productId, quantity: 1 })
      // });
            
      this.showNotification('Producto agregado al carrito', 'success');
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      this.showNotification('Error al agregar el producto al carrito', 'error');
    }
  }

  async removeFromWishlist(productId) {
    try {
      // En un entorno real, esto haría una llamada a la API
      // const response = await fetch(`/api/wishlist/${productId}`, {
      //     method: 'DELETE',
      //     headers: {
      //         'Authorization': `Bearer ${token}`
      //     }
      // });
            
      // Actualizar la lista local
      this.wishlistItems = this.wishlistItems.filter(item => item.product_id != productId);
      this.displayWishlist();
      this.showNotification('Producto eliminado de la lista de deseos', 'success');
            
      // Disparar evento para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
      console.error('Error al eliminar de la lista de deseos:', error);
      this.showNotification('Error al eliminar el producto de la lista de deseos', 'error');
    }
  }

  showNotification(message, type) {
    // Crear contenedor de notificaciones si no existe
    if (!document.querySelector('#wishlist-notifications')) {
      const notificationsContainer = document.createElement('div');
      notificationsContainer.id = 'wishlist-notifications';
      notificationsContainer.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 10000;
            `;
      document.body.appendChild(notificationsContainer);
    }
        
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `wishlist-notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ${type === 'success' ? 'background-color: #4CAF50;' : ''}
            ${type === 'error' ? 'background-color: #F44336;' : ''}
        `;
        
    document.querySelector('#wishlist-notifications').appendChild(notification);
        
    // Eliminar notificación después de 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// Registrar el componente
customElements.define('wishlist-component', Wishlist);

export default Wishlist;